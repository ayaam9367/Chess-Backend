const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3301;
const server = http.createServer(app).listen(PORT, (err) => {
  if (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
  console.log(`🚀 Server is listening at : http://localhost:${PORT}`);
});

module.exports = {app, server}
