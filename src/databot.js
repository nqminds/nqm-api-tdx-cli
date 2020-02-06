const nqmUtils = require("@nqminds/nqm-core-utils");
const {readJsonFromFile} = require("./utils");

async function abortDatabot(api, id) {
  return api.abortDatabotInstance(id);
}

async function stopDatabot(api, id) {
  return api.stopDatabotInstance(id, nqmUtils.constants.stopDatabotInstance);
}

async function startDatabot({api, id, functionPayload}) {
  return api.startDatabotInstance(id, functionPayload);
}

async function runDatabotCommand({api, command, id, configJson}) {
  switch (command) {
    case "start":
      const functionPayload = await readJsonFromFile(configJson);
      return startDatabot({api, id, functionPayload});
    case "stop":
      return stopDatabot(api, id);
    case "abort":
      return abortDatabot(api, id);
    default:
      throw Error("Unknown databot command.");
  }
}

module.exports = {
  runDatabotCommand,
};
