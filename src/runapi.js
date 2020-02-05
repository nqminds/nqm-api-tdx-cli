const apiCommands = require("./tdx-api-commands");

function objectToListMapper(obj) {
  return Object.keys(obj).sort().map((element) => ([element, Number(element)]));
}

function stringifyArgumentValue(args, keyList) {
  if (keyList.length > 1) {
    const key = keyList.shift();
    if (key in args) stringifyArgumentValue(args[key], keyList);
  } else if (keyList.length === 1) {
    const key = keyList.shift();
    if (key in args) {
      args[key] = (typeof args[key] === "number") ?
        args[key].toString() :
        args[key];
    }
  }
}

function stringifyArguments(apiArgs, apiArgsStringify) {
  apiArgsStringify.forEach((element) => stringifyArgumentValue(apiArgs, element.split(".")));
}

function getFunctionArguments(args) {
  const mapper = objectToListMapper(args);
  let fullArgs = [];

  mapper.forEach((element) => {
    const argument = args[element[0]];
    const argumentIdx = element[1];
    const nullArrayLength = argumentIdx - fullArgs.length - 1;
    const nullArray = Array((nullArrayLength >= 0) ? nullArrayLength : 0).fill(null);
    fullArgs = fullArgs.concat(nullArray, [argument]);
  });

  return fullArgs;
}

function getFullArgs(apiArgs, apiArgsStringify) {
  stringifyArguments(apiArgs, apiArgsStringify);
  return getFunctionArguments(apiArgs);
}

async function runApi({command, apiArgs, apiArgsStringify, api}) {
  if (command === "") return apiCommands;

  if (command in apiCommands) {
    const fullArgs = getFullArgs(apiArgs, apiArgsStringify);
    return api[command](...fullArgs);
  } else throw Error("Unknow API command.");
}

module.exports = {
  runApi,
  objectToListMapper,
  getFunctionArguments,
  stringifyArgumentValue,
  stringifyArguments,
  getFullArgs,
};
