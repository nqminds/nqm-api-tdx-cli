const fs = require("fs");

async function getResourceStream(resourceId, api) {
  const output = await api.downloadResource(resourceId);
  if (output.status === 200) return output.body;
  else throw Error(output.statusText);
}

async function downloadToFile(resourceStream, filepath) {
  const file = fs.createWriteStream(filepath);
  resourceStream.pipe(file);
}

async function streamToOutput(resourceStream) {
  resourceStream.pipe(process.stdout);
}

async function downloadResource({id, filepath, api}) {
  const resourceStream = await getResourceStream(id, api);
  if (filepath) return downloadToFile(resourceStream, filepath);
  else streamToOutput(resourceStream);
}

module.exports = {
  downloadResource,
};
