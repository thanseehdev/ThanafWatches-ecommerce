const User = require("../model/userModel")
const Cart = require("../model/cartModel")
module.exports={
 CountOfCart: async (req, res, next) => {
    try {
      const userEmail=req.session.email;
      const user = await User.findOne({ email: userEmail });
      const userId = user._id;
      const userCart = await Cart.findOne({userid:userId});
      let cartCount=0;
        if (userCart) {
                    cartCount += userCart.products.length
                }
        req.session.cart = cartCount;
    next();
    }catch (error) {
        console.error(error);
        next();
    }
}
}