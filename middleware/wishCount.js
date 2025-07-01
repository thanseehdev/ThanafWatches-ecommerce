const User = require("../model/userModel")
const Wishlist=require('../model/wishlistModel')


module.exports={
    wishCount: async (req, res, next) => {
       try {
         const user = await User.findOne({ email: req.session.email});
         const Wish = await Wishlist.findOne({userid:user._id});
         let count=0;
           if (Wish) {
            count += Wish.products.length
                   }
           req.session.wish = count;
       next();
       }catch (error) {
           console.error(error);
           next();
       }
   }
   }