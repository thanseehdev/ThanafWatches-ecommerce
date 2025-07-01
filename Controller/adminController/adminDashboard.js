const { countRequestedReturns } = require('../../util/returnCount');
const Order = require('../../model/orderModel')
const ReturnData = require('../../model/returnModel')
const path = require('path');
const puppeteer = require('puppeteer');
const ejs = require('ejs');

module.exports = {


    getDashboard: async (req, res) => {
        try {
            var count = await countRequestedReturns()

            const tatalSales = await Order.aggregate([{ $match: { orderStatus: "Order Delivered" } }, { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } }])

            const monthlyEarnings = await Order.aggregate([{ $match: { orderStatus: "Order Delivered" } }, { $group: { _id: { month: { $month: "$orderdate" }, year: { $year: '$orderdate' } }, totalAmount: { $sum: '$totalAmount' } } }])

            const annualEarnings = await Order.aggregate([{ $match: { orderStatus: 'Order Delivered' } }, { $group: { _id: { year: { $year: '$orderdate' } }, totalAmount: { $sum: '$totalAmount' } } }])

            const OrdersT = await Order.find().count()


            const todayEarnings = await Order.aggregate([
                { $match: { orderStatus: "Order Delivered", orderdate: { $gte: new Date(new Date().setHours('00', '00', '00')), $lt: new Date(new Date().setHours(23, 59, 59)) } } },
                { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } }
            ]);
            const todayEarningsTotal = todayEarnings.length > 0 ? todayEarnings[0].totalAmount : 0;

            const totalAmount = tatalSales.length > 0 ? tatalSales[0].totalAmount : 0;
            const monthlyEarningss = monthlyEarnings.length > 0 ? monthlyEarnings.reduce((acc, cur) => acc + cur.totalAmount, 0) : 0;
            const yearlyEarnings = annualEarnings.length > 0 ? annualEarnings.reduce((acc, cur) => acc + cur.totalAmount, 0) : 0;


            const Dcountt = await Order.find({orderStatus:"Order Delivered"}).count()

            const Rcountt = await Order.find({orderStatus:"Returned"}).count()

            const Ccountt = await Order.find({orderStatus:"Cancelled"}).count()

            const RJcountt = await Order.find({orderStatus:"Order Rejected"}).count()

            const Scountt= await Order.find({orderStatus:"Order Shipped"}).count()

            //order Proccessed count
            const Pcountt = await Order.find({orderStatus:"Order Processed"}).count()





            //Top Seeling Product
            const bestSeller = await Order.aggregate([
                { $unwind: "$products", },
                { $group: { _id: "$products.productid", totalCount: { $sum: "$products.quantity" }, }, },
                { $sort: { totalCount: -1, }, },
                { $limit: 6, },
                { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails", }, },
                { $unwind: "$productDetails", },
            ]);

            console.log("saa" + bestSeller + "asas")


            //Payment Method
            const COD = await Order.find({ paymentMethod: 'cashOnDelivery' }).count()
            const ONLINE = await Order.find({ paymentMethod: 'OnlinePayment' }).count()
            const WALLET = await Order.find({ paymentMethod: "walletPayment" }).count()



            //Last Six Month Data
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();

            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            const ThisMonth = await Order.aggregate([
                { $match: { orderdate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
                { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
            ])

            const ThisMonthh = ThisMonth.length > 0 ? ThisMonth[0].totalSales : 0


            //-----
            const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const firstDayOfPreviousMonth = new Date(previousMonthYear, previousMonth, 1);
            const lastDayOfPreviousMonth = new Date(currentYear, currentMonth, 0);

            const lastM = await Order.aggregate([
                { $match: { orderdate: { $gte: firstDayOfPreviousMonth, $lte: lastDayOfPreviousMonth } } },
                { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
            ]);

            const lastMM = lastM.length > 0 ? lastM[0].totalSales : 0


            //---
            const monthBeforeLastYear = currentMonth <= 1 ? currentYear - 1 : currentYear;
            const monthBeforeLastMonth = currentMonth <= 1 ? 11 : currentMonth - 2;
            const firstDayOfLastMonth = new Date(monthBeforeLastYear, monthBeforeLastMonth, 1);
            const lastDayOfLastMonth = new Date(previousMonthYear, previousMonth, 0);

            const lastMPre = await Order.aggregate([
                { $match: { orderdate: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } } },
                { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
            ]);

            const lastMPree = lastMPre.length > 0 ? lastMPre[0].totalSales : 0


            //----
            const twoMonthsAgoYear = currentMonth <= 1 ? currentYear - 1 : currentYear;
            const twoMonthsAgoMonth = currentMonth <= 1 ? 10 : currentMonth - 3;
            const firstDayOfTwoMonthsAgo = new Date(twoMonthsAgoYear, twoMonthsAgoMonth, 1);
            const lastDayOfTwoMonthsAgo = new Date(monthBeforeLastYear, monthBeforeLastMonth, 0);

            const Twomonth = await Order.aggregate([
                { $match: { orderdate: { $gte: firstDayOfTwoMonthsAgo, $lte: lastDayOfTwoMonthsAgo } } },
                { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
            ]);
            const Twomonthh = Twomonth.length > 0 ? Twomonth[0].totalSales : 0


            //---
            const threeMonthsAgoYear = currentMonth <= 2 ? currentYear - 1 : currentYear;
            const threeMonthsAgoMonth = currentMonth <= 2 ? 9 : currentMonth - 4;
            const firstDayOfThreeMonthsAgo = new Date(threeMonthsAgoYear, threeMonthsAgoMonth, 1);
            const lastDayOfThreeMonthsAgo = new Date(twoMonthsAgoYear, twoMonthsAgoMonth, 0);

            const Threemonth = await Order.aggregate([
                { $match: { orderdate: { $gte: firstDayOfThreeMonthsAgo, $lte: lastDayOfThreeMonthsAgo } } },
                { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
            ]);
            const Threemonthh = Threemonth.length > 0 ? Threemonth[0].totalSales : 0


            const fourMonthsAgoYear = currentMonth <= 3 ? currentYear - 1 : currentYear;
            const fourMonthsAgoMonth = currentMonth <= 3 ? 8 : currentMonth - 5;
            const firstDayOfFourMonthsAgo = new Date(fourMonthsAgoYear, fourMonthsAgoMonth, 1);
            const lastDayOfFourMonthsAgo = new Date(threeMonthsAgoYear, threeMonthsAgoMonth, 0);

            const Forthmonth = await Order.aggregate([
                { $match: { orderdate: { $gte: firstDayOfFourMonthsAgo, $lte: lastDayOfFourMonthsAgo } } },
                { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
            ]);
            const Forthmonthh = Forthmonth.length > 0 ? Forthmonth[0].totalSales : 0



            const dashboardData = {
                count,
                totalAmount,
                monthlyEarningss,
                yearlyEarnings,
                todayEarningsTotal,
                OrdersT,
                Dcountt,
                Rcountt,
                Ccountt,
                RJcountt,
                Pcountt,
                Scountt,
                bestSeller,
                COD,
                ONLINE,
                WALLET,
                ThisMonthh,
                lastMM,
                lastMPree,
                Twomonthh,
                Threemonthh,
                Forthmonthh


            };



            res.render("admin/Adashboard", dashboardData)
        }
        catch (err) {
            console.log(err);
        }
    },

    salesReport: async (req, res) => {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).send('Please provide both startDate and endDate');
        }

        try {
            const data = await getSalesReportData(startDate, endDate);
            const pdfBuffer = await generatePDF(data);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="sales_report_${startDate}_to_${endDate}.pdf"`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating report:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    

}
const getSalesReportData = async (startDate, endDate) => {
    try {
        const orders = await Order.find({
            orderdate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).select('userid orderdate paymentMethod couponDiscount totalAmount');
        return orders;
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
};

const generatePDF = async (data) => {
    const overallTotal = data.reduce((sum, order) => sum + order.totalAmount, 0);

    const html = await ejs.renderFile('views/admin/salesReportTemplate.ejs', { orders: data, overallTotal });

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 60000 // Increase the timeout to 60 seconds
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();
    return pdfBuffer;
};