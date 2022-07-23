const express = require("express");
const multer = require("multer");
const db = require("./database");
const userModelInstance = require("./database/models/user");
const cartModel = require("./database/models/cart");
const session = require("express-session");
const fs = require("fs");
const mailjet = require ('node-mailjet');

const userModel = userModelInstance.model;
const userRoleEnums = userModelInstance.userRoleEnums;

const sendMail = require("./utils/sendMail");
const { updateOne } = require("./database/models/user");

const transporter = mailjet.connect(
    '7b4abcf477976482d9027d1872981b31', 
    '777951cbde2ade5d0a4561cc00d6f2b2'
);
// '7b4abcf477976482d9027d1872981b31'
// '777951cbde2ade5d0a4561cc00d6f2b2'


const app = express();
const port = process.env.PORT || 3000;

// setting ejs as the default templating engine
// by default this uses views directory
// app.engine('html', require('ejs').renderFile);
// app.set("views");
app.set("view engine", 'ejs');

// initiate db connection
db.init();

//middlewares
app.use(express.static("uploads"))
app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }));
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

app.get("/auth", function(req, res) {
    res.render("auth");
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
            res.redirect("/");
            
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
app.get("/", function(req, res) {
    // const user = req.session.user;

    var user = null;

    if (req.session.isLoggedIn) {
        user = req.session.user;
    }

    fs.readFile("products.js", "utf-8", function(err, data) {
        res.render("index", { 
            user: user,
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
        isVerifiedMail: false,
        userType: userRoleEnums.customer
    }).then(function() {

        var html = '<h1>Click <a href="http://e-commerce-web-app-vz.herokuapp.com/verifyUser/'+username+'">here</a> to verify your email</h1>'

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

    var html = '<h1>Click <a href="http://e-commerce-web-app-vz.herokuapp.com/newPassword/'+username+'">here</a> to change your password</h1>'

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

app.route("/addToCart").post(function(req, res) {


    var user = null;

    if (!req.session.isLoggedIn) {
        res.status(401).json({ status: false, message: "please login", data: null });
        return;
    }

    user = req.session.user;

    //* get the id of product
    var product_id = req.body.product_id;
    var product_image = req.body.product_image;
    var product_name = req.body.product_name;
    var product_description = req.body.product_description;

    cartModel.create({
        product_id: product_id,
        product_image: product_image,
        product_name: product_name,
        product_description: product_description,
        user_id: user._id,
    }).then(function() {
        res.status(200).json({ status: true, message: "chal gaya", data: null})
    })
})

app.route("/viewCart").post(function(req, res) {
    var user = null;

    if (!req.session.isLoggedIn) {
        res.status(401).json({ status: false, message: "please login", data: null });
        return;
    }

    user = req.session.user;
    // var cartDetails = null;
    // cartModel.find({user_id: user._id}, function(err, docs) {
    //     if (err) {
    //         res.end("Something bad happened");
    //     } else {
    //         cartDetails = docs;
    //         res.render("cart", {cartDetails: cartDetails});
    //     }
    // })
    res.status(200).json({ status: true, message: "chal gaya", data: null })
})

app.get("/cart", function(req, res) {
    var cartDetails = null;
    cartModel.find({user_id: req.session.user._id}, function(err, docs) {
        if (err) {
            res.end("Something bad happened");
        } else {
            cartDetails = docs;
            res.render("cart", {cartDetails: cartDetails});
        }
    })
})

app.route("/updateCart").post(function(req, res) {
    var user = req.session.user;
    var product_id = req.body.product_id;
    var quantity = req.body.quantity;

    if (quantity == 0) {
        res.redirect("/deleteCartItem");
    }
    // var requiredId = null;

    // cartModel.findOne({user_id: user._id}, {product_id: product_id}, async function(item) {
    //     if(item) {
    //         await cartModel.updateOne({_id: item._id}, {$set: {quantity: Number(quantity)}});
    //         res.send();
    //     } else {
    //         res.send("something went wrong");
    //     }
    // })

    // await cartModel.updateOne({$and: [{user_id: user._id}, {product_id: product_id}]}, {$set: {quantity: quantity}});
    // res.send();
    cartModel.findOne({user_id: user._id}, {product_id, product_id}).then(function(item) {
        cartModel.findByIdAndUpdate(item._id, {quantity: quantity}, function(err, docs) {
            if (err) {
                res.end("something went wrong");
            } else {
                console.log(docs);
                res.send();
            }
        })
    })

    // cartModel.findOneAndUpdate({_id: requiredId}, {quantity: quantity}, function(err, docs) {
    //     console.log(err);
    //     console.log(docs);
    // });
    // console.log(requiredId);


    

    // res.send();
})

app.post("/deleteCartItem", function(req, res) {

})

app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
})

// app.get("/test", function(req, res) {
    
// })

/* FUNCTIONS */


app.listen(port, () => {
    console.log(`App listening at port number ${port}`);
})


// ADMIN SIDE

const adminRoutes = require("./routes/admin");

app.use("/admin", function(req, res, next) {
    // res.send("chal raha hai");
    //* check session
    //* if session, then if admin
    //* if not then redirect to login

    next();
})

app.use("/admin/auth", adminRoutes.auth);
app.use("/admin/product", adminRoutes.product);