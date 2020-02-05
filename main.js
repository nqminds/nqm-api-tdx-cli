/* eslint-disable no-console */
"use strict";

const packageJson = require("./package.json");
const appConfig = require("./config.json");
const {TDX_CURRENT_ALIAS} = require("./src/constants");
const {
  checkValidAlias,
  envToAlias,
  getSecretAliasName,
  getTokenAliasName,
  base64ToJson,
  setEnv,
  aliasToEnv,
  jsonToBase64,
  filterObjectByIdentifier,
  filterListByIdentifier,
  readJsonFromFile,
  numberToString,
  createFile,
  getEnvPath,
} = require("./src/utils");
const {
  listAliases,
  copyAliasConfig,
  modifyAliasConfig,
  removeAliasConfig,
} = require("./src/alias");
const CommandHandler = require("./src");

const envPath = getEnvPath(process.argv[1], packageJson.bin.tdxcli);
require("dotenv").config({path: envPath});

async function argumentHandler(argv) {
  const command = argv._[0];
  const commandProps = {
    alias: numberToString(argv.alias || ""),
    id: numberToString(argv.id || ""),
    secret: numberToString(argv.secret || ""),
    type: numberToString(argv.type || ""),
    command: numberToString(argv.command || ""),
    filepath: numberToString(argv.filepath || ""),
    aliasName: numberToString(argv.aliasname || ""),
    configJson: numberToString(argv.configjson || ""),
    instanceId: numberToString(argv.instanceid || ""),
    databotId: numberToString(argv.databotid || ""),
    apiArgs: filterObjectByIdentifier(argv, "@"),
    apiArgsStringify: filterListByIdentifier(argv._.slice(1), "@"),
  };

  await run(command, commandProps);
}

async function run(commandName, commandProps) {
  let alias = commandProps.alias;
  const {
    id, secret, type, command, filepath,
    aliasName, configJson, instanceId, databotId,
  } = commandProps;

  try {
    await createFile(envPath);

    if (alias === "") alias = envToAlias(process.env[TDX_CURRENT_ALIAS] || "");
    if (!alias) throw Error("No alias defined.");
    if (!checkValidAlias(alias)) throw Error("Wrong alias name. Only allowed [a-zA-Z0-9_]");

    const argumentSecret = {id, secret};
    const storedSecret = base64ToJson(process.env[getSecretAliasName(alias)] || "");
    const storedToken = process.env[getTokenAliasName(alias)];
    const tdxConfig = appConfig.tdxConfigs[alias] || {};

    const commandHandler = new CommandHandler({
      tdxConfig,
      secret: storedSecret,
      token: storedToken,
      timeout: appConfig.scraperTimeout,
    });

    let output;
    switch (commandName) {
      case "signin":
        await commandHandler.handleSignin(argumentSecret);

        setEnv({key: TDX_CURRENT_ALIAS, value: aliasToEnv(alias), envPath});
        // Store the argument secret
        if (argumentSecret.id) setEnv({key: getSecretAliasName(alias), value: jsonToBase64(argumentSecret), envPath});
        setEnv({key: getTokenAliasName(alias), value: commandHandler.getToken(), envPath});
        output = "OK";
        break;
      case "signout":
        commandHandler.handleSignout();
        setEnv({key: getTokenAliasName(alias), value: "", envPath});
        setEnv({key: getSecretAliasName(alias), value: "", envPath});
        break;
      case "info":
        output = await commandHandler.handleInfo({id, type});
        break;
      case "config":
        output = tdxConfig;
        break;
      case "list":
        output = {
          default: alias,
          aliases: listAliases(appConfig.tdxConfigs),
        };
        break;
      case "runapi":
        output = await commandHandler.handleRunApi({
          command,
          apiArgs: commandProps.apiArgs,
          apiArgsStringify: commandProps.apiArgsStringify,
        });
        output = JSON.stringify(output, null, 2);
        break;
      case "download":
        await commandHandler.handleDownload(id, filepath);
        break;
      case "upload":
        output = await commandHandler.handleUpload(id, filepath);
        output = "OK";
        break;
      case "copyalias":
        await copyAliasConfig({
          appConfig,
          alias,
          aliasName,
          configFileName: "./config.json",
        });
        output = "OK";
        break;
      case "modifyalias":
        const aliasConfig = await readJsonFromFile(configJson);
        await modifyAliasConfig({
          appConfig,
          modifyAlias: aliasName,
          aliasConfig,
          configFileName: "./config.json",
        });
        output = "OK";
        break;
      case "removealias":
        if (alias === aliasName) throw Error("Can't remove the running alias.");
        await removeAliasConfig({
          appConfig,
          aliasName,
          configFileName: "./config.json",
        });
        output = "OK";
        break;
      case "abortdatabot":
        output = await commandHandler.handleAbortDatabot(instanceId);
        break;
      case "stopdatabot":
        output = await commandHandler.handleStopDatabot(instanceId);
        break;
      case "startdatabot":
        const functionPayload = await readJsonFromFile(configJson);
        output = await commandHandler.handleStartDatabot(databotId, functionPayload);
        break;
    }

    if (output) console.log(output);
  } catch (error) {
    console.error(error);
    process.exit(-1);
  }
}

const argv = require("yargs")
  .parserConfiguration({
    "parse-numbers": true,
  })
  .usage("Usage: $0 <command> [options]")
  .command("signin [id] [secret]", "Sign in to tdx", {}, argumentHandler)
  .command("signout", "Sign out of tdx", {}, argumentHandler)
  .command("info [type] [id]", "Output current account info", {}, argumentHandler)
  .command("config", "Output tdx config", {}, argumentHandler)
  .command("list", "List all configured aliases", {}, argumentHandler)
  .command("runapi <command>", "Run a tdx api command", {}, argumentHandler)
  .command("download <id> [filepath]", "Download resource", {}, argumentHandler)
  .command("upload <id> <filepath>", "Upload resource", {}, argumentHandler)
  .command("copyalias <aliasname>", "Makes a copy of an existing alias configuration", {}, argumentHandler)
  .command("modifyalias <aliasname> <configjson>", "Modifies an existing alias configuration", {}, argumentHandler)
  .command("removealias <aliasname>", "Removes an existing alias configuration", {}, argumentHandler)
  .command("abortdatabot <instanceid>", "Aborts a databot instance", {}, argumentHandler)
  .command("stopdatabot <instanceid>", "Stops a databot instance", {}, argumentHandler)
  .command("startdatabot <databotid> <configjson>", "Starts a databot instance", {}, argumentHandler)
  .demandCommand(1, 1, "You need at least one command to run.")
  .option("a", {
    alias: "alias",
    nargs: 1,
    describe: "Alias name",
    type: "string",
    requiresArg: true,
  })
  .help("h")
  .alias("h", "help")
  .alias("v", "version")
  .epilog("Copyright Nquiringminds Ltd. 2019")
  .wrap(102)
  .argv;

module.exports = argv;
