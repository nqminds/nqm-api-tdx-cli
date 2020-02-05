"use strict";
const {connectWithToken} = require("./connect");
const {getBrowserToken, getSecretToken} = require("./scraper");

async function webWindowSignin(config, tokenHref) {
  const token = await getBrowserToken(tokenHref);
  return connectWithToken(config, token);
}

async function webAutoSignin({config, tokenHref, timeout, secret}) {
  const token = await getSecretToken({tokenHref, timeout, secret});
  return connectWithToken(config, token);
}

module.exports = {
  webWindowSignin,
  webAutoSignin,
};
