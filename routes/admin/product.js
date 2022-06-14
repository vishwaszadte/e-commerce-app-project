const express = require("express");
const router = express.Router();
// const db = require("../../database");
const productModel = require("../../database/models/product");
router.use(express.static("public"))
// db.init();

router.route("/").get(function(req, res) {
    if (req.session.isLoggedIn) {
        productModel.find({}).then(function(products) {
            // console.log(products);
            res.render("admin/pages/add_product", {error: "", products: products});
        })
    } else {
        res.redirect("/admin/auth/login")
    }
    
    // res.render("admin/pages/add_product", {error: ""});
}).post(function(req, res) {
    // extract data
    const productName = req.body.productName;
    const productDescription = req.body.productDescription;
    const productPrice = req.body.productPrice;
    const productStock = req.body.productStock;
    const productCategory = req.body.productCategory;

    // validate data and send error messages
    if (!productName) {
        res.render("admin/pages/add_product", {error: "Please provide product name"});
        return;
    }
    if (!productDescription) {
        res.render("admin/pages/add_product", {error: "Please provide product description"});
        return;
    }
    if (!productPrice) {
        res.render("admin/pages/add_product", {error: "Please provide product price"});
        return;
    }
    if (!productStock) {
        res.render("admin/pages/add_product", {error: "Please provide product stock"});
        return;
    }
    if (!productCategory) {
        res.render("admin/pages/add_product", {error: "Please provide product category"});
        return;
    }
    // create  product
    productModel.create({
        name: productName,
        price: productPrice,
        description: productDescription,
        category: productCategory,
        stock: productStock
    }).then(function() {
        res.redirect("/admin/product");
    }).catch(function(err) {
        console.log(err);
        res.render("admin/pages/add_product", {error: "Something went horribly wrong", products: null});
    })
    // send updated product back
})

router.route("/update").get(function(req, res) {
    // var uniqueID = req.body.uniqueID;
    res.render("admin/pages/update_product");
    // console.log(uniqueID);
    // productModel.findById(uniqueID, function(err, doc) {
    //     if (err) {
    //         console.log(err);
    //         res.render("admin/pages/add_product", {error: "Something went wrong", products: null});
    //     } else {
    //         console.log(doc);
    //         res.render("admin/pages/update_product", {product: doc});
    //     }
    // });
}).post(function(req, res) {

})

router.route("/delete").post(function(req, res) {
    var uniqueID = req.body.uniqueID;
    productModel.deleteOne({ _id: uniqueID }, function() {
        res.send();
    });
})

module.exports = router;