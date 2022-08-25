require("dotenv").config();
const pino = require("pino");
const pinoElastic = require("pino-elasticsearch");
const pinoms = require("pino-multi-stream").multistream;

const ecsFormat = require("@elastic/ecs-pino-format");

const streamToElastic = pinoElastic({
  index: "logs",
  consistency: "one",
  node: "http://localhost:9200",
  "es-version": 7,
  "flush-bytes": 10,
});
const pinoOptions = {
  level: process.env.PINO_LOG_LEVEL || "info",
};

const streams = [{ stream: process.stdout }, { stream: streamToElastic }];

module.exports = pino(ecsFormat(pinoOptions), pinoms(streams));
