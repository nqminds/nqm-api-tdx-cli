const nqmUtils = require("@nqminds/nqm-core-utils");
const {readJsonFromFile} = require("./utils");
async function stop(api, id) {
  try {
    await api.stopDatabotInstance(id, nqmUtils.constants.stopDatabotInstance);
  // eslint-disable-next-line no-empty
  } catch (error) {
    console.log(error);
  }
}
async function deploy({id, resourceId, configJson, filepath, api}) {
  const functionPayload = await readJsonFromFile(configJson);
  const databotInstanceId = functionPayload.id || "";
  await stop(api, databotInstanceId);
}

module.exports = {
  deploy,
};
