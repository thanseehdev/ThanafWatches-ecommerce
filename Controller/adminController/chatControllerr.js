const Message=require("../../model/chatModel")


module.exports={
  getChatA:async(req,res)=>{
    try {
        const messages = await Message.find()
        res.render('admin/adminChat', { messages });
    } catch (error) {
        console.error( error);
    }
  },
  postChatA:async(req,res)=>{
  const { adminReply } = req.body;
  try {
      const message = new Message({ adminReply });
      await message.save();
      res.redirect('/admin/adminChat'); 
  } catch (error) {
      console.error(error);
  }


  }
}