const mongoose = require('mongoose');

const Schema= mongoose.Schema;

const brandSchema=new Schema({
    brandname:{
        type:String,
    },
    status: {
        type: String,
    },
})
const brand=mongoose.model("brand",brandSchema);
module.exports=brand;