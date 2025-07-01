const User = require("../../model/userModel")
const Cart = require("../../model/cartModel")
const Product = require("../../model/productModel")

module.exports = {

    getCart: async (req, res) => {
        try {
            const useremail = req.session.email;
            const username = req.session.username;
            console.log(useremail);
            
            // Find the user
            const user = await User.findOne({ email: useremail });
            if (!user) {
                throw new Error('User not found');
            }
    
            // Find the user's cart and populate product details
            const usercart = await Cart.findOne({ userid: user._id }).populate({ 
                path: "products.productid", 
                populate: { path: 'Category', model: 'category' } 
            });
            console.log(usercart);
    
            // If user cart exists and has products
            if (usercart && usercart.products.length > 0) {
                const carts = usercart.products;
                let grandtotal = 0;
                let disctotal = 0;
    
                // Calculate totals
                carts.forEach((cur) => {
                    if (cur.productid && cur.productid.price && cur.quantity) {
                        grandtotal += cur.productid.price * cur.quantity;
                        disctotal += cur.productid.discountAmount * cur.quantity;
                    }
                });
    
                // Set session variables
                req.session.grandtotal = grandtotal;
                req.session.disctotal = disctotal;
                const totalprice = grandtotal - disctotal;
                console.log(totalprice);
    
                // Render the cart page
                res.render("user/userCart", { 
                    username, 
                    cart: req.session.cart, 
                    carts, 
                    grandtotal, 
                    disctotal, 
                    totalprice, 
                    wish: req.session.wish 
                });
            } else {
                // No cart found, redirect to a page indicating no cart
                res.redirect('/nocart');
            }
        } catch (err) {
            // Handle errors
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    },

    getAddcart: async (req, res) => {
        try {
            delete req.session.discountCoupon
            const userEmail = req.session.email;
            const user = await User.findOne({ email: userEmail });
            const userId = user._id;
            const productId = req.params.id;
            const change = req.params.change;

            const userCart = await Cart.findOne({ userid: userId });
            const product = await Product.findOne({ _id: productId })
            if (product.stockQuantity != 0) {
                if (userCart == null) {
                    const cartData = {
                        userid: userId,
                        products: [{ productid: productId, quantity: 1 }]
                    }
                    await Cart.create(cartData)
                    res.json({ msg: "Product added to cart Successfully" })

                } else {
                    const existPrdct = await Cart.findOne({ userid: userId, 'products.productid': productId })
                    if (existPrdct) {
                        await Cart.updateOne(
                            { userid: userId, 'products.productid': productId },
                            { $inc: { 'products.$.quantity': change } }
                        )
                        res.json({ msg: "This product already exist in the cart" })
                    } else {
                        await Cart.updateOne(
                            { userid: userId },
                            { $push: { products: { productid: productId, quantity: 1 } } }
                        )
                        res.json({ msg: "New product added" })
                    }
                }
            } else {
                res.json({ msg: "out of stock  product" })
            }

        }
        catch (err) {
            console.log(err);
        }
    },

    deleteRemovecart: async (req, res) => {
        try {
            await Cart.updateOne({
                userid: req.session._id
            },
                {
                    $pull:
                    {
                        products:
                        {
                            productid: req.params.id.trim()
                        }
                    }
                })
            res.json({ msg: 'item removed from cart successfully' })
        } catch (err) {
            console.log(err);
        }

    },
    
    getNocart: async (req, res) => {
        try {
            const username = req.session.username;
            const cart = req.session.cart
            res.render("user/noCart", { cart, username, wish: req.session.wish })
        }
        catch (err) {
            console.log(err);
        }
    },
}