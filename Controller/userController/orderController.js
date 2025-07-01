const Addres = require('../../model/addressModel');
const Cart = require("../../model/cartModel");
const Order = require('../../model/orderModel');
const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const { createOrder } = require('../../Controller/userController/razorpay')
const crypto = require('crypto');
const Coupon = require('../../model/couponModel')
const Wallet = require("../../model/wallet")
const WalletHistory = require("../../model/walletHistory")
const Return = require('../../model/returnModel')

const puppeteer = require('puppeteer');
const ejs = require('ejs');

module.exports = {

    getOrder: async (req, res) => {
        try {
            const cart = req.session.cart;
            let wish = req.session.wish;
            const username = req.session.username;
    
            // Fetch all orders
            const orderss = await Order.find({ userid: req.session._id }).populate(
                {
                    path: "products.productid",
                    populate: { path: 'Category', model: 'category' }
                }
            ).sort({ orderdate: -1 });
    
            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const limit = 4; // Number of products per page
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
    
            // Get the paginated orders
            const orders = orderss.slice(startIndex, endIndex);
    
            // Calculate the total number of pages
            const totalPages = Math.ceil(orderss.length / limit);
    
            // Render the page with the paginated orders
            res.render("user/Orderlist", {
                username,
                cart,
                orders,
                wish,
                currentPage: page,
                totalPages: totalPages
            });
        } catch (err) {
            console.log(err);
        }
    },
    

    getPlaceorder: async (req, res) => {
        try {
            const successMessage = req.session.successMessage
            const errorMessage = req.session.errorMessage
            delete req.session.errorMessage
            delete req.session.successMessage
            let username = req.session.username;
            let cart = req.session.cart;
            let wish = req.session.wish
            req.session.addadress = true;

            const grandtotal = parseFloat(req.session.grandtotal) || 0;
            const discountCoupon = parseFloat(req.session.discountCoupon) || 0;
            const disctotal = parseFloat(req.session.disctotal) || 0;
            const totalprice = grandtotal - discountCoupon - disctotal;

            let couponD;
            const [address, carts, orders, coupons] = await Promise.all([
                Addres.find({ userid: req.session._id }),
                Cart.findOne({ userid: req.session._id }),
                Order.findOne({ userid: req.session._id }),
                Coupon.find()

            ])
            if (carts && discountCoupon != null) {

                couponD = req.session.discountCoupon
                console.log(grandtotal + "czxcsdcsedwsdc")
                res.render("user/placeOrder", { coupons, address, orders, successMessage, errorMessage, adrsSelect: req.session.address_id, username, cart, grandtotal, disctotal, totalprice, couponD, wish })
                delete req.session.discountCoupon
            }
            else if (carts) {
                res.render("user/placeOrder", { coupons, address, orders, successMessage, errorMessage, adrsSelect: req.session.address_id, username, cart, grandtotal, disctotal, totalprice, couponD, wish })
            }
            else {
                res.redirect("/home")
            }
        }
        catch (err) {
            console.log(err);
        }
    },

    getAddress: async (req, res) => {
        try {
            console.log(req.params.id);
            req.session.address_id = req.params.id
            const address = await Addres.findOne({ _id: req.params.id })
            if (!address) {
                return res.status(404).json({ error: 'Address not found' });
            }
            res.json("success")
        }
        catch (err) {
            console.log(err);
        }
    },

    postAddressPO: async (req, res) => {
        try {
            req.body.userid = req.session._id
            const data = req.body
            await Addres.create({ ...data });
            const address = await Addres.find({ userid: req.session._id })
            req.session.successMessage = "succesfully created address"

            res.redirect("/placeorder")

        }
        catch (err) {
            console.log(err);
        }
    },
    getAddressPO: async (req, res) => {
        try {
            res.render("user/addAddressPO")
        }
        catch (err) {
            console.log(err);
        }
    },

    postConfirmorder: async (req, res) => {
        try {
            const payment = req.params.type;
            console.log(payment + "-------------------------><>>>>>>>>>>>>><>>>>>><>>>>>>");
            const address_id = req.session.address_id
            // Convert variables to numbers if they are not already

            const grandTotal = parseFloat(req.session.grandtotal) || 0;
            const discountCoupon = parseFloat(req.session.discountCoupon) || 0;
            const discTotal = parseFloat(req.session.disctotal) || 0;

            const totalPrice = grandTotal - discountCoupon - discTotal;
            req.session.totalPrice = totalPrice;

            console.log(totalPrice + " total price");

            const disctotal = req.session.disctotal
            const userEmail = req.session.email
            delete req.session.address_id

            const DorderIdd = await generateUniqueOrderId();

            const user = await User.findOne({ email: userEmail })
            const carts = await Cart.findOne({ userid: user._id })
            const addresss = await Addres.findOne({ _id: address_id })
            console.log(carts, "Hlo I am here the cart");


            for (const item of carts?.products) {

                const productInfo = await Product.findOne({ _id: item.productid });
                if (!productInfo) {
                    console.error("Product not found");
                    return res.redirect('/placeorder');
                }

                if (item.quantity > productInfo.stockQuantity) {
                    console.log("Out of Stock");
                    return res.redirect('/placeorder');
                }
            }


            if (address_id == null) {
                req.session.errorMessage = "please select the address or add address"
                res.redirect("/placeorder")
            }

            else if (payment == "cashOnDelivery") {
                const currentDate = new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Kolkata",
                });

                const deliveryDate = new Date(
                    Date.now() + 4 * 24 * 60 * 60 * 1000
                ).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

                let myOrders = {
                    userid: req.session._id,
                    products: carts.products,
                    address: {
                        name: addresss.name,
                        address: addresss.address,
                        locality: addresss.locality,
                        city: addresss.city,
                        district: addresss.district,
                        state: addresss.state,
                        pincode: addresss.pincode,
                    },
                    orderdate: currentDate,
                    expectedDeliveryDate: deliveryDate,
                    paymentMethod: payment,
                    PaymentStatus: "Pending",
                    orderStatus: "Order Processed",
                    totalAmount: totalPrice,
                    couponDiscount: discountCoupon,
                    discountAmount: disctotal,
                    DorderId:DorderIdd
                }
                await Order.create(myOrders)

                for (const data of carts.products) {
                    const prodctId = data.productid
                    const orderQty = data.quantity

                    const prdt = await Product.findOne({ _id: prodctId })

                    const stock = prdt.stockQuantity
                    const newStock = stock - orderQty

                    await Product.updateOne({ _id: prodctId }, { $set: { stockQuantity: newStock } })
                }

                delete req.session.cart
                await Cart.findByIdAndDelete(carts._id)

                console.log("sucess------------------------------------> ");
                res.json({ paymentMethod: "COD" })
            }

            else if (payment == "OnlinePayment") {
                const currentDate = new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Kolkata",
                });

                const deliveryDate = new Date(
                    Date.now() + 4 * 24 * 60 * 60 * 1000
                ).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

                let myOrders = {
                    userid: req.session._id,
                    products: carts.products,
                    address: {
                        name: addresss.name,
                        address: addresss.address,
                        locality: addresss.locality,
                        city: addresss.city,
                        district: addresss.district,
                        state: addresss.state,
                        pincode: addresss.pincode,
                    },
                    orderdate: currentDate,
                    expectedDeliveryDate: deliveryDate,
                    paymentMethod: payment,
                    PaymentStatus: "Paid",
                    orderStatus: "Order Processed",
                    totalAmount: totalPrice,
                    discountAmount: disctotal,
                    couponDiscount: discountCoupon,
                    DorderId:DorderIdd
                }
                const orderrr = await Order.create(myOrders)


                for (const data of carts.products) {
                    const prodctId = data.productid
                    const orderQty = data.quantity

                    const prdt = await Product.findOne({ _id: prodctId })

                    const stock = prdt.stockQuantity
                    const newStock = stock - orderQty

                    await Product.updateOne({ _id: prodctId }, { $set: { stockQuantity: newStock } })
                }
                delete req.session.cart
                console.log("sucess------------------------------------> online payment ")
                createOrder(req, res, orderrr._id + "")
                console.log("sucess------------------------------------> online paymentttt ")


                await Cart.findByIdAndDelete(carts._id)


            } else if (payment == "walletPayment") {

                const wallet = await Wallet.findOne({ userid: user._id })
                if (wallet) {
                    if (wallet.walletB < totalPrice) {
                        res.redirect('/placeorder')
                    } else {

                        await Wallet.updateOne({ userid: user._id }, { $inc: { walletB: -totalPrice } });

                        const walletHistory = await WalletHistory.findOne({ userid: user._id })

                        if (walletHistory) {
                            const type = 'Debit'
                            const reason = "purshased with wallet amount"
                            const date = new Date()
                            await WalletHistory.updateOne({ userid: user._id }, { $push: { Transaction: { amount: totalPrice, reason: reason, type: type, date: date } } }, { new: true })
                        } else {
                            const type = 'Debit'
                            const reason = "purshased with wallet amount"
                            const date = new Date()
                            await WalletHistory.create({ userid: user._id, Transaction: [{ amount: totalPrice, reason: reason, type: type, date: date }] })

                        }

                        const currentDate = new Date().toLocaleString("en-US", {
                            timeZone: "Asia/Kolkata",
                        });

                        const deliveryDate = new Date(
                            Date.now() + 4 * 24 * 60 * 60 * 1000
                        ).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

                        let myOrders = {
                            userid: req.session._id,
                            products: carts.products,
                            address: {
                                name: addresss.name,
                                address: addresss.address,
                                locality: addresss.locality,
                                city: addresss.city,
                                district: addresss.district,
                                state: addresss.state,
                                pincode: addresss.pincode,
                            },
                            orderdate: currentDate,
                            expectedDeliveryDate: deliveryDate,
                            paymentMethod: payment,
                            PaymentStatus: "Paid",
                            orderStatus: "Order Processed",
                            totalAmount: totalPrice,
                            discountAmount: disctotal,
                            couponDiscount: discountCoupon,
                            DorderId:DorderIdd
                        }
                        await Order.create(myOrders)


                        for (const data of carts.products) {
                            const prodctId = data.productid
                            const orderQty = data.quantity

                            const prdt = await Product.findOne({ _id: prodctId })

                            const stock = prdt.stockQuantity
                            const newStock = stock - orderQty

                            await Product.updateOne({ _id: prodctId }, { $set: { stockQuantity: newStock } })
                        }

                        await Cart.findByIdAndDelete(carts._id)
                        delete req.session.cart
                        res.json({ paymentMethod: 'wallet' })
                    }

                } else {
                    console.log("wallet balance is lesssssssssssssssssssssss")
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    },

    getOrderdetails: async (req, res) => {
        try {
            console.log("ujfjasdj gjgjsagjdgja  jjgjsgjkagsdg gjgsjdgas");
            const orderId = req.params.orderid;
            let username = req.session.username;
            let cart = req.session.cart;
            let wish = req.session.wish

            console.log(orderId + "Hi I am ur orderid");
            const usrOdr = await Order.findOne({ _id: orderId }).populate(
                {
                    path: "products.productid", populate:
                        { path: 'Category', model: 'category' }
                })



            console.log(usrOdr + "gjgdjasgj gjugjyass gujgjgjasuj gujyyg a")

            res.render('user/orderDetails', { usrOdr, cart, username, wish })

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    cancelOrder: async (req, res) => {
        try {
            console.log("hai iam order cancell");
            const orderId = req.params.orderid;
            const ordr = await Order.findOne({ _id: orderId });
            const Coupon = parseFloat(ordr.couponDiscount) || 0;
            const totalAmountt = parseFloat(ordr.totalAmount) || 0;
            const Amount = totalAmountt - Coupon;
            console.log("Payment Methodddddd:", ordr.paymentMethod);
            console.log("Payment Statussssss:", ordr.PaymentStatus);

            ordr.orderStatus = "Cancelled";
            await ordr.save();

            if ((ordr.paymentMethod === "OnlinePayment" && ordr.PaymentStatus === "Paid") ||
                (ordr.paymentMethod === "walletPayment" && ordr.PaymentStatus === "Paid")) {

                const wallet = await Wallet.findOne({ userid: ordr.userid });

                if (wallet) {
                    await Wallet.updateOne({ userid: ordr.userid }, { $inc: { walletB: Amount } });
                } else {
                    await Wallet.create({ userid: ordr.userid, walletB: Amount });
                }

                const walletHistory = await WalletHistory.findOne({ userid: ordr.userid });
                const reason = "refund of cancelled orders";
                const type = "Credit";
                const date = new Date();

                if (walletHistory) {
                    console.log("peeeee");
                    await WalletHistory.updateOne(
                        { userid: ordr.userid },
                        { $push: { Transaction: { amount: Amount, reason: reason, type: type, date: date } } },
                        { new: true }
                    );
                } else {
                    console.log("tooooo");
                    await WalletHistory.create({
                        userid: ordr.userid,
                        Transaction: [{ amount: Amount, reason: reason, type: type, date: date }]
                    });
                }

                console.log(">>>>>>>>>>>>>>>>>///////////////////////");
                await Order.updateOne({ _id: ordr._id }, { $set: { PaymentStatus: 'Refunded' } });
                console.log("/>>>>>>>>>/>>>>>>>/>>>>");
            }

            await Order.updateOne(
                { _id: orderId },
                { $set: { 'products.$[].status': 'Cancelled' } }
            );

            ordr.products.forEach(async (data) => {
                const prdkt = await Product.findOne({ _id: data.productid });
                if (prdkt) {
                    prdkt.stockQuantity += data.quantity;
                    await prdkt.save();
                }
            });

            res.json({ msg: 'Order Cancelled Successfully' });

        } catch (error) {
            console.log(error);
        }
    },


    cancelSingleproduct: async (req, res) => {
        console.log(req.params, "hsadhahdgba")
        try {
            const { prodktid, orderid, index } = req.params;
            const odrDtls = await Order.findOne({ _id: orderid })
            const productP = await Product.findOne({ _id: prodktid })
            const ordertotalPrice = parseFloat(odrDtls.totalAmount) || 0;
            const grandprice = parseFloat(productP.grandprice) || 0;
            const couponDiscount = parseFloat(odrDtls.couponDiscount) || 0;
            const amountt = grandprice - couponDiscount;
            const amounttt = ordertotalPrice - grandprice + couponDiscount


            if (odrDtls.paymentMethod == "OnlinePayment" && odrDtls.PaymentStatus == "Paid" || odrDtls.paymentMethod == "walletPayment" && odrDtls.PaymentStatus == "Paid") {
                const wallet = await Wallet.findOne({ userid: odrDtls.userid })


                if (wallet) {
                    await Wallet.updateOne({ userid: odrDtls.userid }, { $inc: { walletB: + amountt } })

                } else {
                    await Wallet.create({ userid: odrDtls.userid, walletB: amountt })
                }
                const walletHistory = await WalletHistory.findOne({ userid: odrDtls.userid })
                console.log("iam single product cancel>>>>>>")
                if (walletHistory) {
                    const reason = "refund of cancelled orders"
                    const type = "Credit"
                    const date = new Date()
                    await WalletHistory.updateOne({ userid: odrDtls.userid }, { $push: { Transaction: { amount: amountt, reason: reason, type: type, date: date } } }, { new: true })
                }
                else {
                    const reason = "refund of cancelled orders"
                    const type = "Credit"
                    const date = new Date()
                    console.log("iam inside else condition")
                    await WalletHistory.create({ userid: odrDtls.userid, Transaction: [{ amount: amountt, reason: reason, type: type, date: date }] })
                }
            }

            Order.updateOne(
                { _id: orderid, 'products._id': odrDtls.products[index]._id },
                { $set: { 'products.$.status': 'Cancelled' }, }
            ).then(async (data) => {

                const odrss = await Order.findOne({ _id: orderid })

                const allCancelled = odrss.products.every(data => data.status === "Cancelled");

                if (allCancelled) {
                    await Order.updateOne({ _id: orderid }, { $set: { orderStatus: 'Cancelled' } })
                }
            });

            await Product.updateOne({ _id: prodktid }, { $inc: { stockQuantity: odrDtls.products[index].quantity } });
            await Order.updateOne({ _id: orderid }, { $set: { totalAmount: amounttt } })

            res.json({ msg: 'Order Cancelled Successfully' })


        } catch (error) {
            console.log(error.message);
        }
    },

    verifypayment: async (req, res) => {
        try {
            //HMAC (Hash-based Message Authentication Code) using the SHA-256 algorithm

            let hmac = crypto.createHmac("sha256", process.env.RazorPay_key_secret);
            console.log('Request Body:', req.body);
            hmac.update(
                req.body.payment.razorpay_order_id + "|" + req.body.payment.razorpay_payment_id
            );

            const calculatedHmac = hmac.digest("hex"); // Log the calculated HMAC
            console.log("Calculated HMAC:", calculatedHmac);

            console.log("Signature from Request Body:", req.body.payment.razorpay_signature);

            if (calculatedHmac === req.body.payment.razorpay_signature) {
                console.log("Entering if condition");
                const orderId = req.body.order.receipt;
                console.log(orderId);
                const O = await Order.updateOne({ _id: orderId }, { $set: { PaymentStatus: "Paid" } });
                console.log(O);

                res.json({ success: true });

            } else {
                console.log("HMAC verification failed");
                res.json({ success: false, error: "Payment verification failed" });
            }
        }
        catch (err) {
            console.log(err);
        }
    },

    applyCoupon: async (req, res) => {
        const { couponCode } = req.body;
        console.log('eeeee' + couponCode + 'haaaaaaaaaaaaaaaaaaaa')
        const userId = req.session._id;


        if (!couponCode || couponCode.trim() === "") {
            console.log('No coupon code provided');
            return res.json({ success: false, message: 'No coupon code provided' });
        }

        try {
            const coupon = await Coupon.findOne({ couponCode: couponCode });

            if (!coupon) {
                console.log('Coupon not found');
                return res.json({ success: false, message: 'Coupon not found' });
            }

            if (coupon.expiryDate <= new Date()) {
                console.log('Coupon expired');
                return res.json({ success: false, message: 'Coupon expired' });
            }

            if (coupon.usedBy.includes(userId)) {
                console.log('Coupon has already been used by this user');
                return res.json({ success: false, message: 'Coupon has already been used by this user' });
            }
            // Mark the coupon as used
            coupon.usedBy.push(userId);
            await coupon.save();

            console.log('coupon apllied successfully');

            req.session.couponCode = couponCode;
            req.session.discountCoupon = coupon.discountAmount;

            return res.json({ success: true, message: 'Coupon applied successfully' });
        } catch (error) {
            console.error('Error applying coupon:', error);
            return res.json({ success: false, message: 'An error occurred while applying the coupon' });
        }
    },



    orderSuccessPage: async (req, res) => {
        try {
            res.render('user/orderSuccess')
        }
        catch (err) {
            console.log(err)
        }
    },

    return: async (req, res) => {
        try {
            const { userid, orderId,index,dataId } = req.params
            
            console.log("inside dataId" + orderId+'ccccccccccccccccccc')
            res.render('user/return', { userid, orderId,index, dataId})
        }
        catch (err) {
            console.log(err)
        }
    },
    returnSubmit: async (req, res) => {
        try {
            const {  orderId,dataId, message ,index} = req.body;
            console.log('zxzx'+dataId+"mnmn")
            const order=await Order.findOne({_id:orderId})

            const data = await Order.findOne({_id: orderId,products: {$elemMatch: {_id: dataId,status: 'Return Requested'}}})
            

            if(data){
                res.json({msg:'Return Reason Already Submitted'})
                res.redirect('/userorder')
            }else{

            console.log('return order>>'+order+",,,,,,,,,,,,,,")
            const returnData={
                userId:order.userid,
                orderId:orderId,
                dataId:dataId,
                reason:message,
                quantity:order.products[index].quantity

            }
             await Return.create(returnData)

             await Order.updateOne({_id:orderId,'products._id':dataId},{$set:{"products.$.status": "Return Requested"}})

            res.json({msg:'Return Submitted Successfully'})
        }
    }
        catch(err){
            console.log(err)
        }
    },
    
    downloadInvoice: async (req, res) => {
        const { index, orderId, productId } = req.params;
        try {
            // Fetch order details from the database
            const order = await Order.findOne({ _id: orderId });
            const product=await Product.findOne({_id:productId})
            console.log('wewewwww' + order + 'nnnnnnnnn' +index+'xxxxxx');
    
            const invoiceData = {
                invoiceNumber: order._id,
                date: new Date().toISOString().split('T')[0],
                DeliveredDate:order.expectedDeliveryDate.toISOString().split('T')[0],
                customer: {
                    name: order.address.name,
                    address: order.address.address,
                    pinCode: order.address.pincode
                },
                items: [
                    { description: product.productName, quantity: order.products[index].quantity, price: order.totalAmount },
                ]
            };
    
            // Calculate total
            invoiceData.total = invoiceData.items.reduce((total, item) => total + item.quantity * item.price, 0);
    
            // Render the invoice template with data using EJS
            const html = await ejs.renderFile('views/user/invoiceTemplate.ejs', invoiceData);
    
            // Launch Puppeteer and generate the PDF
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                timeout: 60000 // Increase the timeout to 60 seconds
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({ format: 'A4' });
            await browser.close();
    
            // Send the PDF as a downloadable attachment
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating invoice:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    

}



async function generateUniqueOrderId() {
    const orderId = crypto.randomBytes(12).toString('hex');

    const existingOrder = await Order.findOne({ DorderId: orderId });
    if (existingOrder) {
        return generateUniqueOrderId(); // Recursive call if order ID already exists
    } else {
        return orderId;
    }
}