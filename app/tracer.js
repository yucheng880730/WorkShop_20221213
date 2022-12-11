'use strict';

const process = require('process');
const opentelemetry = require('@opentelemetry/api');
const { NodeSDK, resources } = require('@opentelemetry/sdk-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { JaegerPropagator } = require('@opentelemetry/propagator-jaeger');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
    resource: new resources.Resource({ 'service.name': 'js-express' }),
    traceExporter: new JaegerExporter({ host: 'localhost', port: 6832 }),
    textMapPropagator: new JaegerPropagator(),
    instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
process.on('exit', () => sdk.shutdown());

module.exports = opentelemetry.trace.getTracer("express");