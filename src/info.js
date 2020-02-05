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

async function getInfo({api, id, type}) {
  type = type || "";
  id = id || "";
  switch (type) {
    case "":
    case "account":
      return getAccountInfo(api);
    case "serverfolderid":
      return getServerFolderId(id);
    case "databotsid":
      return getDatabotsIds(api);
  }
}

module.exports = {
  getInfo,
};
