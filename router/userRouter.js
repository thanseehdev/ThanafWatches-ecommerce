const express = require('express');
const router=express()
const userContoller = require("../Controller/userController/userController")
const productController = require("../Controller/userController/productController")
const profileController = require("../Controller/userController/profileController")
const {liveBlock}=require('../middleware/session2')
const {userVerify,userExists}=require("../middleware/session")
const cartController=require('../Controller/userController/cartController')
const {CountOfCart}=require("../middleware/cartCount")
const orderController = require('../Controller/userController/orderController')
const wishlistController=require('../Controller/userController/wishController')
const chatController=require('../Controller/userController/chatController')
const {wishCount}=require("../middleware/wishCount")


// Home
router.get("/guest",userExists,userContoller.getGuest)
router.get("/",userVerify,CountOfCart,wishCount,userContoller.getHome)
router.get("/cart",userVerify,liveBlock,CountOfCart,wishCount,cartController.getCart)


// Login
router.get("/login",userExists,userContoller.getLogin)
router.post("/login",userContoller.postLogin)
router.get("/logout",userContoller.logout)


// Sign-Up and OTP
router.get("/signup",userExists,userContoller.getSignup)
router.post("/signup",userContoller.postSignup)
router.get("/send-otp",userExists,userContoller.getOtp)
router.post("/get-otp",userContoller.postOtp)
router.get("/resendOtp",userExists,userContoller.getResendotp)
router.get("/invalid_otp",userExists,userContoller.getInvalidotp)


// All product 
router.get("/allproduct",userVerify,liveBlock,CountOfCart,wishCount,productController.getAllproduct)
router.get("/uniqueproduct/:id",userVerify,liveBlock,CountOfCart,wishCount,productController.getSingleproduct)
router.post('/filter',userVerify,CountOfCart,productController.getAllproduct)
router.get('/filter',userVerify,CountOfCart,wishCount,productController.getAllproduct)

router.post("/productReview",userVerify,productController.review)


// Profile 
router.get("/profile",userVerify,liveBlock,profileController.getProfile)
router.get("/addaddress",userVerify,liveBlock,profileController.getAddress)
router.post("/addaddress",userVerify,liveBlock,profileController.postAddress)
router.delete("/deleteAddress/:id",userVerify,liveBlock,profileController.deleteAddress)
router.get("/editAddress/:id",userVerify,liveBlock,profileController.getEditaddress)
router.post("/editaddress",userVerify,liveBlock,profileController.postEditaddress)
router.post("/changepassword",userVerify,liveBlock,profileController.postChangepassword)
router.post('/resetusername',userVerify,liveBlock,profileController.postEditusername)

router.get('/refer&earn',userVerify,userContoller.ReferEarn)
router.post('/withdrawP/:id',userVerify,profileController.withdrawP)


// Cart
router.get("/addtocart/:id/:change",userVerify,liveBlock,cartController.getAddcart)
router.get("/cart",userVerify,liveBlock,CountOfCart,cartController.getCart)
router.delete("/removecart/:id",userVerify,liveBlock,cartController.deleteRemovecart)
router.get("/nocart",userVerify,liveBlock,CountOfCart,cartController.getNocart)

// Wishlist
router.get('/wishlist',userVerify,liveBlock,wishCount,wishlistController.getWishlist)
router.get('/addToWishlist/:id',userVerify,liveBlock,wishlistController.addToWishlist)
router.delete('/removeWish/:productId',userVerify,liveBlock,wishlistController.removeWishlist)


// Order
router.get("/placeorder",userVerify,liveBlock,CountOfCart,orderController.getPlaceorder)
router.get("/getaddress/:id",userVerify,liveBlock,orderController.getAddress)
router.get("/addAddressPO",userVerify,liveBlock,orderController.getAddressPO)
router.post("/addAddressPO",userVerify,liveBlock,orderController.postAddressPO)
router.post("/placeorder/:type",userVerify,liveBlock,orderController.postConfirmorder)
router.get("/userorder",userVerify,liveBlock,CountOfCart,orderController.getOrder)
router.get('/myorderdetails/:orderid',userVerify,liveBlock,orderController.getOrderdetails)
router.put('/cancelorder/:orderid',userVerify,liveBlock,orderController.cancelOrder)
router.put('/cancelsingleproduct/:prodktid/:orderid/:index',userVerify,liveBlock,orderController.cancelSingleproduct)
router.post("/verifypayment",userVerify,orderController.verifypayment);
router.get('/ordersuccess',userVerify,orderController.orderSuccessPage)
router.post('/apply-coupon',userVerify,liveBlock,orderController.applyCoupon)
router.get('/return/:index/:userid/:orderId/:dataId',userVerify,liveBlock,orderController.return)
router.post('/return',userVerify,liveBlock,orderController.returnSubmit)
router.get('/invoice/:index/:orderId/:productId',userVerify,orderController.downloadInvoice)


//chat
router.get('/userChat',userVerify,liveBlock,chatController.getChat)
router.post('/userChat',userVerify,liveBlock,chatController.postChat)

// Search
router.get('/search',userVerify,liveBlock,userContoller.getSearchproduct)




module.exports=router