const OTP = require("../../model/otpModel");
const User = require("../../model/userModel");
const { sendOTP } = require("../../util/otp");
const bcrypt = require("bcrypt");
const Product = require("../../model/productModel");
const category = require("../../model/categoryModel");
const Banner = require('../../model/bannerModel')

module.exports = {

  getGuest: async (req, res) => {
    try {
      res.render("user/guestHome");
    } catch (err) {
      console.log(err);
    }
  },

  getLogin: async (req, res) => {
    try {
      const successMessage = req.session.successMessage;
      const errorMessage = req.session.errorMessage;
      delete req.session.successMessage;
      delete req.session.errorMessage;
      res.render("user/userLogin", {
        pass_err: null,
        status_err: null,
        email_err: null,
        successMessage,
        errorMessage: null,
      });
    } catch (err) {
      console.log(err);
    }
  },

  postLogin: async (req, res) => {
    try {
      console.log('gfiguwsghavqgxvvvdhg')
      const { email, password } = req.body;
      console.log(email)
      const userData = await User.findOne({ email: email });
      if (!userData) {
        return res.render("user/userLogin", {
          email_err: "Account not found with this email address",
          pass_err: null,
          status_err: null,
          successMessage: null,
          errorMessage: null,
        });
      }

      if (userData.status !== "active") {
        return res.render("user/userLogin", {
          email_err: null,
          pass_err: null,
          status_err:
            "Your account is blocked due to some suspicious activities!",
          successMessage: null,
          errorMessage: null,
        });
      }

      const isMatch = await bcrypt.compare(password, userData.password);

      if (!isMatch) {
        return res.render("user/userLogin", {
          email_err: null,
          pass_err: "Invalid password!!",
          status_err: null,
          successMessage: null,
          errorMessage: null,
        });
      }

      req.session.successMessage = "Login Successfull";
      req.session.logged = true;
      req.session.email = email;
      req.session.username = userData.name;
      console.log(">>>>>>>>>")
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  },

  getHome: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.session.email });
      req.session._id = user._id;
      const pageSize = 6;
      const currentPage = parseInt(req.query.page) || 1;
      const [product, count, banner] = await Promise.all([
        Product.find({ displayStatus: "Show" }).limit(4).populate({ path: 'Category', model: 'category' }),
        Product.find({ displayStatus: "Show" }).count(),
        Banner.find()
      ]);

      const totalpages = Math.ceil(count / pageSize);
      let username = req.session.username;
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
    } catch (err) {
      console.log(err);
    }
  },

  getSignup: async (req, res) => {
    try {
      const referralCode = req.query.referralCode || '';
      res.render("user/userSignup", { referralCode });
    } catch (err) {
      console.log(err);
    }
  },

  postSignup: async (req, res) => {
    try {
      const { name, email, password, referralCode } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        req.session.successMessage = "User already exists";
        return res.redirect('/login');
      }

      req.session.email = email;
      req.session.username = name;
      req.session.status = "active";
      req.session.password = await bcrypt.hash(password, 10);

      if (referralCode) {
        const referredByUser = await User.findOne({ referralCode });
        if (!referredByUser) {
          return res.status(400).send('Invalid referral code.');
        }
        req.session.referredBy = referredByUser._id;
      } else {
        req.session.referredBy = null;
      }

      await sendOTP(email);
      
      setTimeout(async () => {
        await OTP.deleteOne({ email });
      }, 60000);

      res.render("user/otp", { successMessage: null, errorMessage: null });
    } catch (err) {
      console.log(err);
    }
  },

  getOtp: async (req, res) => {
    try {
      delete req.session.successMessage;
      delete req.session.errorMessage;
      res.render("user/otp", { successMessage: null, errorMessage: null });
    } catch (err) {
      console.log(err);
    }
  },

  postOtp: async (req, res) => {
    try {
      const { num1, num2, num3, num4 } = req.body;
      const userOtp = [num1, num2, num3, num4].join("").toString();
  
      const generateOtp = await OTP.findOne({ email: req.session.email }, { otp: 1, _id: 0 });
      if (generateOtp.otp == userOtp) {
        const newUser = await User.create({
          email: req.session.email,
          name: req.session.username,
          status: req.session.status,
          password: req.session.password,
          referredBy: req.session.referredBy
        });
  
        if (req.session.referredBy) {
          const referredByUser = await User.findById(req.session.referredBy);
          referredByUser.referredUsers.push(newUser._id);
          referredByUser.points += 50; // Reward points for referring a user
          await referredByUser.save();
        }
  
        req.session.successMessage = "Account created successfully";
        res.redirect("/login");
      } else {
        res.redirect("/invalid_otp");
      }
    } catch (err) {
      console.log(err);
    }
  },

  getResendotp: async (req, res) => {
    try {
      await sendOTP(req.session.email);
      setTimeout(async () => {
        await OTP.deleteOne({ email: req.session.email });
      }, 60000);
      successMessage = "Resend OTP Succefully";
      res.render("user/otp", { successMessage, errorMessage: null });
    } catch (err) {
      console.log(err);
    }
  },

  getInvalidotp: async (req, res) => {
    try {
      req.session.errorMessage = "Entered OTP is Invalid";
      const errorMessage = req.session.errorMessage;
      res.render("user/otp", { errorMessage, successMessage: null });
    } catch (err) {
      console.log(err);
    }
  },
  getSearchproduct: async (req, res) => {
    try {
      const searchTerm = req.query.search;

      // If there's no searchTerm or it's empty, redirect to the home page
      if (!searchTerm || searchTerm.trim() === "") {
        return res.redirect("back");
      }

      const [catgry] = await Promise.all([
        category.findOne({
          categoryname: { $regex: searchTerm, $options: "i" },
        }),
      ]);

      const searchOptions = {
        $or: [
          { productName: { $regex: "^" + searchTerm, $options: "i" } },
          { Description: { $regex: searchTerm, $options: 'i' } },
          { Category: catgry },
        ],
        displayStatus: "Show",
      };


      const searchResults = await Product.find(searchOptions).populate("Category");
      let wish = req.session.wish;
      res.render("user/searchProducts", {
        check: req.session.email,
        username:req.session.username,
        searchResults,
        searchTerm,
        cart: req.session.cart,
        wish,
      });
    } catch (err) {
      console.error(err.message);

      res.render("errorPage", {
        errorMessage: "An error occurred while searching for products.",
      });
    }
  },


  logout: async (req, res) => {
    try {
      req.session.logged = false;
      res.redirect("/login");
    } catch (err) {
      console.log(err);
    }
  },


  ReferEarn: async (req, res) => {
    try {
      let cart = req.session.cart;
      let wish = req.session.wish;
      const user = await User.findOne({ email: req.session.email }).populate("referredBy")
      let referredByUser = null;
        if (user && user.referredBy) {
            referredByUser = await User.findOne({ _id: user.referredBy });
        }
      res.render('user/ReferEarn', { user, cart, wish, username: user.name,referredByUser });
    } catch (err) {
      console.log(err);
    }
  }
  




};
