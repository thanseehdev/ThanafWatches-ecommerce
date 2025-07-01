const wishlist = require('../../model/wishlistModel')
const Products=require('../../model/productModel')
const User=require('../../model/userModel')
const { response } = require('../../router/userRouter')


module.exports={

    addToWishlist: async (req, res) => {
        try {
            const email = req.session.email;
            const user = await User.findOne({ email: email });
            const userId = user._id;
            const productId = req.params.id;
    
            await Products.updateOne({_id:productId},{$set:{inWish:true}})

            const data = await wishlist.findOne({ userid: userId });
            if (data === null) {
                await wishlist.create({ userid: userId, products: [{ productid: productId }] });
                res.json({ success: true, msg: 'Added To wishlist' });
            } else {
                const productInWish = await data.products.find((product) => product.productid.toString() == productId);
                if (!productInWish) {
                    await wishlist.updateOne(
                        { userid: userId },
                        {
                            $addToSet: {
                                products: {
                                    productid: productId
                                }
                            }
                        }
                    );
                    res.json({ success: true, msg: 'Added To wishlist' });
                } else {
                    res.json({ success: false, msg: 'Product Already Exist!!!' });
                }
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, msg: 'Internal Server Error' });
        }
    },
    

    getWishlist: async (req, res) => {
        try {
            const email = req.session.email;
            const user = await User.findOne({ email: email });
            const userId = user._id;
            const cart = req.session.cart;
            const username = req.session.username;
            let wish=req.session.wish
            let wishData = [];
            const Wishlist = await wishlist.findOne({ userid: userId }).populate('products.productid');
    
            if (Wishlist && Wishlist.products && Wishlist.products.length > 0) {
                wishData = Wishlist.products;
                
                res.render('user/userWishlist', { wishData, cart, username,wish });
            } else {
                res.render('user/noWish', {  cart, username ,wish});
            }
        } catch (error) {
            console.log(error);
        }
    },

    removeWishlist:async(req,res)=>{
        try{
            console.log('hai iam remove wish controller!!!!!!!!!!!')
            const email=req.session.email
            const productId=req.params.productId
            await Products.updateOne({_id:productId},{$set:{inWish:false}})
            const userData=await User.findOne({email})
            if(userData){
                const wishData=await wishlist.updateOne({userid:userData._id},{$pull:{products:{productid:productId}}})
                res.json({msg:'Product Removed From Wishlist'})
            }
        }
        catch(error){
            console.log(error)
        }
    }
}    