module.exports = {
  "expressPort": parseInt(process.env.WEB_PORT) || 8000,
  "jwtSecret": "fsdfsfsdfsdf",
  "database": {
    "host" : process.env.DB_HOST,
    "user" : process.env.DB_USERNAME,
    "password" : process.env.DB_PASSWORD,
    "database" : process.env.DB_NAME
  }
}
