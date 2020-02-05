"use strict";

const puppeteer = require("puppeteer");
const url = require("url");
const querystring = require("querystring");

async function startScraper(tokenHref, headless = false) {
  const originHost = url.parse(tokenHref).host;
  const browser = await puppeteer.launch({headless});
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  return {
    originHost,
    browser,
    page,
  };
}

async function submitSecret({page, secret, timeout, reject}) {
  try {
    await page.click('button[title="log in with e-mail"]');
    await page.waitForSelector('form[action="/auth/email"]', {timeout});
    await page.type('input[type="text"]', secret.id);
    await page.type('input[type="password"]', secret.secret);
    await page.click('button[type="submit"]');
    await page.waitForSelector('form[action="/application/connection"]', {timeout});
    await page.click('button[type="submit"]');
  } catch (error) {
    reject(Error("Invalid credentials or page load error"));
  }
}

function handleTokenRequest({request, originHost, resolve}) {
  const reqUrl = request.url();
  const reqObject = url.parse(reqUrl);
  const reqHost = reqObject.host;

  if (reqHost === originHost && reqObject.query) {
    const queryObject = querystring.parse(reqObject.query);
    if ("access_token" in queryObject) {
      // eslint-disable-next-line dot-notation
      resolve(queryObject["access_token"] || "");
    }
  }

  request.continue();
}

async function registerRequestHandler({resolve, reject, tokenHref, page, browser, originHost}) {
  try {
    page.on("request", (request) => handleTokenRequest({request, originHost, resolve}));
    await page.goto(tokenHref);
  } catch (error) {
    await browser.close();
    reject(error);
  }
}

async function getBrowserToken(tokenHref) {
  const {originHost, browser, page} = await startScraper(tokenHref, false);
  const token = await new Promise(async(resolve, reject) => registerRequestHandler({
    resolve, reject, tokenHref, page, browser, originHost,
  }));
  await browser.close();
  return token;
}

async function getSecretToken({tokenHref, secret, timeout}) {
  const {originHost, browser, page} = await startScraper(tokenHref, true);
  const token = await new Promise(async(resolve, reject) => {
    await registerRequestHandler({resolve, reject, tokenHref, page, browser, originHost});
    await submitSecret({page, secret, timeout, reject});
  });
  await browser.close();

  return token;
}

module.exports = {
  getSecretToken,
  getBrowserToken,
};
