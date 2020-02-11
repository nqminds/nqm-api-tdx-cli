# nqm-tdx-terminal-cli

<p align="center" id="badges">
  <a href="https://github.com/nqminds/nqm-tdx-terminal-cli/actions?query=workflow%3A%22Master+CI%22">
    <img alt="Test" src="https://github.com/nqminds/nqm-tdx-terminal-cli/workflows/Master%20CI/badge.svg">
  </a>
  <a href="https://www.npmjs.com/package/@nqminds/nqm-tdx-terminal-cli">
    <img alt="npm" src="https://img.shields.io/npm/v/@nqminds/nqm-tdx-terminal-cli">
  </a>
  <a href="https://www.npmjs.com/package/@nqminds/nqm-tdx-terminal-cli">
    <img alt="node" src="https://img.shields.io/node/v/@nqminds/nqm-tdx-terminal-cli">
  </a>
  <a href="https://nqminds.github.io/nqm-tdx-terminal-cli/">
    <img alt="Website" src="https://img.shields.io/website/https/nqminds.github.io/nqm-tdx-terminal-cli.svg">
  </a>
  <a href="https://github.com/nqminds/nqm-tdx-terminal-cli/issues">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/nqminds/nqm-tdx-terminal-cli">
  </a>  
</p>

Command-line interface for accessing the TDX API

## Install
The best use of tdxcli tool is to install it with npm globally as follows:
```bash
npm i -g nqm-tdx-terminal-cli
```
The client app can be accessed by running the command ```tdxcli```.

## Usage
```bash
Usage: tdxcli <command> [options]

Commands:
  tdxcli signin [id] [secret]                  Sign in to tdx
  tdxcli signout                               Sign out of tdx
  tdxcli info [type] [id]                      Output current account info
  tdxcli config                                Output tdx config
  tdxcli list [type]                           List all configured aliases or secrets
  tdxcli runapi <command>                      Run a tdx api command
  tdxcli download <id> [filepath]              Download resource
  tdxcli upload <id> <filepath>                Upload resource
  tdxcli copyalias <aliasname>                 Makes a copy of an existing alias configuration
  tdxcli modifyalias <aliasname> <configjson>  Modifies an existing alias configuration
  tdxcli removealias <aliasname>               Removes an existing alias configuration
  tdxcli databot <command> <id> [configjson]   Starts, stops or aborts a databot instance
  tdxcli token <command>                       Get or revoke a token for a give alias

Options:
  -a, --alias        Alias name                                                               [string]
  -c, --credentials  Input credentials in base64                                              [string]
  -h, --help         Show help                                                               [boolean]
  -v, --version      Show version number                                                     [boolean]
```

## Documentation
In order to use the ```tdxcli``` app one has to sign into a tdx account with an email address or share token (id and secret). If the user signs in using an email address the ```tdxcli``` will automatically open a Chromium browser window where the user can input the credentials. If the user signs in with an email id + secret the ```tdxcli``` app will open a headless Chromium window and will automatically fill in the credentials. Finally, if the user signs in with a share token the ```tdxcli``` will sign in using the tdx api authentication method.

### Credentials
The user can signin automatically and run each ```tdxcli``` command except ```signin``` with a predefined ```secret``` in base64 of the form ```{"id": "", "secret": ""}```. The credentials can be passed as a paramater together with a preconfigured alias name as follows:
```bash
tdxcli commandtoexecute ...variousparams --alias=name --credentials=secretinbase64
```

The credentials can also be passed as an environment variable as follows:
```bash
TDX_CREDENTIALS=secretinbase64 tdxcli commandtoexecute ...variousparams --alias=name
```

To get a credentials in base64 the user can sign in and retrieve the credentials with the below commands:
```bash
tdxcli signin id secret --alias=name
tdxcli list credentials
```
The output of the last command will show the credentials under the alias name ```name```.

### ```signin```
Usage
```bash
tdxcli signin
tdxcli signin emailorsharetokenid thesecret
```
The first command will open a Chromium browser window, wheares the second will do an automatic signin with the provided credentials. The obtained access token will be stored in the ```.env``` file.

Initially the user has to choose an ```alias``` in order to sign into a given tdx account. The default aliases are ```nqminds``` and ```nq_m```, which correspond to ```tdx.nqminds.com``` and ```tdx.nq-m.com```, respectively .

```bash
tdxcli signin --alias=nqminds
tdxcli signin emailorsharetokenid thesecret --alias=nq_m
```

The aliases configurations are stored in ```config.json```:
```json
  "tdxConfigs": {
    "nqminds": {
      "tokenHref": "https://tbx.nqminds.com",
      "config": {
        "commandServer": "https://cmd.nqminds.com",
        "ddpServer": "https://ddp.nqminds.com",
        "queryServer": "https://q.nqminds.com",
        "tdxServer": "https://tdx.nqminds.com",
        "accessTokenTTL": 31622400
      }
    },
    "nq_m": {
      "tokenHref": "https://tbx.nq-m.com",
      "config": {
        "commandServer": "https://cmd.nq-m.com",
        "ddpServer": "https://ddp.nq-m.com",
        "queryServer": "https://q.nq-m.com",
        "tdxServer": "https://tdx.nq-m.com",
        "accessTokenTTL": 31622400
      }
    }
  }
```
An new alias can be copied from an existing alias, it can be modified or removed.

