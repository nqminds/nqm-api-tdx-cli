const fs = require("fs");

async function getResourceStream(resourceId, api) {
  const output = await api.downloadResource(resourceId);
  if (output.status === 200) return output.body;
  else throw Error(output.statusText);
}

async function downloadToFile(resourceStream, filepath) {
  const file = fs.createWriteStream(filepath);
  resourceStream.on("end", () => file.end());
  resourceStream.pipe(file);
}

async function downloadResource({id, filepath, api}) {
  const resourceStream = await getResourceStream(id, api);
  if (filepath) await downloadToFile(resourceStream, filepath);
  else resourceStream.pipe(process.stdout);
}

module.exports = {
  downloadResource,
};
