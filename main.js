/* eslint-disable no-console */
"use strict";

const os = require("os");
const path = require("path");
const appConfig = require("./config.app.json");
const defaultConfig = require("./config.default.json");
const {TDX_CURRENT_ALIAS, TDX_CREDENTIALS} = require("./src/constants");
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
  mkdir,
} = require("./src/utils");
const {
  copyAliasConfig,
  modifyAliasConfig,
  removeAliasConfig,
} = require("./src/alias");
const CommandHandler = require("./src");

const homePath = os.homedir();
const tdxcliConfigPath = path.join(homePath, ".tdxcli");
const envPath = path.join(tdxcliConfigPath, ".env");
const configPath = path.join(tdxcliConfigPath, "config.json");

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
    credentials: numberToString(argv.credentials || ""),
    apiArgs: filterObjectByIdentifier(argv, "@"),
    apiArgsStringify: filterListByIdentifier(argv._.slice(1), "@"),
  };

  await run(command, commandProps);
}

async function run(commandName, commandProps) {
  let alias = commandProps.alias;
  let credentials = commandProps.credentials;
  const {
    id, secret, type, command, filepath,
    aliasName, configJson, apiArgs, apiArgsStringify,
  } = commandProps;

  try {
    await mkdir(tdxcliConfigPath);
    await createFile(envPath);
    await createFile(configPath, JSON.stringify(defaultConfig, null, 2));

    if (alias === "") alias = envToAlias(process.env[TDX_CURRENT_ALIAS] || "");
    if (credentials === "") credentials = process.env[TDX_CREDENTIALS] || "";

    if (commandName !== "list" && !checkValidAlias(alias)) {
      throw Error("No alias or wrong alias name. Only allowed [a-zA-Z0-9_]");
    }

    const tdxConfigs = await readJsonFromFile(configPath);
    const argumentSecret = {id, secret};
    const configArgs = {tdxConfig: tdxConfigs[alias] || {}, timeout: appConfig.scraperTimeout};
    let commandHandler;

    if (commandName !== "signin" && credentials) {
      commandHandler = new CommandHandler({
        secret: base64ToJson(credentials),
        token: "",
        ...configArgs,
      });
    } else {
      commandHandler = new CommandHandler({
        secret: base64ToJson(process.env[getSecretAliasName(alias)] || ""),
        token: process.env[getTokenAliasName(alias)],
        ...configArgs,
      });
    }

    let output;
    switch (commandName) {
      case "signin":
        await commandHandler.signin(argumentSecret);

        setEnv({key: TDX_CURRENT_ALIAS, value: aliasToEnv(alias), envPath});
        // Store the argument secret
        if (argumentSecret.id) setEnv({key: getSecretAliasName(alias), value: jsonToBase64(argumentSecret), envPath});
        setEnv({key: getTokenAliasName(alias), value: commandHandler.getToken(), envPath});
        output = "OK";
        break;
      case "signout":
        await commandHandler.signout();
        setEnv({key: getTokenAliasName(alias), value: "", envPath});
        setEnv({key: getSecretAliasName(alias), value: "", envPath});
        break;
      case "info":
        output = await commandHandler.getInfo({id, type});
        break;
      case "config":
        output = tdxConfigs[alias] || {};
        break;
      case "list":
        output = await commandHandler.getList({
          type,
          alias,
          tdxConfigs,
          env: process.env,
        });
        break;
      case "runapi":
        output = await commandHandler.runApi({command, apiArgs, apiArgsStringify});
        output = JSON.stringify(output, null, 2);
        break;
      case "download":
        await commandHandler.download(id, filepath);
        break;
      case "upload":
        output = await commandHandler.upload(id, filepath);
        break;
      case "copyalias":
        await copyAliasConfig({tdxConfigs, alias, copyAliasName: aliasName, configPath});
        output = "OK";
        break;
      case "modifyalias":
        const aliasConfig = await readJsonFromFile(configJson);
        await modifyAliasConfig({tdxConfigs, aliasName, aliasConfig, configPath});
        output = "OK";
        break;
      case "removealias":
        if (alias === aliasName) throw Error("Can't remove the running alias.");
        await removeAliasConfig({tdxConfigs, aliasName, configPath});
        output = "OK";
        break;
      case "databot":
        output = await commandHandler.runDatabotCommand({command, id, configJson});
        break;
      case "token":
        output = await commandHandler.runTokenCommand(command);
        break;
      case "deploy":
        output = await commandHandler.deploy({id, configJson, filepath});
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
  .command("list [type]", "List all configured aliases or secrets", {}, argumentHandler)
  .command("token <command>", "Get or revoke a token for a give alias", {}, argumentHandler)
  .command("runapi <command>", "Run a tdx api command", {}, argumentHandler)
  .command("download <id> [filepath]", "Download resource", {}, argumentHandler)
  .command("upload <id> <filepath>", "Upload resource", {}, argumentHandler)
  .command("copyalias <aliasname>", "Makes a copy of an existing alias configuration", {}, argumentHandler)
  .command("modifyalias <aliasname> <configjson>", "Modifies an existing alias configuration", {}, argumentHandler)
  .command("removealias <aliasname>", "Removes an existing alias configuration", {}, argumentHandler)
  .command("databot <command> <id> [configjson]", "Starts, stops or aborts a databot instance", {}, argumentHandler)
  .command("deploy <id> <configjson> <filepath>", "Deploys a databot abort->upload->start", {}, argumentHandler)
  .demandCommand(1, 1, "You need at least one command to run.")
  .option("a", {
    alias: "alias",
    nargs: 1,
    describe: "Alias name",
    type: "string",
    requiresArg: true,
  })
  .option("c", {
    alias: "credentials",
    nargs: 1,
    describe: "TDX credentials {id:\"\",secret:\"\"} in base64",
    type: "string",
    requiresArg: true,
  })
  .help("h")
  .alias("h", "help")
  .alias("v", "version")
  .epilog("Copyright Nquiringminds Ltd. 2020")
  .wrap(102)
  .argv;

module.exports = argv;
