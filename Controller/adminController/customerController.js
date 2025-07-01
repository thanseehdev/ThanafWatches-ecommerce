const User = require("../../model/userModel")
module.exports = {
    
    getCustomer: async (req, res) => {
        try {
            const userdata = await User.find()
            res.render("admin/adminCustomer", { customers: userdata })
        }
        catch (err) {
            console.log(err);
        }
    },

    getCustomerstatus: async (req, res) => {
        try {
            const id = req.params.id;
            var message;
            const user = await User.findOne({ _id: id });
    
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            if (user.status !== "active") {
                await User.updateOne({ _id: id }, { $set: { status: 'active' } });
                message = `Successfully activated ${user.name}`;
            } else {
                await User.updateOne({ _id: id }, { $set: { status: 'blocked' } });
                message = `Successfully blocked ${user.name}`;
            }
    
            res.json({ message: message });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}