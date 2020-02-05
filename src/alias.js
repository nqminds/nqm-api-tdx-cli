const {
  checkValidAlias,
  writeJsonToFile,
} = require("./utils");

function listAliases(configs) {
  return Object.keys(configs);
}

async function copyAliasConfig({appConfig, alias, aliasName, configFileName}) {
  const aliases = listAliases(appConfig.tdxConfigs);
  if (aliasName === "" || !checkValidAlias(aliasName)) {
    throw Error("Invalid alias name.");
  }

  if (aliases.includes(aliasName)) {
    throw Error("Alias already exists.");
  } else {
    return modifyAliasConfig({
      appConfig,
      modifyAlias: aliasName,
      aliasConfig: appConfig.tdxConfigs[alias],
      configFileName,
    });
  }
}

async function modifyAliasConfig({appConfig, modifyAlias, aliasConfig, configFileName}) {
  appConfig.tdxConfigs[modifyAlias] = aliasConfig;
  return writeJsonToFile(appConfig, configFileName);
}

async function removeAliasConfig({appConfig, aliasName, configFileName}) {
  if (!(aliasName in appConfig.tdxConfigs)) throw Error("Alias configuration deosn't exist.");

  delete appConfig.tdxConfigs[aliasName];
  return writeJsonToFile(appConfig, configFileName);
}

module.exports = {
  listAliases,
  copyAliasConfig,
  modifyAliasConfig,
  removeAliasConfig,
};
