const redis = require("redis");
const util = require("util");
const port = 6379;
const host = "127.0.0.1";
const client = redis.createClient(port, host);

client.connect();

const addCache = async (type, data) => {
  await client.set(type, JSON.stringify(data), {
    EX: type == "sources" ? 86400 : 3600,
  });
};

checkForChache = async (type) => {
  const cacheValue = await client.get(type);
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);
    return Object.values(doc);
  } else {
    return [];
  }
};
module.exports = { addCache, checkForChache };
