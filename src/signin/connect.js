"use strict";

const TDXApi = require("@nqminds/nqm-api-tdx");

function connectWithToken(config, token) {
  const connectConfig = {accessToken: token, ...config};
  return new TDXApi(connectConfig);
}

async function connectWithSecret(config, secret) {
  const api = new TDXApi(config);
  await api.authenticate(secret.id, secret.secret);
  return api;
}

async function connect({config, token = "", secret = {}}) {
  if (token) {
    return connectWithToken(config, token);
  } else if (("id" in secret) && ("secret" in secret)) {
    return connectWithSecret(config, secret);
  } else throw Error("No tdx credentials present!");
}

module.exports = {
  connectWithToken,
  connectWithSecret,
  connect,
};
