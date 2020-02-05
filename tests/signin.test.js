/* eslint-disable max-len */
/* eslint-disable no-undef */
const signin = require("../src/signin");
const websignin = require("../src/signin/web-signin");
const connect = require("../src/signin/connect");
jest.mock("../src/signin/web-signin");
jest.mock("../src/signin/connect");


beforeEach(() => {
  // Clear all instances and calls to constructor and all methods
  websignin.webAutoSignin.mockClear();
  connect.connectWithSecret.mockClear();
});

test("secretSignin should call webAutoSignin with arguments {config: {1: 2}, tokenHref: '', timeout: 300, secret: {id: '3', secret: '4'}}", async() => {
  const config = {1: 2};
  const tokenHref = "";
  const timeout = 300;
  const secret = {id: "test@gmail.com", secret: "4"};
  await signin.secretSignin({config, tokenHref, timeout, secret});
  expect(websignin.webAutoSignin).toHaveBeenCalledWith({config, tokenHref, timeout, secret});
});

test("secretSignin should call connectWithSecret({1: 2}, {id: '3', secret: '4'})", async() => {
  const config = {1: 2};
  const tokenHref = "";
  const timeout = 300;
  const secret = {id: "NIS78h@dubb&^", secret: "4"};
  await signin.secretSignin({config, tokenHref, timeout, secret});
  expect(connect.connectWithSecret).toHaveBeenCalledWith(config, secret);
});
