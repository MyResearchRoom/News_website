require("dotenv").config();

module.exports = {
  development: {
    username: "u575240270_rootnews",
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: "mysql",
    logging: false,
  },
  test: {
    username: "u575240270_rootnews",
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: "mysql",
    logging: false,
  },
  production: {
    username: "u575240270_rootnews",
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: "mysql",
    logging: false,
  },
  jwt_secret: process.env.JWT_SECRET,
  forgot_password_jwt_secret: process.env.FORGOT_PASSWORD_JWT_SECRET,
  port: process.env.PORT || 8000,
  email: process.env.EMAIL,
  emailPassword: process.env.EMAIL_PASSWORD,
  clientUrl: process.env.CLIENT_URL,

  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,

  server_url: process.env.SERVER_URL,
};
