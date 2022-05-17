const path = require("path");
const CACHE_FILE = "cache.json";
const CACHE_PATH = path.join(__dirname, CACHE_FILE);

module.exports = {
  CACHE_FILE,
  CACHE_PATH,
};
