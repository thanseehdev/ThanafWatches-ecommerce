const Category = require("../../model/categoryModel");
const Brand = require("../../model/brandModel");
const product = require("../../model/productModel");
const notifier = require("node-notifier");

module.exports = {
  getProductlist: async (req, res) => {
    try {
      const data = await product.find().populate("Category").populate("Brand");
      console.log(data);
      if (req.query.message) {
        const msg = req.session.message
        delete req.session.message
        res.render("admin/adminProducts", { data, message: msg });
      } else res.render("admin/adminProducts", { data, message: null });
    } catch (err) {
      console.log(err);
    }
  },
  getAddproduct: async (req, res) => {
    try {
      const category = await Category.find();
      const brand = await Brand.find();
      res.render("admin/addProduct", { category, brand });
    } catch (err) {
      console.log(err);
    }
  },

  postAddproduct: async (req, res) => {
    try {
      const fieldsfile = req?.files;
      const productdetails = req.body;
      productdetails["grandprice"] = req.body.price - req.body.discountAmount;
      let images = [
        fieldsfile.images1[0].filename,
        fieldsfile.images2[0].filename,
        fieldsfile.images3[0].filename,
        fieldsfile.images4[0].filename,
      ];
      const Product = { ...productdetails, images };
      await product.create(Product);
      req.session.message="product added succesfully"
      res.redirect("/admin/product");
    } catch (err) {
      console.log(err);
    }
  },

  getListproduct: async (req, res) => {
    try {
      const { id, status } = req.params;
      const productDocument = await product.findOne({ _id: id });
      if (status == "Show") {
        await product.updateOne(
          { _id: id },
          { $set: { displayStatus: "hide" } }
        );
        // message = `successfully hided`;
      } else {
        await product.updateOne(
          { _id: id },
          { $set: { displayStatus: "Show" } }
        );
        // message = `successfully unhided`;
      }
      res.redirect(`/admin/product`);
    } catch (err) {
      console.log(err);
    }
  },
  getEditproduct: async (req, res) => {
    try {
      const id = req.params.id;
      const category = await Category.find();
      const brand = await Brand.find();
      const Product = await product
        .findOne({ _id: id })
        .populate("Category")
        .populate("Brand");
      res.render("admin/editProduct", {
        category: category,
        product: Product,
        brand,
      });
    } catch (err) {
      console.log(err);
    }
  },

  getDeleteimage: async (req, res) => {
    try {
      const productId = req.params.id;
      const index = req.params.index;
      console.log(productId, "index : ", index);
      const Product = await product.findOne({ _id: productId });
      if (!Product) {
        return res.status(404).send("Product is not found");
      }

      const update = await product.updateOne(
        { _id: productId },
        { $pull: { images: index } }
      );
      res.json({ success: true });
    } catch (err) {
      console.log(err);
    }
  },
  postEditproduct: async (req, res) => {
    try {
      const id = req.params.id;
      const images = [];
      const Product = await product.findOne({ _id: id });
      if (Product) {
        images.push(...Product.images);
      }

      for (let i = 0; i < 5; i++) {
        if (req.files[i]) {
          console.log("okkkk");
          let position = req.files[i].fieldname.split("");
          images[position[5] - 1] = req.files[i].filename;
        }
      }

      const UpdatedProducts = req.body;
      console.log(UpdatedProducts);

      const uploaded = await product.updateOne(
        { _id: id },
        { ...UpdatedProducts, images }
      );
      if (uploaded) {
        notifier.notify({
          title: null,
          timeout: 3000,
          message: "Product Edited succussfull",
          wait: true,
        });
        res.redirect("/admin/product");
      }
    } catch (err) {
      console.log(err);
    }
  },
};
