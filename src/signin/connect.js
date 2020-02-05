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

async function connect({config, token, secret}) {
  const tdxToken = token || "";
  const tdxSecret = secret || {};

  if (tdxToken) {
    return connectWithToken(config, tdxToken);
  } else {
    if (("id" in tdxSecret) && ("secret" in tdxSecret)) {
      return connectWithSecret(config, tdxSecret);
    } else throw Error("No tdx credentials present!");
  }
}

module.exports = {
  connectWithToken,
  connectWithSecret,
  connect,
};
