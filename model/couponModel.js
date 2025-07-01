const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const couponSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId
    },
    couponCode: {
    type: String,unique: true},
    description: String,
    minimumPurchaseAmount: String,
    discountAmount: String,
    validFrom: String,
    expiryDate: String,
    usedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
