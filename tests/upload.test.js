/* eslint-disable mocha/no-global-tests */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable no-undef */
const upload = require("../src/upload");
const {PassThrough} = require("stream");


test("getUploadError should return an error object for data={code: 'test', message: 'error'}", async() => {
  const data = {code: "test", message: "error"};
  const dataString = JSON.stringify(data);
  const buf = Buffer.from(dataString, "utf8");
  expect(upload.getUploadError(buf)).toEqual(Error(data.message));
});

test("getUploadError should return an error for a malformed data json", async() => {
  const data = {"code": "1", "message": "test"};
  const dataString = JSON.stringify(data);
  const newString = dataString.replace("\"code\"", "");
  const buf = Buffer.from(newString, "utf8");
  const error = upload.getUploadError(buf);
  expect(error.message).toEqual("Unexpected token : in JSON at position 1");
});

test("pipeStream should return error on request stream error", async() => {
  const error = new Error("test");
  const mockReadable = new PassThrough();
  const mockWriteable = new PassThrough();
  const response = upload.pipeStream(mockWriteable, mockReadable);
  mockWriteable.emit("error", error);
  await expect(response).rejects.toEqual(error);
});

test("pipeStream should return error on resourceStream error", async() => {
  const error = new Error("test");
  const mockReadable = new PassThrough();
  const mockWriteable = new PassThrough();

  const response = upload.pipeStream(mockWriteable, mockReadable);
  mockReadable.emit("error", error);
  await expect(response).rejects.toEqual(error);
});

test("pipeStream should return \"OK\" on end event", async() => {
  const mockReadable = new PassThrough();
  const mockWriteable = new PassThrough();

  const response = upload.pipeStream(mockWriteable, mockReadable);
  mockReadable.emit("end");
  await expect(response).resolves;
});

test("pipeStream should return error on erronous data", async() => {
  const data = {code: "test", message: "error"};
  const dataString = JSON.stringify(data);
  const buf = Buffer.from(dataString, "utf8");

  const mockReadable = new PassThrough();
  const mockWriteable = new PassThrough();

  const response = upload.pipeStream(mockWriteable, mockReadable);
  mockWriteable.emit("data", buf);
  mockReadable.emit("end");
  await expect(response).rejects.toEqual(Error(data.message));
});
