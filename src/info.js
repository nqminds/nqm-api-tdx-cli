const nqmUtils = require("@nqminds/nqm-core-utils");
const jwt = require("jsonwebtoken");

function getAccountInfo(api) {
  const decoded = jwt.decode(api.accessToken);
  return api.getAccount(decoded.sub);
}

function getServerFolderId(id) {
  return nqmUtils.shortHash(
    nqmUtils.constants.applicationServerDataFolderPrefix + id
  );
}

async function getDatabotsIds(api) {
  const filter = {
    baseType: nqmUtils.constants.databotBaseType,
  };
  const result = await api.getResources(filter, {name: 1, id: 1, owner: 1}, {});
  return JSON.stringify(result, 0, 2);
}

async function getAppUrl({api, id, tdxConfig}) {
  const instance = await api.getDatabotInstance(id);
  const urlProtocol = tdxConfig.config.tdxServer.split(":")[0];
  const urlComponents = tdxConfig.config.tdxServer.split(".");
  return `${urlProtocol}://${instance.subDomain}.${urlComponents.slice(1).join(".")}`;
}

async function getInfo({api, id = "", type = "", tdxConfig}) {
  switch (type) {
    case "":
    case "account":
      return getAccountInfo(api);
    case "serverfolderid":
      return getServerFolderId(id);
    case "databotsid":
      return getDatabotsIds(api);
    case "appurl":
      return getAppUrl({api, id, tdxConfig});
    default:
      throw Error("Unknow info type term.")
  }
}

module.exports = {
  getInfo,
};
