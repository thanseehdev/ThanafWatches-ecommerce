const Addres = require("../../model/addressModel");
const User = require("../../model/userModel");
const bcrypt = require("bcrypt")
const Coupon=require('../../model/couponModel')
const Wallet=require("../../model/wallet")
const WalletHistory=require("../../model/walletHistory")


module.exports = {

    getProfile: async (req, res) => {
        try {
            const successMessage = req.session.successMessage
            const errorMessage = req.session.errorMessage
            delete req.session.successMessage
            delete req.session.errorMessage
            let wish = req.session.wish
            let user = await User.findOne({ email: req.session.email });
            const address = await Addres.find({ userid: req.session._id })
            const coupons=await Coupon.find()
            const wallet=await Wallet.findOne({userid:req.session._id})
            const walletHistory =  await WalletHistory.findOne({ userid: user._id })

            if (walletHistory && walletHistory.Transaction && walletHistory.Transaction.length > 0) {
                walletHistory.Transaction.sort((a, b) => new Date(b.date) - new Date(a.date));
            }
        
        

            console.log(walletHistory)

            res.render("user/userProfile", { successMessage, errorMessage, username: req.session.username, email: req.session.email, cart: req.session.cart, address, wish,coupons,wallet,walletHistory })
        }
        catch (err) {
            console.log(err);
        }
    },

    getAddress: async (req, res) => {
        try {
            res.render("user/addAddress")
        }
        catch (err) {
            console.log(err);
        }
    },

    postAddress: async (req, res) => {
        try {
            req.body.userid = req.session._id
            const data = req.body
            await Addres.create({ ...data });
            const address = await Addres.find({ userid: req.session._id })
            req.session.successMessage = "succesfully created address"
           
            res.redirect("/profile")
            
        }
        catch (err) {
            console.log(err);
        }
    },

    deleteAddress: async (req, res) => {
        try {
            const id = req.params.id
            await Addres.deleteOne({ _id: id })
            res.json({ msg: 'Address deleted successfully' });
        }
        catch (err) {
            console.log(err);
        }
    },

    getEditaddress: async (req, res) => {
        try {
            const id = req.params.id
            const data = await Addres.findOne({ _id: id })
            console.log(data);
            res.render("user/editAddress", { data })
        }
        catch (err) {
            console.log(err);
        }
    },

    postEditaddress: async (req, res) => {
        try {
            const adrs = req.body
            const upload = await Addres.updateOne({ ...adrs })
            const address = await Addres.find()
            req.session.successMessage = "Address updated successfully"
            if (upload) {
                res.redirect("/profile")
            }
        }
        catch (err) {
            console.log(err);
        }
    },

    postChangepassword: async (req, res) => {
        try {
            const email = req.session.email
            const { currentpassword, password } = req.body
            const data = await User.findOne({ email: email })
            const isMatch = await bcrypt.compare(currentpassword, data.password)
            if (isMatch) {
                const hashpassword = await bcrypt.hash(password, 10)
                const upload = await User.updateOne({ email: email }, { $set: { password: hashpassword } })
                req.session.successMessage = "Password Changed Successfully"
                res.redirect("/profile")
            }
            else {
                req.session.errorMessage = "Current Password is Incorrect"
                res.redirect("/profile")
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    
    postEditusername: async (req, res) => {
        try {
            const newUsrname = req.body.username.trim();
            await User.updateOne(
                { email: req.session.email },
                { $set: { name: newUsrname } }
            );

            req.session.username = newUsrname;
            req.session.successMessage = "Username updated successfully";

            res.redirect("/profile");
        } catch (error) {
            console.log(error);
        }
    },
    withdrawP:async(req,res)=>{
        const { points } = req.body;
        const id=req.params.id

        const userP=await User.findOne({_id:id})
        if(userP.points>=100){
        const wallet=await Wallet.findOne({userid:id})
        const walletHistory=await WalletHistory.findOne({userid:id})

        if (wallet) {
            await Wallet.updateOne({ userid: id }, { $inc: { walletB: + points } })

        } else {
            await Wallet.create({ userid: id, walletB: points })
        }

        if (walletHistory) {
            const reason = "Refer and Earn Points"
            const type = "Credit"
            const date = new Date()
            await WalletHistory.updateOne({ userid:id}, { $push: { Transaction: { amount:points, reason: reason, type: type, date: date } } }, { new: true })
        }
        else {
            const reason = "Refer and Earn Points"
            const type = "Credit"
            const date = new Date()
            await WalletHistory.create({ userid: id, Transaction: [{ amount: points, reason: reason, type: type, date: date }] })
        }
        await User.updateOne({_id:id},{$set:{points:0 }})
        res.json({ message: `Successfully withdraw ${points} points to Wallet` });

    }else{
        return res.status(400).json({message:'refer a friend and earn ₹50'})
    }



    }
}