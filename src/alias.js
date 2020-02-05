const {
  checkValidAlias,
  writeJsonToFile,
} = require("./utils");

function listAliases(configs) {
  return Object.keys(configs);
}

async function copyAliasConfig({appConfig, alias, aliasName, configPath}) {
  const aliases = listAliases(appConfig.tdxConfigs);
  if (!checkValidAlias(aliasName)) {
    throw Error("Invalid alias name.");
  }

  if (aliases.includes(aliasName)) {
    throw Error("Alias already exists.");
  } else {
    return modifyAliasConfig({
      appConfig,
      aliasName,
      aliasConfig: appConfig.tdxConfigs[alias],
      configPath,
    });
  }
}

async function modifyAliasConfig({appConfig, aliasName, aliasConfig, configPath}) {
  appConfig.tdxConfigs[aliasName] = aliasConfig;
  return writeJsonToFile(appConfig, configPath);
}

async function removeAliasConfig({appConfig, aliasName, configPath}) {
  if (!(aliasName in appConfig.tdxConfigs)) throw Error("Alias configuration doesn't exist.");

  delete appConfig.tdxConfigs[aliasName];
  return writeJsonToFile(appConfig, configPath);
}

module.exports = {
  listAliases,
  copyAliasConfig,
  modifyAliasConfig,
  removeAliasConfig,
};
