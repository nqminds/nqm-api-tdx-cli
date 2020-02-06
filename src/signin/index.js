
const {webAutoSignin, webWindowSignin} = require("./web-signin");
const {connectWithSecret, connect} = require("./connect");
const {validateEmail} = require("../utils");

async function secretSignin({config, tokenHref, timeout, secret}) {
  if (validateEmail(secret.id)) {
    return webAutoSignin({config, tokenHref, timeout, secret});
  } else return connectWithSecret(config, secret);
}

module.exports = {
  connect,
  webWindowSignin,
  secretSignin,
};
