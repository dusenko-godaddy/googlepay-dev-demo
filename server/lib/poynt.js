const poynt = require("poynt")({
  env: global.configs.env,
  applicationId: global.configs.applicationId,
  filename: __dirname + "/keypair-ci-my-business.pem",
});

module.exports = poynt;
