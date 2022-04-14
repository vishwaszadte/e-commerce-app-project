const express = require("express");
const multer = require("multer");
const db = require("./database");
const userModel = require("./database/models/user");
const session = require("express-session");
const fs = require("fs");
const mailjet = require ('node-mailjet');

const sendMail = require("./utils/sendMail");

const transporter = mailjet.connect(
    '7b4abcf477976482d9027d1872981b31', 
    '777951cbde2ade5d0a4561cc00d6f2b2'
);
// '7b4abcf477976482d9027d1872981b31'
// '777951cbde2ade5d0a4561cc00d6f2b2'


const app = express();
const port = 3000;

// setting ejs as the default templating engine
// by default this uses views directory
// app.engine('html', require('ejs').renderFile);
// app.set("views");
app.set("view engine", 'ejs');

// initiate db connection
db.init();

//middlewares
app.use(express.static("uploads"))
app.use(express.urlencoded());
app.use(session({
    secret: "secret secret",
    resave: false,
    saveUninitialized: true
}))
app.use(express.json());


// multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads")
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({storage: storage})

// bad practice
// app.use(upload.single("profile_pic"))

app.get("/", function(req, res) {
    res.render("home");
})

app.route("/login").get(function(req, res) {
    res.render("login", {error: ""});
}).post(function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    if (!username) {
        res.render("login", {error: "Please enter username"});
        return;
    }
    if (!username) {
        res.render("login", {error: "Please enter password"});
        return;
    }

    userModel.findOne({ username: username, password: password }).then(function(user) {
        if (user && !user.isVerifiedMail) {
            res.render("login", {error: "please check your mail and verify your account"});
            return;
        }
        if(user) {
            // create the session
            req.session.isLoggedIn = true;
            req.session.user = user;
            res.redirect("/home");
            
        } else {
            res.render("login", {error: "wrong details"});
            return;
        }

        

        // console.log(user);

        // taking to the homepage
    }).catch(function() {

    })

})

// the homepage after logging in
app.get("/home", function(req, res) {
    // only the logged in user will come here
    const user = req.session.user;

    fs.readFile("products.js", "utf-8", function(err, data) {
        res.render("index", { 
            name: user.username,
            pic:  user.profile_pic, 
            products: JSON.parse(data)
        });
    })

    // console.log(user);
    // console.log(user.username);
    // console.log(user.profile_pic);

    
})

app.route("/loadMore").get(function(req, res) {
    fs.readFile("products.js", "utf-8", function(err, data) {
        if (err) {
            res.end("Some error occured");
        } else {
            res.send(data);
        }
    })
})

app.route("/signup").get(function(req, res) {
    res.render("signup", {error: ""});
}).post(upload.single("profile_pic"), function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const file = req.file;
    
    if (!username) {
        res.render("signup", {error: "Please enter username"});
        return;
    }
    if (!password) {
        res.render("signup", {error: "Please enter password"});
        return;
    }
    // if (!file) {
    //     res.render("signup", {error: "Please upload the profile picture"});
    //     return;
    // }

    // console.log(file);
    userModel.create({
        username: username, 
        password: password,
        profile_pic: file ? file.filename: "profile_pic-1649695341010-454886408", 
        isVerifiedMail: false
    }).then(function() {

        var html = '<h1>Click <a href="http://localhost:3000/verifyUser/'+username+'">here</a> to verify your email</h1>'

        sendMail(username, 
            "welcome to Ecommerce app", "Please verify your email",
            html,
            function(error) {
                if (error) {
                    // error handling
                    res.render("signup", {error: "Unable to send email"})
                } else {
                    res.redirect("/login");
                }
            } 
        )
        res.redirect("/");
    }).catch(function(err) {
        console.log("error occured");
        console.log(err);
        res.render("signup", {error: "something went horribly wrong"});
    })
})

app.get("/forgotPassword", function(req, res) {
    res.render("forgotPassword", {error: ""});
    // res.render("changePassword", {error: ""});
})

app.post("/sendPasswordMail", function(req, res) {
    const username = req.body.username;

    var html = '<h1>Click <a href="http://localhost:3000/newPassword/'+username+'">here</a> to change your password</h1>'

    sendMail(username, 
        "Change your password", "Please verify your email",
        html,
        function(error) {
            if (error) {
                // error handling
                res.render("forgotPassword", {error: "Unable to send email"})
            } else {
                // res.redirect("/login");
                // res.send("This user probably does not exist")
                // res.render("changePassword")
                res.end("email sent, please check your inbox")
            }
        } 
    )
})

app.get("/verifyUser/:username", function(req, res) {
    const username = req.params.username;

    userModel.findOne({username: username}).then(async function(user) {
        if (user) {
            // verify the user i.e
            await userModel.updateOne({username: user.username}, {$set: {isVerifiedMail: true}});
            res.send("user is verified, now login");
        } else {
            res.send("Unable to verify")
        }
    })
})

app.get("/newPassword/:username", function(req, res) {
    const username = req.params.username;
    res.render("changePassword", {username: username});
})

app.post("/changePassword", function(req, res) {
    const username = req.body.username;
    const newPassword = req.body.newPassword;

    if (!username) {
        res.render("changePassword", {error: "Please enter username"});
        return;
    }
    if (!newPassword) {
        res.render("changePassword", {error: "Please enter password"});
        return;
    }

    userModel.findOne({username: username}).then(async function(user) {
        if (user) {
            await userModel.updateOne({username: user.username}, {$set: {password: newPassword}});
            res.send("password changed successfully, now you can login with your new pasword");
        } else {
            res.send("This user does not exist");
        }
    })
})

// app.get("/test", function(req, res) {
    
// })

/* FUNCTIONS */


app.listen(port, () => {
    console.log(`App listening at port number ${port}`);
})