const Category = require("../../model/categoryModel")
const notifier = require('node-notifier');
const Product = require("../../model/productModel")

module.exports = {

    getCategory: async (req, res) => {
        try {
            const category = await Category.find()
            const successMessage = req.session.successMessage;
            const errorMessage = req.session.errorMessage;
            delete req.session.successMessage;
            delete req.session.errorMessage;
            res.render("admin/adminCategory", { category: category, successMessage, errorMessage })
        }
        catch (err) {
            console.log(err);
        }
    },

    getAddcategory: async (req, res) => {
        try {
            const successMessage = req.session.successMessage
            const errorMessage = req.session.errorMessage
            delete req.session.successMessage
            delete req.session.errorMessage
            res.render("admin/addCategory", { err: null, mes: null, successMessage, errorMessage })
        }
        catch (err) {
            console.log(err);
        }
    },
    
    postAddcategory: async (req, res, next) => {
        try {
            const cat = req.body.categoryname.trim().toUpperCase();

            if (cat === "") {
                req.session.errorMessage = "Category cannot contains spaces!"
                res.redirect('/admin/addcategory');
                return
            }
            if (!/^[a-zA-Z]+$/.test(cat)) {
                req.session.errorMessage = "Category cannot contain numbers!"
                res.redirect('/admin/addcategory');
                return
            }
            const exist = await Category.findOne({ categoryname: cat });

            if (exist) {
                req.session.errorMessage = "Given category already exists"
                res.redirect('/admin/addcategory');
                return
            } else {
                await Category.create({ categoryname: cat });
                await Category.updateOne({categoryname: cat},{$set:{status:'show'}})
                req.session.successMessage = 'Category Added Succesfully'
                res.redirect('/admin/category');
            }

        } catch (err) {
            console.error(err);
        }
    },

    getCategorystatus: async (req, res) => {
        try {
            const { id, status } = req.params;
    
            // Update category status
            if (status === "show") {
                await Category.updateOne(
                    { _id: id },
                    { $set: { status: "hide" } }
                );
                // Update product status when category status is "show"
                await Product.updateMany(
                    { Category: id },
                    { $set: { displayStatus: "hide" } }
                );
            } else {
                await Category.updateOne(
                    { _id: id },
                    { $set: { status: "show" } }
                );
                // Update product status when category status is "hide"
                await Product.updateMany(
                    { Category: id },
                    { $set: { displayStatus: "Show" } }
                );
            }
    
            // Redirect back to the category page
            res.redirect(`/admin/category`);
        } catch (err) {
            console.log(err);
        }
    },
    
    
    editCategory: async (req, res) => {
        try {
            const categoryId = req.params.id;
            const categoryname = await Category.findOne({ _id: categoryId })
            res.render('admin/editCategory', { categoryname, alertMessage: null });
        } catch (error) {
            console.log(error);
        }
    },

    postEditCategory: async (req, res) => {
        try {
            let id = req.body.id
            let newcat = req.body.categoryname
            newcat = newcat.toUpperCase().trim()
            if (newcat === "") {
                req.session.errorMessage = 'Entered Category contain spaces!!';
                res.redirect('/admin/category')
                return
            }
            if (/\d/.test(newcat)) {
                req.session.errorMessage = 'Entered Category contain numbers!!';
                res.redirect('/admin/category')
                return
            }
            const exstCat = await Category.findOne({ categoryname: newcat })

            if (!exstCat) {
                req.session.successMessage = 'Category editted successfully';
                await Category.updateOne({ _id: id }, { $set: { categoryname: newcat } })
                res.redirect('/admin/category')
            } else {
                req.session.errorMessage = 'Given Category already exists';
                res.redirect('/admin/category')
            }


        } catch (error) {
            console.log(error);
        }
    },

}


