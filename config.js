import dotenv from "dotenv";

dotenv.config()
const config = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.CLIENT_USERNAME,
  password: process.env.CLIENT_PASSWORD,
};

export default config;
