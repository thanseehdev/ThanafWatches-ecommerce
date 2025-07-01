const Product = require('../../model/productModel')
const order = require('../../model/orderModel');
const category = require('../../model/categoryModel')
const Return = require('../../model/returnModel')
const Wallet = require("../../model/wallet")
const WalletHistory = require("../../model/walletHistory")
const { countRequestedReturns } = require('../../util/returnCount');
const mongoose = require("mongoose");


module.exports = {

    getOrders: async (req, res) => {
        try {

            const orders = await order.aggregate([
                { $lookup: { from: 'users', localField: 'userid', foreignField: '_id', as: 'userName' } },
                { $unwind: '$userName' },
                { $sort: { orderdate: -1 } },
                {
                    $project: {
                        username: "$userName.name",
                        'userid': 1,
                        'products': 1,
                        'address': 1,
                        'orderdate': 1,
                        'expectedDeliveryDate': 1,
                        'paymentMethod': 1,
                        'PaymentStatus': 1,
                        'totalAmount': 1,
                        'deliveryDate': 1,
                        'orderStatus': 1,
                        'discountAmount': 1
                    }
                }
            ]);

            res.render('admin/adminOrders', { orders, retns: null })

        } catch (error) {
            console.log(error);
        }
    },

    orderStatus: async (req, res) => {
        try {
            const orderId = req.params.orderid
            const status = req.params.status
            console.log("hai hello" + status)

            const currentDate = new Date().toLocaleString("en-US", {
                timeZone: "Asia/Kolkata",
            });

            const ordr = await order.findOne({ _id: orderId })


            if (status == "Order Confirmed") {
                await order.updateOne({ _id: orderId.trim() }, { $set: { orderStatus: status.trim() } })
                ordr.products.forEach(async (data, index) => {
                    if (data.status != "Cancelled") {
                        await order.updateOne({ _id: orderId.trim() }, { $set: { [`products.${index}.status`]: "Confirmed" } })
                    }
                });
                res.json({ msg: 'Order Status Changed Successfully' })
            }

            else if (status == "Order Shipped") {
                await order.updateOne({ _id: orderId.trim() }, { $set: { orderStatus: status.trim() } })
                ordr.products.forEach(async (data, index) => {
                    if (data.status != "Cancelled") {
                        await order.updateOne({ _id: orderId.trim() }, { $set: { [`products.${index}.status`]: "Shipped" } })
                    }
                });
                res.json({ msg: 'Order Status Changed Successfully' })
            }
            else if (status == "Order Delivered") {
                await order.updateOne({ _id: orderId.trim() }, { $set: { orderStatus: status.trim(), deliveryDate: currentDate, PaymentStatus: "Paid" } })
                ordr.products.forEach(async (data, index) => {
                    if (data.status != "Cancelled") {
                        await order.updateOne({ _id: orderId.trim() }, { $set: { [`products.${index}.status`]: "Delivered" } })
                    }
                });
                res.json({ msg: 'Order Status Changed Successfully' })

            }
            else if (status == "Order Rejected") {
                await order.updateOne({ _id: orderId.trim() }, { $set: { orderStatus: status.trim(), deliveryDate: currentDate } })
                ordr.products.forEach(async (data, index) => {
                    if (data.status != "Cancelled") {
                        await order.updateOne({ _id: orderId.trim() }, { $set: { [`products.${index}.status`]: "Rejected" } })
                    }
                });
                res.json({ msg: 'Order Status Changed Successfully' })

            }

        } catch (error) {
            console.log(error);
        }
    },

    getOrderlist: async (req, res) => {
        try {
            const odrId = req.params.ids
            const ordrs = await order.findOne({ _id: odrId }).populate(
                {
                    path: "products.productid", populate:
                        { path: 'Category', model: 'category' }
                })

            console.log(ordrs + "gdugs")
            res.render('admin/adminOrderlist', { ordrs })
        } catch (error) {
            console.log(error);
        }
    },

    returnA: async (req, res) => {
        try {
            var count = await countRequestedReturns()

            let returnData = await Return.find({status: { $in: ['Requested', 'Rejected'] }});
    
            console.log("wwwwwww" + returnData + "zzzzzz")

            res.render('admin/returnA', { returnData, count });

        } catch (err) {
            console.log(err);
        }
    },


    returnReason: async (req, res) => {
        try {
            const dataId = req.params.id
            const orderId = req.params.orderId

            const returnReason = await Return.findOne({ dataId: dataId })

            res.render('admin/returnReason', { returnReason, dataId, orderId });

        } catch (err) {
            console.error(err);
        }
    },




    returnApprove: async (req, res) => {
        try {
            const dataId = req.params.dataId;
            const orderId = req.params.orderId

            const orderr = await order.findById(orderId)

            const product = orderr.products.find(product => product._id.toString() === dataId);

            const productId = product.productid;

            console.log('///????' + productId + 'mzbzbzbzb')

            const ROrder = await order.findOne({ _id: orderId });
            const Rproduct = await Product.findOne({ _id: productId });
            const wallet = await Wallet.findOne({ userid: ROrder.userid });
            const walletHistory = await WalletHistory.findOne({ userid: ROrder.userid });

            const ordertotalPrice = parseFloat(ROrder.totalAmount) || 0;
            const grandprice = parseFloat(Rproduct.grandprice) || 0;
            const couponDiscount = parseFloat(ROrder.couponDiscount) || 0;
            const amount = grandprice - couponDiscount;
            const Amount= ordertotalPrice-grandprice + couponDiscount;


            if (wallet) {
                console.log('inside return wallet');
                await Wallet.updateOne({ userid: ROrder.userid }, { $inc: { walletB: amount } });
            } else {
                console.log('inside return create wallet');
                await Wallet.create({ userid: ROrder.userid, walletB: amount });
            }

            if (walletHistory) {
                console.log('inside return walletHistory');
                const reason = "refund of return order";
                const type = "Credit";
                const date = new Date();

                await WalletHistory.updateOne({ userid: ROrder.userid }, { $push: { Transaction: { amount, reason, type, date } } }, { new: true });
            } else {
                const reason = "refund of return orders";
                const type = "Credit";
                const date = new Date();

                await WalletHistory.create({ userid: ROrder.userid, Transaction: [{ amount, reason, type, date }] });
            }

            const data2 = await order.updateOne({ _id: orderId, 'products._id': dataId }, { $set: { 'products.$.status': 'Returned' } })
                .then(async (data) => {

                    const odrss = await order.findOne({ _id: orderId })

                    const AllReturned = odrss.products.every(data => data.status === "Returned");

                    if (AllReturned) {
                        await order.updateOne({ _id: orderId }, { $set: { orderStatus: 'Returned' } })
                        await order.updateOne({ _id: orderId }, { $set: { PaymentStatus: 'Refunded' } })
                    }
                });
            console.log("heloooo" + data2 + "haiiiiiiii")

            await order.updateOne({_id:orderId},{$set:{totalAmount:Amount}})

            await Return.updateOne({ dataId: dataId }, { $set: { status: 'Approved' } });

            res.json({ msg: 'Return Approved Successfull' })

            res.redirect('/admin/returnA');

            console.log('Return approved successfully');
        }

        catch (err) {
            console.log(err);
        }
    },
    returnReject:async(req,res)=>{
        try{
            const dataId = req.params.dataId;
            const orderId = req.params.orderId

            const data2 = await order.updateOne({ _id: orderId, 'products._id': dataId }, { $set: { 'products.$.status': 'Return Rejected' } })
            .then(async (data) => {

                const odrss = await order.findOne({ _id: orderId })

                const AllReturned = odrss.products.every(data => data.status === "Return Rejected");

                if (AllReturned) {
                    await order.updateOne({ _id: orderId }, { $set: { orderStatus: 'Return Not Possible' } })
                }
            });

            await Return.updateOne({ dataId: dataId }, { $set: { status: 'Rejected' } });

            res.json({ msg: 'Return Rejected Successfull' })

            res.redirect('/admin/returnA');

            console.log('Return approved successfully');

        }
        catch(err){
            console.log(err)
        }
    }
}