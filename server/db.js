const mongoose = require('mongoose')
require('dotenv').config();

const connectToMongoDb = ()=> {
    mongoose.connect(`mongodb+srv://MumbaiHack:${process.env.pass}@cluster0.lfqdy.mongodb.net/`)
    .then(()=>{
        console.log("Connected to database");
    })
    .catch(()=>{
        console.log("Oops there was some error");
    });
}

module.exports = connectToMongoDb; //this exports the function and u can use it in any file to connect to database