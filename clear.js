const [fs, { CACHE_PATH }] = [require("fs/promises"), require("./constants")];

fs.unlink(CACHE_PATH);
