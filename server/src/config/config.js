import dotenv from "dotenv"

dotenv.config()

const config = {
    MONGO_URI: process.env.MONGO_URI ?? process.env.MONGO_URL,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
}

export default config