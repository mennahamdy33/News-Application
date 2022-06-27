const util = require("util");
const jwt = require("jsonwebtoken");
const signAsync = util.promisify(jwt.sign);
const secretKey = process.env.SECRET_KEY;

const createToken = async (id) =>{

    const token = await signAsync(
        {
          id,
          admin: false,
        },
        process.env.SECRET_KEY
      );
    return token;
}

module.exports = createToken;

