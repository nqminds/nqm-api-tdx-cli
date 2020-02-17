const nqmUtils = require("@nqminds/nqm-core-utils");
const {readJsonFromFile} = require("./utils");

async function runDatabotCommand({api, command, id, configJson}) {
  switch (command) {
    case "start":
      const functionPayload = await readJsonFromFile(configJson);
      return api.startDatabotInstance(id, functionPayload);
    case "stop":
      return api.stopDatabotInstance(id, nqmUtils.constants.stopDatabotInstance);
    case "abort":
      return api.abortDatabotInstance(id);
    default:
      throw Error("Unknown databot command.");
  }
}

module.exports = {
  runDatabotCommand,
};
