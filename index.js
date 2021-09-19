import ObjectsToCsv from "objects-to-csv";
import snoowrap from "snoowrap";
import config from "./config.js";
import cron from "node-cron";
import nodemailer from "nodemailer";
import express from "express";

var app = express();

var mail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const removeSpecialChar = (str) => {
  if (str) return str.toString().replace(/\n/g, "").replace(",", "_");
};

const formatTime = (unix_timestamp) => {
  let uDate = new Date(unix_timestamp * 1000);
  let year = uDate.getFullYear();
  let month = uDate.getMonth() + 1;
  let date = uDate.getDate();
  let hour = uDate.getHours();
  let min = uDate.getMinutes();
  let sec = uDate.getSeconds();
  let time =
    hour + ":" + min + ":" + sec + " " + date + "-" + month + "-" + year;
  return time;
};

const formatDateNow = (now) => {
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let date = now.getDate();
  let time = date + "-" + month + "-" + year;
  return time;
};

const r = new snoowrap({
  userAgent: "Hot posts scraper",
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  username: config.username,
  password: config.password,
});

app.set("port", process.env.PORT || 5000);
app.use(express.static("index"));

app.get("/", function (request, response) {
  response.send("Collecting hot posts!");
});

app.listen(app.get("port"), function () {
  cron.schedule("0 0 * * *", function () {
    r.getHot()
      .fetchAll()
      .filter((post) => post.selftext !== "")
      .map((post) => {
        return {
          id: post.id,
          author: post.author.name,
          title: post.title,
          selfText: post.selftext,
          date: formatTime(post.created_utc),
          score: post.score,
          subreddit: post.subreddit_name_prefixed,
          numComments: post.num_comments,
          spoiler: post.spoiler ? true : false,
          nsfw: post.over_18 ? true : false,
          isVideo: post.is_video,
        };
      })
      .then(async (posts) => {
        // const csv = new ObjectsToCsv(posts);
        const time = formatDateNow(new Date());
        // await csv.toDisk(`./posts/${time}.csv`);
        const postsStr = JSON.stringify(posts);
        var mailOptions = {
          from: process.env.EMAIL,
          to: process.env.EMAIL_TO,
          subject: `Hot Posts for ${time}`,
          html: "<h1>Hello!</h1><p>Hot posts incoming</p>",
          attachments: [
            {
              filename: `${time}.txt`,
              content: postsStr,
            },
          ],
        };
        mail.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      });
  });
});
