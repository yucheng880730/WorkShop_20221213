'use strict';

const process = require('process');
const winston = require('winston');
const expressWinston = require('express-winston');
const opentelemetry = require('@opentelemetry/api');

const tracer = require('./tracer.js');
const meter = require('./meter.js');

const express = require('express');
const app = express();

app.use(expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
    msg: "{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    meta: true,
    dynamicMeta: (req, res) => ({ traceId: opentelemetry.trace.getSpanContext(opentelemetry.context.active()).traceId }),
}));

const httpRequestsCounter = meter.createCounter("http_requests", {
    description: "Count all incoming requests"
});
app.use((req, res, next) => {
    next()
    httpRequestsCounter.add(1, { 'path': req.path, 'code': res.statusCode })
})

app.get('/', (req, res) => res.send('OK'))

app.get('/hello', async (req, res) => {
    res.send(`hello ${process.env['NAME']}!`)
})

app.get('/error', (req, res) => {
    res.status(500).send({ error: 'Something failed!' });
})

app.get('/delay', async (req, res) => {
    const span = tracer.startSpan("random delay")
    const delay = Math.floor(Math.random() * 5000)
    await new Promise((resolve) => setTimeout(() => resolve('done'), delay))
    span.end()
    res.send(`delay ${delay}ms`)
})

app.listen(3000);
