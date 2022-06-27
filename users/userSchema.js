const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    fullName: 'string',
    email: {type:String,
        unique : true},
    password: 'string',
    sources:  [{
        type: String
    }]
  
});

module.exports = userSchema;
