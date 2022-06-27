const jwt = require("jsonwebtoken");
const util = require("util"); 
const verifyAsync = util.promisify(jwt.verify);

const getIdFromToken = async (token) =>{

    const secretKey = process.env.SECRET_KEY;
    const {id} = await verifyAsync(token, secretKey);
    return id;
}

module.exports = getIdFromToken;


