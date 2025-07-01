const express = require('express');
const {adminExists,adminVerify}=require("../middleware/session");
const upload=require("../middleware/multer")
const adminController=require("../Controller/adminController/adminController")
const productController=require("../Controller/adminController/productController")
const categoryController=require("../Controller/adminController/categoryController")
const brandController=require('../Controller/adminController/brandController')
const customerController=require("../Controller/adminController/customerController")
const orderController=require("../Controller/adminController/orderController")
const router=express();
const chatController=require('../Controller/adminController/chatControllerr')
const couponController=require('../Controller/adminController/couponController')
const bannerController=require('../Controller/adminController/bannerController')
const offerController=require('../Controller/adminController/offerController')
const dashboardController=require('../Controller/adminController/adminDashboard')


// admin login
router.get("/",adminVerify,dashboardController.getDashboard)
router.get("/login",adminExists,adminController.getLogin)
router.post("/login",adminController.postLogin)
router.get("/logout",adminController.logout)


// admin product
const uploadfields = [
    {name:"images1",maxCount:1},
    {name:"images2",maxCount:1},
    {name:"images3",maxCount:1},
    {name:"images4",maxCount:1}
]
router.get("/product",adminVerify,productController.getProductlist)
router.get("/addproducts",adminVerify,productController.getAddproduct)
router.post("/addproducts",upload.fields(uploadfields),adminVerify,productController.postAddproduct);
router.get("/blockproduct/:id/:status",adminVerify,productController.getListproduct)
router.get("/editproduct/:id",adminVerify,productController.getEditproduct)
router.post("/editProducts/:id",upload.any(),productController.postEditproduct)
router.get("/deleteImage/:id/:index",adminVerify,productController.getDeleteimage)


// admin category
router.get("/category",adminVerify,categoryController.getCategory)
router.get("/addcategory",adminVerify,categoryController.getAddcategory)
router.post("/addcategory",adminVerify,categoryController.postAddcategory)
router.get("/categories/:id/:status",adminVerify,categoryController.getCategorystatus)
router.get('/editcategory/:id',adminVerify,categoryController.editCategory);
router.post('/Updatecategory',adminVerify,categoryController.postEditCategory)


// admin brand
router.get('/brand',adminVerify,brandController.getBrand)
router.get('/addbrand',adminVerify,brandController.getAddbrand)
router.post('/addbrand',adminVerify,brandController.postAddbrand)
router.get('/statusBrand/:id/:status',adminVerify,brandController.changeBrandStatus)
router.get('/editBrand/:id',adminVerify,brandController.editBrand)
router.post('/updateBrand',adminVerify,brandController.updateBrand)


// admin customers
router.get("/customers",adminVerify,customerController.getCustomer)
router.get("/customers/block/:id/:status",adminVerify,customerController.getCustomerstatus)


// admin orders
router.get('/adminorders',adminVerify,orderController.getOrders)
router.put('/updateorderstatus/:orderid/:status',adminVerify,orderController.orderStatus)
router.get('/orderlist1/:ids',adminVerify,orderController.getOrderlist)


// chat
router.get('/adminChat',adminVerify,chatController.getChatA)
router.post('/adminChat',adminVerify,chatController.postChatA)

// coupon
router.get('/coupon',adminVerify,couponController.adminCoupon)
router.get('/viewCoupons/:id',adminVerify,couponController.viewCoupon)
router.post('/addCoupon',adminVerify,couponController.addCoupon)
router.put('/editCoupon/:id',adminVerify,couponController.editCoupon)
router.delete('/deleteCoupon/:id',adminVerify,couponController.deleteCoupon)


//banner
const uploadBanner = [
    {name:"image",maxCount : 1}
  ]

router.get('/banner',adminVerify,bannerController.getBanner)
router.post('/addBanner',upload.fields(uploadBanner),bannerController.addBanner)
router.get('/deleteBanner',adminVerify,bannerController.deleteBanner)


//offer
router.get('/offer',adminVerify,offerController.getOffer)
router.post('/addOffer',adminVerify,offerController.addOffer)
router.get('/removerOffer/:id',adminVerify,offerController.removeOffer)


router.get('/returnA',adminVerify,orderController.returnA)
router.get('/returnReason/:id/:orderId',adminVerify,orderController.returnReason)
router.get('/returnApprove/:dataId/:orderId',adminVerify,orderController.returnApprove)
router.get('/returnReject/:dataId/:orderId',adminVerify,orderController.returnReject)

//admin Dash
router.post('/salesReport',adminVerify,dashboardController.salesReport)



module.exports=router