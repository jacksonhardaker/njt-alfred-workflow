const [https, fs, { CACHE_PATH }] = [
  require("https"),
  require("fs/promises"),
  require("./constants"),
];

let [, , input = ""] = process.argv;
input = input.trimStart();
let [cmd, query = ""] = input.split(" ");

const fetchFromRemote = () => {
  return new Promise((resolve, reject) => {
    https
      .get(
        "https://raw.githubusercontent.com/kachkaev/njt/main/README.md",
        (res) => {
          let dataBuffer = [];

          res.on("data", (chunk) => {
            dataBuffer.push(chunk);
          });

          res.on("end", () => {
            resolve(Buffer.concat(dataBuffer).toString());
          });
        }
      )
      .on("error", reject);
  });
};

(async () => {
  let output = { items: [] };
  try {
    const stats = await fs.stat(CACHE_PATH);
    const lastModifiedWithinHour =
      Math.abs(stats.mtimeMs - Date.now()) / 36e5 <= 1;

    if (lastModifiedWithinHour) {
      const fromDisk = await fs.readFile(CACHE_PATH);
      output = JSON.parse(fromDisk.toString());
    } else {
      console.log("err");
      throw Error("Cached items expired.");
    }
  } catch {
    const md = await fetchFromRemote();
    const [destinationsBlock] = md.match(
      /(\#\#\sAvailable\sdestinations)[^#]*/
    );
    const destinations = destinationsBlock.match(/(-\s`[a-z.]`\s→\s[^\n]+)/g);
    const njtCommands = destinations.map((line) => {
      const [, key, subtitle] = line.match(/`([a-z.])`\s→\s(.*)$/);
      return { arg: `${key}`, title: `${key} <package>`, subtitle };
    });
    output = {
      items: [
        ...njtCommands,
        { arg: "clear", title: "clear", subtitle: "Clear cached commands" },
      ],
    };

    fs.writeFile(CACHE_PATH, JSON.stringify(output));
  }

  output.items = output.items.filter(({ title }) =>
    title.match(RegExp(`^${cmd}`))
  );

  output.items = output.items.map((item) => ({
    ...item,
    arg: `${item.arg} ${query}`.trim(),
  }));

  console.log(JSON.stringify(output));
})();
