const {
  checkValidAlias,
  writeJsonToFile,
} = require("./utils");

function getAliasesArray(configs) {
  return Object.keys(configs);
}

async function copyAliasConfig({appConfig, alias, copyAliasName, configPath}) {
  const aliases = getAliasesArray(appConfig.tdxConfigs);

  if (!checkValidAlias(copyAliasName)) {
    throw Error("Invalid alias name.");
  }

  if (aliases.includes(copyAliasName)) {
    throw Error("Alias already exists.");
  } else {
    return modifyAliasConfig({
      appConfig,
      aliasName: copyAliasName,
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
  if (!(aliasName in appConfig.tdxConfigs)) {
    throw Error("Alias configuration doesn't exist.");
  }

  delete appConfig.tdxConfigs[aliasName];
  return writeJsonToFile(appConfig, configPath);
}

module.exports = {
  getAliasesArray,
  copyAliasConfig,
  modifyAliasConfig,
  removeAliasConfig,
};
