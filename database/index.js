const dotenv = require("dotenv").config();

// console.log(process)
const URI = dotenv.parsed.URI

module.exports.init = function() {
    const mongoose = require("mongoose");
    mongoose.connect(URI).then(function() {
        console.log("db is live");
    }).catch(function() {
        console.log("error in connecting the db")
    })
}