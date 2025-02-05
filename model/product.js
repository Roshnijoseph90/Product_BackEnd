const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
   /* name:String*/
   name:{
    type:String,
    index:true
},

    price:Number,
    description:String,
    url:String,
    rating: {  // Adding the rating field
        type: Number,
        min: 1,
        max: 5,  // Assuming rating is between 1 and 5
        default: 3
      }
   
})

const Product = mongoose.model("products",productSchema)
module.exports = Product
