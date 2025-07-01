const mongoose = require('mongoose');

const Schema= mongoose.Schema;

const categorySchema=new Schema({
    categoryname:{
        type:String,
    },
    status: {
        type: String,
    },
})
const category=mongoose.model("category",categorySchema);
module.exports=category;