import ObjectsToCsv from "objects-to-csv";
import snoowrap from "snoowrap";
import config from "./config.js";

function removeSpecialChar(str) {
  if (str) return str.toString().replace(/&#x200B;/g, "");
}

const r = new snoowrap({
  userAgent: "Hot posts scraper",
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  username: config.username,
  password: config.password,
});

r.getHot()
  .fetchAll()
  .map((post) => {
    return {
      id: post.id,
      author: post.author.name,
      title: post.title,
      selfText: post.selfText,
      url: post.permalink,
      date: post.created_utc,
      score: post.score,
      subreddit: post.subreddit_name_prefixed,
      numComments: post.num_comments,
      spoiler: post.spoiler ? true : false,
      nsfw: post.over_18 ? true : false,
    };
  })
  .then(async (posts) => {
    const csv = new ObjectsToCsv(posts);
    // Save to file:
    await csv.toDisk("./test.csv");
  });
