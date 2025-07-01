const mongoose = require('mongoose');

function generateReferralCode() {
    return Math.random().toString(36).substr(2, 9);
}

const userSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
    },
    password:{
        type:String,
    },
    status:{
        type:String,
    },
    referralCode: { type: String, unique: true },

    referredBy: { type: String },

    referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    points: {type: Number, default: 0},
},
{
    timestamps:true,
},
);

userSchema.pre('save', function(next) {
    if (!this.referralCode) {
      this.referralCode = generateReferralCode();
    }
    next();
});
  
const Users = mongoose.model("User", userSchema);
module.exports = Users;
