module.exports.init = function() {
    const mongoose = require("mongoose");
    mongoose.connect("mongodb+srv://app:1234567890@cluster0.7nzuy.mongodb.net/ecommerce?retryWrites=true&w=majority").then(function() {
        console.log("db is live");
    }).catch(function() {
        console.log("error in connecting the db")
    })
}