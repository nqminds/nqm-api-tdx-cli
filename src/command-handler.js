"use strict";

const {webWindowSignin, secretSignin, connect} = require("./signin");
const {runApi} = require("./runapi");
const {downloadResource} = require("./download");
const {uploadResource} = require("./upload");
const {getInfo} = require("./info");
const {
  abortDatabot,
  stopDatabot,
  startDatabot,
} = require("./databot");

class CommandHandler {
  constructor({tdxConfig, secret, token, timeout}) {
    this.tokenHref = tdxConfig.tokenHref || "";
    this.config = tdxConfig.config || {};
    this.timeout = timeout || 5000;
    this.secret = secret || {};
    this.accessToken = token || "";
  }

  getToken() {
    return this.accessToken;
  }

  async handleConnect() {
    const api = await connect({
      config: this.config,
      secret: this.secret,
      token: this.accessToken,
    });

    this.accessToken = api.accessToken;

    return api;
  }

  async handleSignin(secret) {
    const api = (secret.id) ? await this.handleSecretSignin(secret) :
      await this.handleWebSignin();

    this.accessToken = api.accessToken;

    return api;
  }

  async handleWebSignin() {
    const api = await webWindowSignin(this.config, this.tokenHref);
    return api;
  }

  async handleSecretSignin(secret) {
    const api = await secretSignin({
      config: this.config,
      tokenHref: this.tokenHref,
      timeout: this.timeout,
      secret,
    });
    return api;
  }

  handleSignout() {
    this.accessToken = "";
    this.secret = {};
  }

  async handleRunApi({command, apiArgs, apiArgsStringify}) {
    const api = await this.handleConnect();
    return runApi({command, apiArgs, apiArgsStringify, api});
  }

  async handleInfo({id, type}) {
    const api = await this.handleConnect();
    return getInfo({api, type, id});
  }

  async handleDownload(id, filepath) {
    const api = await this.handleConnect();
    return downloadResource({id, filepath, api});
  }

  async handleUpload(id, filepath) {
    const api = await this.handleConnect();
    return uploadResource({id, filepath, api});
  }

  async handleAbortDatabot(id) {
    const api = await this.handleConnect();
    return abortDatabot(api, id || "");
  }

  async handleStopDatabot(id) {
    const api = await this.handleConnect();
    return stopDatabot(api, id || "");
  }

  async handleStartDatabot(id, functionPayload) {
    const api = await this.handleConnect();
    return startDatabot({
      api,
      id: id || "",
      functionPayload: functionPayload || {},
    });
  }
}

module.exports = CommandHandler;
