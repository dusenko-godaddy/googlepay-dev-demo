const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

// global configs
global.configs = require("./lib/configs-ci-my-business");

app.use("/collect", require("./routes/collect"));

const port = 1347;
app.listen(port, () => {
  console.log(`Google Pay Node JS app listening at ${port}`);
});
