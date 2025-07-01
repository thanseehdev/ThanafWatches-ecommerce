const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId },

    orderId:{ type: mongoose.Schema.Types.ObjectId },

    dataId:{ type: mongoose.Schema.Types.ObjectId },

    reason:{type:String},

    quantity: {type: Number},

    status : {
        type : String,
        default: "Requested"
      },
      
    createdAt: { type: Date, default: Date.now }

});

const Return = mongoose.model('Return', ReturnSchema);

module.exports = Return
