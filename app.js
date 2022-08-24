const express = require("express");
const app = express();
const userRouter = require("./users/userRouter");
const cookieParser = require('cookie-parser')
const logger = require('./services/loggerService');

// const cors  =require('cors');
require("express-async-errors");
require("dotenv").config();
require("./dbConnection");

const port = process.env.PORT || 3000;


app.use(express.json());
app.use(cookieParser());

app.get(["/", "/home"], (req, res) => {
  res.send("Welcome to the home page!");
});

app.use(["/users", "/user"], userRouter);

app.use((err, req, res, next) => {

  
  if (!err.status) {
    err.message = "something went wrong";
    console.log(err);
  }
  // logger.fatal('fatal');
  logger.error(err.message);
  // logger.warn('warn');
  // logger.info('info');
  // logger.debug('debug');

    res.status(err.status || 500).send({ message: err.message });

});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