The ```tdxcli signin``` allows storing access tokens and secrets for every configured alias. So, that the user can change among them by providing the ```tdxcli signin --alias=name``` option.

If the optins ```--alias``` is not provided ```tdxcli``` will use default alias ```name```, which was obtained by previously running the command:

```bash
tdxcli signin --alias=name
```

Note, the sign in process will fail if using an email address with added security (for instance signing in with gmail + second factor authentication).

### ```signout```
Usage
```bash
tdxcli signout
tdxcli signout --alias=name
```

Sign out from the default alias or from the alias given by the name ```name```. The command removes the stored access token and the secrets from ```.env``` file for default alias or the alias given by name ```name```.

### ```info```
Usage
```bash
tdxcli info
tdxcli info account
tdxcli info serverfolderid appid
tdxcli info databotsid
```
The above command can also be run with the ```--alias``` option.

```tdxcli info``` and ```tdxcli info account``` will output the account information corresponding to the signed in access token.

```tdxcli info serverfolderid appid``` will return the server folder id for a given application id ```appid```.

```tdxcli info databotsid``` will return all databot ids.

## ```config```
Usage
```bash
tdxcli config
tdxcli config --alias=name
```
Outputs the current tdx config for the default or a given alias name ```name```.

## ```list```
Usage
```bash
tdxcli list aliases
tdxcli list secrets
```
The first command lists all configured aliases. The second command lists all secrets in base64 for each configured alias.

## ```runapi```
Usage
```bash
tdxcli runapi getAccounts
tdxcli runapi getData --@1.a="testa" --@1.b="testb" --@2.result=1
tdxcli runapi getData --@1.a="1" --@1.b="testb" --@2.result=1 -- @1.a
```
The above commands can also be run with a given ```--alias``` options.

The ```runapi``` command executes a tdx api function. The argumets of the function are encoded using ```--@n```, where ```n``` is the index of the argument starting from ```1```.

For instance ```getData(datasetId, filter, projection, options, ndJSON)``` has ```5``` arguments. The value of each argument can be encoded as
```--@1=value```,```--@2=value```,```--@3=value```,```--@4=value```,```--@5=value```. If the value is an object then one can use the ```dot``` notation for encoding. For instance if the ```getData``` filter equals ```{a: {b: {c: 1}}}``` then it can be encoded as ```--@1.a.b.c=1```.

Note, the command line parser tries to identify if an argument value is a number or not. So, if you pass ```--@1="12345"``` it will translate it into the number ```12345```. To solves this problem one has to use the ```--``` symbol at the end of all argument definition and write an additional ```--@.1``` signifying that the arguiment ```1``` should be kept as string. Below is the usage example
```bash
tdxcli runapi apicommand --@1.a="12345" -- @1.a
```

## ```download```
Usage
```bash
tdxcli download resourceid
tdxcli download resourceid outputfilename
```

The first command will download the resource and output it to ```stdout```. Using this command one can save the resource into a file with ```tdxcli download someid >> outfile``` or pipe it into another bash command.

The second command will save the resource into a file given by the name ```outputfilename```.

## ```upload```
Usage
```bash
tdxcli upload resourceid filetoupload
```

The above command uploads the file ```filetoupload``` into a resource given by the ```resourceid```.

## ```copyalias```
Usage
```bash
tdxcli copyalias newalias
tdxcli copyalais newalias --alias=somealais
```

The first command makes a copy of the default alias configuration to a ```newalias``` configuration and saves it into ```config.json```.

The second command makes a copy of ```somealias``` configuration to a ```newalias``` configuration and saves it into ```config.json```

## ```modifyalias```
Usage
```bash
tdxcli modifyalias aliasname configfile.json
```

The above command modifies the ```aliasname``` configuration using the json from ```configfile.json``` and saves it to ```config.json```.

Example config file ```configfile.json```:
```json
{
  "tokenHref": "https://tbx.nqminds.com",
  "config": {
    "commandServer": "https://cmd.nqminds.com",
    "ddpServer": "https://ddp.nqminds.com",
    "queryServer": "https://q.nqminds.com",
    "tdxServer": "https://tdx.nqminds.com",
    "accessTokenTTL": 31622400
  }
}
```

## ```removealias```
Usage
```bash
tdxcli removealias aliasname
```

The removes the ```aliasname``` from ```config.json```.

## ```databot```
Usage
```bash
tdxcli databot start databotid databot.json
tdxcli databot stop databotinstanceid
tdxcli databot abort databotinstanceid
```

The first command starts an instance of the databot id ```databotid``` with the configuration file given by the file path ```databot.json```.

Example databot instance start configuration file:
```json
{
  "inputs": {
    "settings": {}
  },
  "id": "instanceid",
  "name": "somename",
  "overwriteExisting": "instanceid",
  "schedule": {
    "always": true
  },
  "shareKeyId": "someappid",
  "shareKeySecret": "somesecret",
}
```

The second command stops the databot with the instance id ```databotinstanceid``` and the third command aborts the databot with the instance id ```databotinstanceid```.

## ```token```
Usage
```bash
tdxcli token get
```

The command returns the access token for a the default alias or an alias passed with ```--alias```.