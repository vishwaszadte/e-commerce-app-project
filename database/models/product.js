const mongoose = require("mongoose");

const productSchema = new mongoose.Schema( {
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }, 
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    stock: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
} )

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;