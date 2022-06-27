const express = require('express');
const app = express();
// const morgan = require('morgan');
const userRouter = require('./users/userRouter');
// const cors  =require('cors');

require('dotenv').config();
require('./dbConnection');

const port = process.env.PORT || 3000;

// app.use(cors())

// app.use(morgan('dev'));

app.use(express.json());
// app.use(express.urlencoded());

app.get(['/', '/home'], (req, res) => {
    res.send('Welcome to the home page!');
});


app.use(['/users','/user'], userRouter);

app.use((err, req, res, next) => {
    if(!err.status){
        err.message = "something went wrong";
        console.log(err);
      
    }
    res.status(err.status || 500).send({ message: err.message});
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
});
