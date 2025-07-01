const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
    },
    grandprice:{
        type:Number
    },
    oldPrice:{
        type:Number
    },

    Description: {
        type: String,
    },
    images: {
        type: Array,
        required: true,
    },

    stockQuantity: {
        type: Number,
        required: true,
    },

    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'category', 
        required: true,
    },
    Brand:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'brand', 
        required: true,
    },

    discountAmount: {
        type: Number,
    },

    status: {
        type: String,
    },

    Specification1: {
        type: String,
    },

    Specification2: {
        type: String,
    },
    Specification3: {
        type: String,
    },

    Specification4: {
        type: String,
    },
    displayStatus : {
        type: String,
        default :"Show"
    },
    
    tags : {
        type : String
    },
    inCategoryOffer : {
        type: Boolean,
        default: false
    },
    beforeOffer : {
        type: Number
    },
    inWish: {
        type:Boolean,
        default: false

    }
},
{
    timestamps: true,
});

module.exports = mongoose.model('product', productSchema)