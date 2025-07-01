const Product = require("../../model/productModel")
const Category = require("../../model/categoryModel")
const Cart = require("../../model/cartModel")
const wishlist = require("../../model/wishlistModel")
const Users = require("../../model/userModel")
const Review=require("../../model/reviewModel")
const Order=require('../../model/orderModel')

module.exports = {
    getAllproduct: async (req, res) => {
        try {
            console.log('thsi is okkertt')
            const existingQueryString = req.originalUrl.split('?')[1] ? `&${req.originalUrl.split('?')[1]}` : ''
            const { category, min, max,brandd } = req.query
            console.log('thsi is okkertt22222')
            const pageSize = 8;
            const currentPage = parseInt(req.query.page) || 1;
            const username = req.session.username;
            const cart = req.session.cart;

            let product;
            let  flag;
            if (category == undefined && min == undefined && max == undefined && brandd == undefined) {
                flag = 0
                product = await Product.find({ displayStatus: "Show" }).skip((currentPage - 1) * pageSize).limit(pageSize)

            }
            else if (category == undefined && brandd == undefined) {
                flag = 1
                product = await Product.find({ grandprice: { $gte: min, $lte: max }, displayStatus: "Show" }).skip((currentPage - 1) * pageSize).limit(pageSize)
            }
            else if(brandd== undefined && category){
                flag = 1
                product =await Product.find({
                    Category:{$in:category},
                    grandprice:{$gte:min,$lte:max},
                    displayStatus:'Show'
                }).skip((currentPage - 1) * pageSize).limit(pageSize).populate({ path: 'Category', model: 'category' })
            }
            else if(category==undefined && brandd){
                flag=1
                product = await Product.find({
                    Brand:{$in:brandd},
                    grandprice:{$gte:min,$lte:max},
                    displayStatus:'Show'
                }).skip((currentPage - 1) * pageSize).limit(pageSize).populate({path:'Brand',model:'brand'})
            }
            else if(category && brandd && max==undefined && min == undefined){
                flag=1
                    await Product.find({
                    Brand:{$in:brandd},
                    Category:{$in:category},
                    displayStatus:'Show'
                }).skip((currentPage - 1) * pageSize).limit(pageSize).populate({path:'Brand',model:'brand'}).populate({path:'Category',model:'category'})
            }
            else {
                flag = 1;
                product = await Product.find({
                    Category: { $in: category },
                    Brand:{$in:brandd},
                    grandprice: { $gte: min, $lte: max },
                    displayStatus: "Show"
                }).skip((currentPage - 1) * pageSize).limit(pageSize).populate({ path: 'Category', model: 'category' }).populate({ path: 'Brand', model: 'brand' });
            }
            
            const [count,categoryy,brand] = await Promise.all([
                Product.find({displayStatus:"Show"}).count(),
                Product.aggregate([
                    { $lookup:{ from:"categories", localField:"Category", foreignField:"_id", as:"categoryInfo" } }, 
                    { $unwind: '$categoryInfo' },
                    { $group: { _id: { id: '$categoryInfo._id', categoryname: '$categoryInfo.categoryname', status:'$categoryInfo.status' }, count: { $sum: 1 } } } ]),

                Product.aggregate([
                    { $lookup: { from: "brands", localField: "Brand", foreignField: "_id", as: "brandD" } },
                    { $unwind: '$brandD' },
                    { $group: { _id: { id: '$brandD._id', brandname: '$brandD.brandname', status: '$brandD.status' }, count: { $sum: 1 } } } ]) 
            ])
            console.log(brand+'>>>>>>>>>>>>>>>>>>>>>>')
            let wish = req.session.wish
            const totalpages = Math.ceil(count / pageSize);
            let ids=await Users.findOne({email:req.session.email})
            console.log('this is i finded id',ids)
            const wishlist1=await wishlist.findOne({userid:ids._id})
            console.log('thsi is wish list ',wishlist1);
            let pro=[]
            if(wishlist1){
                 pro=wishlist1.products?.map((el)=>el.productid+'')
            }
            console.log('this is okey',pro)
            res.render("user/allProduct", { product,categoryy, count, totalpages, currentPage, username, cart, flag, existingQueryString, wish,brand,pro })

        }
        catch (err) {
            console.log(err);
        }
    },
    
    getSingleproduct: async (req, res) => {
        try {
            const id = req.params.id
            const product1 = await Product.findOne({ _id: id }).populate('Category');
            const reviews=await Review.find({productId:id}).populate('userId');
            console.log(">>>>>>PPPPP" + product1);
            let username = req.session.username;
            let cart = req.session.cart
            let checkcart = await Cart.findOne({ "products.productid": id })
            let wish = req.session.wish
            let wishklist= await 
            res.render("user/singleProduct", { product: product1, username, cart, checkcart, wish, reviews})
        }
        catch (err) {
            console.log(err);
        }
    },

    review: async (req, res) => {
        const { rating, comment, productId } = req.body;
        console.log("Comment:", comment);
    
        const user = await Users.findOne({ email: req.session.email });
    
        const review = await Review.findOne({ userId: user._id });
    
        if (review) {
            await Review.updateOne({ userId: user._id }, { $set: { productId: productId, rating: rating, comment: comment } });
        } else {
            await Review.create({ userId: user._id, productId: productId, rating: rating, comment: comment });
        }
    
        res.json({ mes: "Your Review have Submitted" });
    }

    


}