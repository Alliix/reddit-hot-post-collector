import ObjectsToCsv from "objects-to-csv";
import snoowrap from "snoowrap";
import config from "./config.js";
import cron from "node-cron";
import http from "http";

function removeSpecialChar(str) {
  if (str) return str.toString().replace(/\n/g, "").replace(",", "_");
}

const formatTime = (unix_timestamp) => {
  var a = new Date(unix_timestamp * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time =
    date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
  return time;
};

const r = new snoowrap({
  userAgent: "Hot posts scraper",
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  username: config.username,
  password: config.password,
});

http
  .createServer(function (request, response) {
    cron.schedule("0 0 * * *", function () {
      r.getHot()
        .fetchAll()
        .then((posts) => {
          return posts.filter((post) => post.selftext !== "");
        })
        .map((post) => {
          return {
            id: post.id,
            author: post.author.name,
            title: post.title,
            selfText: removeSpecialChar(post.selftext),
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
          const csv = new ObjectsToCsv(posts);
          const now = new Date();
          const date = `${now.getDate()}-${
            now.getMonth() + 1
          }-${now.getFullYear()}`;
          await csv.toDisk(`./${date}.csv`);
        });
    });
  })
  .listen(process.env.PORT || 5000);
