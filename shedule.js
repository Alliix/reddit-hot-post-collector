const cron = require("node-cron");
const express = require("express");

app = express();
const fs = require("fs");
const content = "Some content!";

cron.schedule("* * * * *", function () {
  fs.appendFile("test.txt", content, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    //done!
  });
});

app.listen(3000);
