const Razorpay=require('razorpay')

var instance = new Razorpay({
    key_id: process.env.RazorPay_key_id,
    key_secret: process.env.RazorPay_key_secret,
});

const createOrder=(req,res,orderid)=>{
    try{
        const total= req.session.totalPrice
        var options={
            amount:total*100,
            currency:"INR",
            receipt:orderid
        }

        instance.orders.create(options,function(err,order){
            if(err){
                console.log("razorpay error:",err)
                res.status(500).send('error i creating order')
            }else{
                console.log("order created successfully>*>*",order)
                res.json({order:order,paymentMethod:"onlinePayment"})
            }
        })
    }catch(err){
        console.log('something went wrong',err)
        res.status(500).send('error in creating order')
    }
}

module.exports={
    createOrder,
}