const JSZip = require("jszip");
const fg = require("fast-glob");
const path = require("path");
const fs = require("fs/promises");
const { version } = require("./package.json");

(async () => {
  const filePaths = await fg(path.join(__dirname, "workflow", "*"));

  const zip = new JSZip();

  await Promise.all(
    filePaths.map(async (filePath) => {
      const file = await fs.readFile(filePath);
      const filename = filePath.split("/").pop();
      zip.file(filename, file);
    })
  );
  const zipblob = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFile(
    path.join(__dirname, `njt-alfred-workflow${version}.alfredworkflow`),
    zipblob
  );
})();
