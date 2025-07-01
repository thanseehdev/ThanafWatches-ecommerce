const userr = require("../model/userModel")

module.exports = {
    liveBlock:async(req,res,next)=>{
        try{
            const email=req.session.email
            const user= await userr.findOne({ email: email });
            if (user.status !== "active") {
                return res.render("user/userLogin", {
                  email_err: null,
                  pass_err: null,
                  status_err:null,
                  successMessage: "Your account is blocked due to some suspicious activities!",
                  errorMessage: null,
                });
              }
              else{
                next()
              }
        }
        catch (err) {
            console.log(err);
        }
    }

}