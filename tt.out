"use strict";
require("dotenv").config();


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
} = require("./src/utils");

const CommandHandler = require("./src/command-handler");

async function argumentHandler(argv) {
  const command = argv._[0];
  const commandProps = {
    alias: argv.alias || "",
    id: argv.id || "",
    secret: argv.secret || "",
    name: argv.name || "",
    apiArgs: filterObjectByIdentifier(argv, "@"),
    apiArgsStringify: filterListByIdentifier(argv._.slice(1), "@"),
  };

  await run(command, commandProps);
}

function listAliases(configs) {
  return Object.keys(configs);
}

async function run(commandName, commandProps) {
  const envAlias = envToAlias(process.env[TDX_CURRENT_ALIAS] || "");
  const commandAlias = commandProps.alias;
  const alias = (commandAlias === "") ? envAlias : commandAlias;

  try {
    if (!alias) throw Error("No alias defined.");
    if (!checkValidAlias(alias)) throw Error("Wrong alias name. Only allowed [a-zA-Z0-9_]");

    const argumentSecret = {id: commandProps.id, secret: commandProps.secret};
    const storedSecret = base64ToJson(process.env[getSecretAliasName(alias)] || "");
    const storedToken = process.env[getTokenAliasName(alias)];
    const tdxConfig = appConfig.tdxConfigs[alias] || {};

    const commandHandler = new CommandHandler({
      tdxConfig,
      secret: storedSecret,
      token: storedToken,
      timeout: 5000,
    });

    let output;
    switch (commandName) {
      case "signin":
        await commandHandler.handleSignin(argumentSecret);

        setEnv(TDX_CURRENT_ALIAS, aliasToEnv(alias));
        // Store the argument secret
        if (argumentSecret.id) setEnv(getSecretAliasName(alias), jsonToBase64(argumentSecret));
        setEnv(getTokenAliasName(alias), commandHandler.getToken());
        console.log("OK");
        break;
      case "signout":
        commandHandler.handleSignout();
        setEnv(getTokenAliasName(alias), "");
        setEnv(getSecretAliasName(alias), "");
        break;
      case "info":
        output = await commandHandler.handleInfo();
        console.log(output);
        break;
      case "config":
        console.log(tdxConfig);
        break;
      case "list":
        console.log(listAliases(appConfig.tdxConfigs));
        break;
      case "runapi":
        output = await commandHandler.handleRunApi({
          name: commandProps.name,
          apiArgs: commandProps.apiArgs,
          apiArgsStringify: commandProps.apiArgsStringify,
        });
        console.log(output);
        break;
      case "download":
        await commandHandler.handleDownload(commandProps.id, commandProps.name);
        break;
      case "upload":
        output = await commandHandler.handleUpload(commandProps.id, commandProps.name);
        console.log(output);
        break;
    }
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
  .command("signin", "Sign in to tdx", {}, argumentHandler)
  .command("signout", "Sign out of tdx", {}, argumentHandler)
  .command("info", "Output current account info", {}, argumentHandler)
  .command("config", "Output tdx config", {}, argumentHandler)
  .command("list", "List all configured aliases", {}, argumentHandler)
  .command("runapi", "Run a tdx api command", {}, argumentHandler)
  .command("download", "Download resource", {}, argumentHandler)
  .command("upload", "Upload resource", {}, argumentHandler)
  .demandCommand(1, 1, "You need at least one command to run.")
  .option("a", {
    alias: "alias",
    nargs: 1,
    describe: "Alias name",
    type: "string",
    requiresArg: true,
  })
  .option("i", {
    alias: "id",
    nargs: 1,
    describe: "Resource or account id",
    type: "string",
    requiresArg: true,
  })
  .option("s", {
    alias: "secret",
    nargs: 1,
    describe: "Secret value",
    type: "string",
    requiresArg: true,
  })
  .option("n", {
    alias: "name",
    nargs: 1,
    describe: "API command or resource name",
    type: "string",
    requiresArg: true,
  })
  .help("h")
  .alias("h", "help")
  .alias("v", "version")
  .epilog("Copyright Nquiringminds Ltd. 2019")
  .argv;

module.exports = argv;
