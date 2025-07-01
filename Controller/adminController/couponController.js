const coupon=require("../../model/couponModel")


module.exports={
    adminCoupon:async(req,res)=>{
        try{
            req.session.couponErr
            const coupons=await coupon.find()
            const couponCode=await generateCouponCode()
            res.render('admin/adminCoupon',{coupons,couponCode,err:req.session.couponErr})
            delete req.session.couponErr
        }
        catch(err){
            console.log(err)
        }
    },

    addCoupon:async(req,res)=>{
        try{
            console.log(req.body)
            const existCoupon=await coupon.findOne({couponCode:req.body.couponCode})
            console.log(existCoupon);
            if(!existCoupon||existCoupon==null||existCoupon==undefined){
                console.log("Hi I am here")
                await coupon.create(req.body)
                res.json({successMessage:"Coupon added succcessfully"})
            }else{
                  console.log("Error------------>")
                res.json({errorMessage:"This coupon already exists"})
            }
        }
        catch(err){
            console.log(err)
        }
    },

    editCoupon:async(req,res)=>{
        try{
            const id=req.params.id
            const { couponCode, description, minimumPurchaseAmount, discountAmount, validFrom, expiryDate } =req.body
            const Coupon=await coupon.find({couponCode:couponCode})

            if(Coupon.length>1){
                res.json({errorMessage:"This coupon code already exist"})
            }else{
                await coupon.updateOne({_id:id},{couponCode,description,minimumPurchaseAmount,discountAmount,validFrom,expiryDate})
            }
        }
        catch(err){
            console.log(err)
        }
    },

    deleteCoupon:async(req,res)=>{
        const id=req.params.id
        
    },

    viewCoupon:async(req,res)=>{
        const id=req.params.id
        const coupons=await coupon.findOne({_id:id})
        res.render('admin/viewCoupon',{coupons})
    }
}

async function generateCouponCode() {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var couponCode = '';
        for (var i = 0; i < 10; i++) {
            couponCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }

    const existingCode = await coupon.findOne({ couponCode: couponCode });
    if (existingCode) {
        return generateCouponCode(); // Recursive call if order ID already exists
    } else {
        return couponCode;
    }
}