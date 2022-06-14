const express = require("express");
const router = express.Router();
const userModelInstance = require("../../database/models/user");
const userModel = userModelInstance.model;
const userRoleEnums = userModelInstance.userRoleEnums;

router.route("/login").get(function(req, res) {
    res.render("admin/pages/login", {error: ""});
}).post(function(req, res) {
    // res.send("its working")

    // logging in 
    // extract data from body
    const username = req.body.username;
    const password = req.body.password;

    if (!username) {
        res.render("admin/pages/login", {error: "Please enter username"});
        return;
    }
    if (!username) {
        res.render("admin/pages/login", {error: "Please enter password"});
        return;
    }

    // check user in db
    // check userRole
    //create session
    userModel.findOne({ username: username, password: password, userType: 1 }).then(function(user) {
        if (user) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            res.redirect("/admin/product");
        } else {
            res.render("admin/pages/login", {error: "Invalid credentials"})
        }
    })
    
})

// router.get("/login", function(req, res) {
//     res.send("Admin login");
// })

module.exports = router;