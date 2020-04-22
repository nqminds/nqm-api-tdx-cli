"use strict";
const {connectWithToken} = require("./connect");
const {getBrowserToken, getSecretToken} = require("./scraper");

async function webWindowSignin({config, tokenHref, puppeteerPackage}) {
  const token = await getBrowserToken(tokenHref, puppeteerPackage);
  return connectWithToken(config, token);
}

async function webAutoSignin({config, tokenHref, timeout, secret, puppeteerPackage}) {
  const token = await getSecretToken({tokenHref, timeout, secret, puppeteerPackage});
  return connectWithToken(config, token);
}

module.exports = {
  webWindowSignin,
  webAutoSignin,
};
