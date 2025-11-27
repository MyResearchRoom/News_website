const { redis_host, redis_port } = require("../config/config");

module.exports = {
  connection: {
    host: redis_host || "127.0.0.1",
    port: redis_port ? parseInt(redis_port) : 6379,
    maxRetriesPerRequest: null,
  },
};
