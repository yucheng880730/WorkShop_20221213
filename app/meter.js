'use strict';

const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');

const meterProvider = new MeterProvider({
    exporter: new PrometheusExporter({ port: 9090 }),
    interval: 1000,
});

module.exports = meterProvider.getMeter('prometheus');