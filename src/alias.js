const {
  checkValidAlias,
  writeJsonToFile,
} = require("./utils");

function getAliasesArray(configs) {
  return Object.keys(configs);
}

async function copyAliasConfig({tdxConfigs, alias, copyAliasName, configPath}) {
  const aliases = getAliasesArray(tdxConfigs);

  if (!checkValidAlias(copyAliasName)) {
    throw Error("Invalid alias name.");
  }

  if (aliases.includes(copyAliasName)) {
    throw Error("Alias already exists.");
  } else {
    return modifyAliasConfig({
      tdxConfigs,
      aliasName: copyAliasName,
      aliasConfig: tdxConfigs[alias],
      configPath,
    });
  }
}

async function modifyAliasConfig({tdxConfigs, aliasName, aliasConfig, configPath}) {
  tdxConfigs[aliasName] = aliasConfig;
  await writeJsonToFile(tdxConfigs, configPath);
  return tdxConfigs[aliasName];
}

async function removeAliasConfig({tdxConfigs, aliasName, configPath}) {
  if (!(aliasName in tdxConfigs)) {
    throw Error("Alias configuration doesn't exist.");
  }

  delete tdxConfigs[aliasName];
  await writeJsonToFile(tdxConfigs, configPath);
  return aliasName;
}

module.exports = {
  getAliasesArray,
  copyAliasConfig,
  modifyAliasConfig,
  removeAliasConfig,
};
