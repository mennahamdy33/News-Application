const express = require("express");
const bcrypt = require("bcrypt");
const axios = require("axios");
const getIdFromToken = require("../helpers/getIdFromToken");
const { authError, tokenError } = require("../helpers/CustomError");
const UserModel = require("./userModel");
const userRouter = express.Router();
const createToken = require("../helpers/createToken");
const addValidation = require("./validation/userAdd");
userRouter.post("/registeration", addValidation, async (req, res, next) => {
  const { fullName, email, password } = req.body;

  try {
    const saltRounds = +process.env.SALT_ROUNDS || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await UserModel.create({ fullName, password: hashedPassword, email });
    res.send({ success: true });
  } catch (error) {
    next(error);
  }
});

userRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return next(authError);

    const result = await bcrypt.compare(password, user.password);
    if (!result) return next(authError);
    const token = await createToken(user.id);
    // save the token in the header cookies
    res.cookie("nToken", token, { maxAge: 900000 ,httpOnly: true}).send({ success: true });
  
  } catch (error) {
    next(error);
  }
});
// the router will check the authentication before all theroutes after it
userRouter.use(async (req, res, next) => {
  // console.log(req.headers.cookie);
  const token = req.headers.cookie?.split("=")[1];

  try {
    const id = await getIdFromToken(token);
    req.id = id;
    next();
  } catch (error) {
    next(tokenError);
  }
});

// home page to view all the articles from the sources subscribed by this user
userRouter.get("/", async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.id);
    const userSources = user.sources.join(",");
    if (userSources)
      await axios
        .get(
          `https://newsapi.org/v2/top-headlines?sources=${userSources}&apiKey=50c2a1639852480b8fd966af42ac6af5`
        )
        .then(function (response) {
          // handle success
          return res.send(response.data.articles);
        });
    res.send({});
  } catch (error) {
    next(error);
  }
});

// to view all the sources
userRouter.get("/sources", async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.id);

    // get all the sources
    await axios
      .get(
        "https://newsapi.org/v2/top-headlines/sources?apiKey=50c2a1639852480b8fd966af42ac6af5"
      )
      .then((response) => {
        // handle success
        const allSources = response.data.sources;
        // check the subscribued sources for this user
        const sources = allSources.map((source) => {
          return {
            ...source,
            subscribed: user.sources.includes(source.id) ? true : false,
          };
        });

        res.send(sources);
      });
  } catch (error) {
    next(error);
  }
});

// if the user subscribe a new source
userRouter.patch("/sources/:id/subscribe", async (req, res, next) => {
  const { id } = req.params;
  const userId = req.id;
  try {
    const user = await UserModel.findByIdAndUpdate(userId, {
      $push: { sources: id },
    });
    res.send({ success: true });
  } catch (error) {
    next(error);
  }
});

// if the user unsubscribe a source
userRouter.patch("/sources/:id/unsubscribe", async (req, res, next) => {
  const { id } = req.params;

  const userId = req.id;
  try {
    const user = await UserModel.findByIdAndUpdate(userId, {
      $pull: { sources: id },
    });
    res.send({ success: true });
  } catch (error) {
    next(error);
  }
});

// logout be clearing the token 
userRouter.get("/logout", (req, res) => {
  res.clearCookie("nToken").send({ success: true });
});

// if router not found
userRouter.use((req, res, next) => {
  res.status(404).send({ error: "Not found" });
});

module.exports = userRouter;
