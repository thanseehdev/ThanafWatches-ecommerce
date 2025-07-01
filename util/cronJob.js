const cron = require('node-cron');
const Offer= require('../model/offerModel')
const Product=require('../model/productModel')
const Category = require('../model/categoryModel');



const removeOffer = async (id) => {
  try {
      console.log('esessssssssssssssssss' + id);
      const offerCategory = await Offer.findOne({ _id: id });
      if (!offerCategory) {
          console.log('Offer not found');
          return;
      }
      const offerCategoryName = offerCategory.Catagory;
      const category = await Category.findOne({ categoryname: offerCategoryName });
      if (!category) {
          console.log('Category not found');
          return;
      }
      const products = await Product.find({ Category: category._id });
      for (const product of products) {
          await Product.updateOne(
              { _id: product._id },
              { $set: { price: product.oldPrice, inCategoryOffer: false } }
          );
      }
      await Offer.findByIdAndDelete(id);
      console.log('offer deleted successfully');
  } catch (err) {
      console.log('Error in removeOffer:', err);
  }
};




function setupCronJob() {
  cron.schedule('0 0 * * *', async () => {
      console.log('Inside cron job');
      try {
          const now = new Date();
          const expiredOffers = await Offer.find({ expiryDate: { $lte: now } });
          if(expiredOffers){
          for (const offer of expiredOffers) {
              await removeOffer(offer._id);
          }
          console.log('Expired offers deleted successfully');
        }
      } catch (err) {
          console.error('Error deleting expired offers:', err);
      }
  });
}

  module.exports = {
    setupCronJob
  };