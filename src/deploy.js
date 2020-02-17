const nqmUtils = require("@nqminds/nqm-core-utils");
const {readJsonFromFile} = require("./utils");
const {uploadResource} = require("./upload");

async function stop(api, id) {
  try {
    await api.stopDatabotInstance(id, nqmUtils.constants.stopDatabotInstance);
  // eslint-disable-next-line no-empty
  } catch (error) {
    // console.log(error);
  }
}
async function deploy({id, resourceId, configJson, filepath, api}) {
  const startPayload = await readJsonFromFile(configJson);
  const databotInstanceId = startPayload.id || "";
  await stop(api, databotInstanceId);
  await uploadResource({id: resourceId, filepath, api});
  return api.startDatabotInstance(id, startPayload);
}

module.exports = {
  deploy,
};
