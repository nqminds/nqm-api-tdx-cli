/* eslint-disable no-undef */
const connect = require("../src/signin/connect");
const TDXApi = require("@nqminds/nqm-api-tdx");

const mockAuthenticate = jest.fn();
jest.mock("@nqminds/nqm-api-tdx", () => {
  return jest.fn().mockImplementation(() => {
    return {authenticate: mockAuthenticate};
  });
});

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  TDXApi.mockClear();
  mockAuthenticate.mockClear();
});

test("connectWithToken should return a tdx instace", () => {
  connect.connectWithToken({}, "");
  expect(TDXApi).toHaveBeenCalledTimes(1);
});

test("connectWithSecret should call the authenticate function", async() => {
  expect(TDXApi).not.toHaveBeenCalled();
  await connect.connectWithSecret({}, {id: "", secret: ""});
  expect(TDXApi).toHaveBeenCalledTimes(1);
  expect(mockAuthenticate.mock.calls[0][0]).toEqual("");
});

test("connect should call connectWithToken function for a token env", async() => {
  expect(TDXApi).not.toHaveBeenCalled();
  connect.connect({
    config: {},
    token: "12345",
    secret: {},
  });

  expect(TDXApi).toHaveBeenCalledTimes(1);
  expect(mockAuthenticate).not.toHaveBeenCalled();
});

test("connect should call connectWithSecret function for a token env", async() => {
  const secret = {id: "a", secret: "b"};
  expect(TDXApi).not.toHaveBeenCalled();
  connect.connect({
    config: {},
    token: "",
    secret,
  });

  expect(TDXApi).toHaveBeenCalledTimes(1);
  expect(mockAuthenticate.mock.calls[0][0]).toBe("a");
  expect(mockAuthenticate.mock.calls[0][1]).toBe("b");
});

test("connect should throw with empty alias", async() => {
  try {
    await connect.connect({
      config: {},
      token: "",
      secret: {},
    });
  } catch (error) {
    expect(error).toEqual(Error("No tdx credentials present!"));
  }
});
