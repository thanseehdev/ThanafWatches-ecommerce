const { countRequestedReturns } = require('../../util/returnCount');


module.exports = {

    getLogin: async (req, res) => {
        try {
            res.render("admin/adminLogin", { err: null })
        }
        catch (err) {
            console.log(err);
        }
    },

    postLogin: async (req, res) => {
        try {
            const credential = {
                email: "admin@gmail.com",
                password: 123
            }
            const { email, password } = req.body;
            if (email === credential.email && password == credential.password) {
                req.session.adminlogged = true;
                req.session.adminemail = email;
                res.redirect("/admin");
            }
            else res.render("admin/adminLogin", { err: "your enter the password or email incorrect" })
        }
        catch (err) {
            console.log(err);
        }
    },
    
    logout: async (req, res) => {
        try {
            req.session.adminlogged = false;
            res.redirect("/admin")
        }
        catch (err) {
            console.log(err);
        }
    }
}