const Message=require("../../model/chatModel")



module.exports={

    getChat:async(req,res)=>{
        try {
            const cart = req.session.cart;
            const username = req.session.username;
            const messages = await Message.find()
            res.render('user/userChat', { messages,cart,username });
        } catch (error) {
            console.error(error);
        }
    },

    postChat:async(req,res)=>{
        const {text } = req.body;
    try {
        const message = new Message({text });
        await message.save();
        res.redirect('/userChat');
    } catch (error) {
        console.error( error);
    }
    }
}
