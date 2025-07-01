const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userid:{
        type: mongoose.Schema.Types.ObjectId,
    },
    products:[
        {
            productid: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
            quantity: { type: Number },
            status: { type: String, default: "Processed" },
            price: { type: Number }
        }
    ],
    address:{
        name: String,
        address: String,
        locality: String,
        city: String,
        district: String,
        state: String,
        pincode: String,
        mobile:Number
    },
    orderdate:{
        type: Date,
        required: true,
    },
    expectedDeliveryDate: Date,
    paymentMethod: String,
    PaymentStatus: String,
    totalAmount: Number,
    deliveryDate: Date,
    orderStatus: String,
    couponDiscount: Number,
    couponCode: String,
    discountAmount: Number,
    DorderId:String,
})

const order = mongoose.model("order",orderSchema);

module.exports = order