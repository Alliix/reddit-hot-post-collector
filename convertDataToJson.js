import fs from "fs";

const inPutDataToJSON = (dirname, pathToWriteTo) => {
  fs.readdir(dirname, (err, filenames) => {
    if (err) {
      console.log(err);
    } else {
      filenames.forEach((filename) => {
        const postsPath = dirname + filename;
        fs.readFile(postsPath, "utf8", (err, incoming) => {
          if (err) {
            console.log(err);
          } else {
            const incomingPostsArray = JSON.parse(incoming);
            const postsFile = fs.readFileSync(pathToWriteTo);

            const postsJson = JSON.parse(postsFile);
            incomingPostsArray.forEach((incomingPost) => {
              postsJson.posts.forEach((post) => {
                if (
                  !(
                    post.author === incomingPost.author &&
                    post.title === incomingPost.title
                  )
                ) {
                  postsJson.posts.push(incomingPost);
                }
              });
              // postsJson.posts.push(incomingPost); //1st time writing to file
            });
            const json = JSON.stringify(postsJson);
            fs.writeFileSync(pathToWriteTo, json, "utf8");
          }
        });
      });
    }
  });
};
