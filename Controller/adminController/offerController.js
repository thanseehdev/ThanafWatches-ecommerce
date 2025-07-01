const Category=require('../../model/categoryModel')
const Offer=require('../../model/offerModel')
const Product = require("../../model/productModel");

module.exports={

    getOffer:async(req,res)=>{
        try{
            const [category,offer]=await Promise.all([
                Category.find(),
                Offer.find()
            ])

            res.render('admin/offer',{category,offer,err:""})
        }
        catch(err){
            console.log(err)
        }
    

},
addOffer:async (req, res) => {
    try {
        const data = req.body;
        const { Catagory, discount, expiryDate } = req.body;
        const category = await Category.findOne({ categoryname: Catagory.trim() });
        

        const products = await Product.find({ Category: category._id });

        for (const product of products) {
            await Product.updateOne(
                {_id:product._id},
                {$set:{oldPrice: product.price,inCategoryOffer:true}})

            const newPrice =Math.floor( product.price - (product.price * discount) / 100);
            await Product.findByIdAndUpdate(product._id, { price: newPrice});
        }

        await Offer.create(data);

        res.redirect('/admin/offer');
    } catch (err) {
        console.log(err);
    }
}
,
removeOffer: async (req, res) => {
    try {
        console.log('njan delete offerdaaa' + req.params.id)
        const id = req.params.id
        const offerCategory=await Offer.findOne({_id:id})
        const category=await Category.findOne({categoryname:offerCategory.Catagory})
        const products = await Product.find({ Category:category._id });
        for (const product of products) {
            await Product.updateOne(
                { _id: product._id },
                { $set: {price:product.oldPrice,inCategoryOffer:false } })

            }
        await Offer.findByIdAndDelete(id)
        res.redirect('/offer')
    }
    catch (err) {
        console.log(err)
    }
}


}