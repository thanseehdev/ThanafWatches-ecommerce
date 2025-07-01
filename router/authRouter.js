const express = require('express');
const axios = require('axios');
const router=express()
const user = require('../model/userModel')
const Product=require("../model/productModel")
const Banner = require('../model/bannerModel')

const CLIENT_ID = "1084547022914-r08bbmknaetf6klf8q3lpphdab4hob6k.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = 'http://localhost:5000/auth/google/callback';


// Initiates the Google Login flow
router.get('/auth/google', (req, res) => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;

  res.redirect(url);
});


// Callback URL for handling the Google Login response
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });
    const { access_token, id_token } = data;
    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },

    });

  
    const {name, email } = profile;
    req.session.email=email
    req.session.username=name
    req.session.status='active'
    console.log('type===.............'+typeof( req.session.status))
    let users = await user.findOne({ email:email });

    if (!users) {
      users = new user({
        name: name,
        email: email,
        status:req.session.status,
      });
      await users.save();
    }

    let username = req.session.username
    req.session.logged = true;


   const userr = await user.findOne({ email: req.session.email });
      req.session._id = userr._id;
      const pageSize = 6;
      const currentPage = parseInt(req.query.page) || 1;
      const [product, count, banner] = await Promise.all([
        Product.find({ displayStatus: "Show" }).limit(4).populate({ path: 'Category', model: 'category' }),
        Product.find({ displayStatus: "Show" }).count(),
        Banner.find()
      ]);

      const totalpages = Math.ceil(count / pageSize);
      let cart = req.session.cart
      let wish = req.session.wish
      const successMessage = req.session.successMessage;
      delete req.session.successMessage;


      res.render("user/userHome", {
        product,
        count,
        totalpages,
        currentPage,
        username,
        cart,
        wish,
        successMessage,
        errorMessage: null,
        banner,
      });

  } catch (error) {
    if (error) {
        console.log('Errorrrr:', error.response.data.error);
      } else {
        console.error('Error:', error.message);
      }
      res.redirect('/login');
    }
});


module.exports = router;