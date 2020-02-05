const nqmUtils = require("@nqminds/nqm-core-utils");

async function abortDatabot(api, id) {
  return api.abortDatabotInstance(id);
}

async function stopDatabot(api, id) {
  return api.stopDatabotInstance(id, nqmUtils.constants.stopDatabotInstance);
}

async function startDatabot({api, id, functionPayload}) {
  return api.startDatabotInstance(id, functionPayload);
}

module.exports = {
  abortDatabot,
  stopDatabot,
  startDatabot,
};
