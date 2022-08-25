const express = require("express");
const bcrypt = require("bcrypt");
const axios = require("axios");
const getIdFromToken = require("../helpers/getIdFromToken");
const { authError, tokenError } = require("../helpers/CustomError");
const UserModel = require("./userModel");
const userRouter = express.Router();
const createToken = require("../helpers/createToken");
const addValidation = require("./validation/userAdd");
const logger = require("../services/loggerService");

const { addCache, checkForChache } = require("../services/cacheService");

userRouter.post("/registeration", addValidation, async (req, res, next) => {
  const { fullName, email, password } = req.body;

  const saltRounds = +process.env.SALT_ROUNDS || 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await UserModel.create({ fullName, password: hashedPassword, email });
  logger.info("user register");
  res.send({ success: true });
});

userRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) return next(authError);

  const result = await bcrypt.compare(password, user.password);
  if (!result) return next(authError);
  const token = await createToken(user.id);
  logger.info("user loggedin");
  // save the token in the header cookies
  res.cookie("nToken", token, { httpOnly: true }).send({ success: true });
});
// the router will check the authentication before all theroutes after it
userRouter.use(async (req, res, next) => {
  const token = req.cookies.nToken;
  if (!token) return next(tokenError);
  const id = await getIdFromToken(token);
  req.id = id;
  next();
});

userRouter.get("/", async (req, res, next) => {
  const user = await UserModel.findById(req.id);
  const userSources = user.sources.sort().join(",");

  if (userSources) {
    checkForChache(userSources).then(async (data) => {
      console.log(data.length);
      if (data.length) {
        console.log("data");
        console.log(data.length);
        return res.send(data);
      } else {
        console.log("no data");
        await axios
          .get(
            `https://newsapi.org/v2/top-headlines?sources=${userSources}&apiKey=50c2a1639852480b8fd966af42ac6af5`
          )
          .then(function (response) {
            // handle success
            console.log(userSources);
            addCache(userSources, response.data.articles);
            res.send(response.data.articles);
          });
      }
    });
  } else {
    res.send({});
  }
});

userRouter.get("/sources", async (req, res, next) => {
  //check for cache
  let allSources = [];
  checkForChache("sources").then(async (data) => {
    if (data.length) {
      allSources = data;
      res.send(allSources);
    } else {
      await axios
        .get(
          "https://newsapi.org/v2/top-headlines/sources?apiKey=50c2a1639852480b8fd966af42ac6af5"
        )
        .then((response) => {
          // handle success
          allSources = response.data.sources;
          addCache("sources", allSources);
          res.send(allSources);
        });
    }
  });
});

userRouter.post("/sources/:id/subscribe", async (req, res, next) => {
  const { id } = req.params;
  const userId = req.id;

  const user = await UserModel.findByIdAndUpdate(userId, {
    $push: { sources: id },
  });
  res.send({ success: true });
});

userRouter.patch("/sources/:id/unsubscribe", async (req, res, next) => {
  const { id } = req.params;

  const userId = req.id;

  const user = await UserModel.findByIdAndUpdate(userId, {
    $pull: { sources: id },
  });
  res.send({ success: true });
});

userRouter.get("/logout", (req, res) => {
  logger.info("user logged out");
  res.clearCookie("nToken").send({ success: true });
});

userRouter.use((req, res, next) => {
  res.status(404).send({ error: "Not found" });
});

module.exports = userRouter;
