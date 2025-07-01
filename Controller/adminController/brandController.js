const Brand = require('../../model/brandModel')

module.exports = {
    getBrand: async (req, res) => {
        try {
            const brand = await Brand.find()
            const successMessage = req.session.successMessage;
            const errorMessage = req.session.errorMessage;
            delete req.session.successMessage;
            delete req.session.errorMessage;
            res.render("admin/adminBrand", {brand , successMessage, errorMessage })
        }
        catch (err) {
            console.log(err);
        }
    },

    getAddbrand: async (req, res) => {
        try {
            const successMessage = req.session.successMessage
            const errorMessage = req.session.errorMessage
            delete req.session.successMessage
            delete req.session.errorMessage
            res.render("admin/addBrand", { err: null, mes: null, successMessage, errorMessage })
        }
        catch (err) {
            console.log(err);
        }
    },
    
    postAddbrand: async (req, res, next) => {
        try {
            const brand = req.body.brandname.trim().toUpperCase();

            if (brand === "") {
                req.session.errorMessage = "Brand cannot contains spaces!"
                res.redirect('/admin/addbrand');
                return
            }
            if (!/^[a-zA-Z]+$/.test(brand)) {
                req.session.errorMessage = "Brand cannot contain numbers!"
                res.redirect('/admin/addbrand');
                return
            }
            const exist = await Brand.findOne({ brandname: brand });

            if (exist) {
                req.session.errorMessage = "Given brand already exists"
                res.redirect('/admin/addbrand');
                return
            } else {
                await Brand.create({ brandname: brand });
                await Brand.updateOne({brandname: brand},{$set:{status:'show'}})
                req.session.successMessage = 'Brand Added Succesfully'
                res.redirect('/admin/brand');
            }

        } catch (err) {
            console.error(err);
        }
    },

    changeBrandStatus: async (req, res) => {
        try {
            const { id, status } = req.params;
            await Brand.findOne({ _id: id });
            if (status == "show") {
                await Brand.updateOne(
                    { _id: id },
                    { $set: { status: "hide" } }
                );
            } else {
                await Brand.updateOne(
                    { _id: id },
                    { $set: { status: "show" } }
                );
            }
            res.redirect(`/admin/brand`);
        } catch (err) {
            console.log(err);
        }
    },

    editBrand:async(req,res)=>{
        try{
            const brandId = req.params.id;
            const brandname = await Brand.findOne({ _id: brandId })
            res.render('admin/editBrand', { brandname, alertMessage: null });
        }
        catch(err){
            console.log(err)
        }
    },
    updateBrand:async(req,res)=>{
        try{
            let id = req.body.id
            let nbrand = req.body.brandname
            nbrand = nbrand.toUpperCase().trim()
            if (nbrand === "") {
                req.session.errorMessage = 'Entered Brand contain spaces!!';
                res.redirect('/admin/brand')
                return
            }
            if (/\d/.test(nbrand)) {
                req.session.errorMessage = 'Entered Brand contain numbers!!';
                res.redirect('/admin/brand')
                return
            }
            const exstCat = await Brand.findOne({ brandname: nbrand })

            if (!exstCat) {
                req.session.successMessage = 'Brand editted successfully';
                await Brand.updateOne({ _id: id }, { $set: { brandname: nbrand } })
                res.redirect('/admin/brand')
            } else {
                req.session.errorMessage = 'Given Brand already exists';
                res.redirect('/admin/brand')
            }
        }
        catch(err){
            console.log(err)
        }
    }
}