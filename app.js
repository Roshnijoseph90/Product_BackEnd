const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT
const bcrypt = require('bcrypt')
const cors = require('cors')

require('dotenv').config()
app.use(express.json())
app.use(cors(
    { 
        origin:"https://product-frontend-9fqu.onrender.com"

    }
))


const jwt = require('jsonwebtoken')
const secretKey = 'secrect123'


app.get('/', (req, res) => {
    res.send("From the server");
});
const url =process.env.MONODB_URL

async function main() {
    console.log(url)
    await mongoose.connect(url);
}

main()
    .then(() => console.log("DB connected"))
    .catch((error) => console.log(error));

    
    //Token authenticate
const authenticateToken = (req,res,next)=>{
    const token = req.headers['authorization']?.split(' ')[1]; 
    if(!token) return res.status(401).json({message:"Token not provided"})

    jwt.verify(token,secretKey,(err,user)=>{
        if(err) return res.status(403).json({error:"Invalid token",err:err})
        req.user = user
        next()

    })

}
     


    

const Product = require('./model/product');
//Get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);  // Send products in response
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Creata a products
app.post('/products', async (req,res)=>{
    try{
       const product = new Product(req.body)
        await product.save()
        res.status(201).json(product)

    }catch(error){
        res.status(400).json(error)
    }

})
//Get product by id
app.get("/products/:id",async (req,res)=>{
    try{

        const productId = req.params.id;
        const product = await Product.findById(productId)
        if(!product){
            return res.status(404).json({message:"product not found"})
        }
        else{
            res.status(200).json(product)
        }


    }
    catch(error){
        res.status(400).json(error)
    }
})

//Update a product

app.patch("/products/:id",async (req,res)=>{
    try{
        const productId= req.params.id;
        const product = await Product.findByIdAndUpdate(productId,req.body,{new:true})
        res.status(200).json(product)

    }catch(error){
        res.status(400).json(error)
    }


   
})
// Delete product
app.delete('/products/:id',async (req,res)=>{
    try{
        const productId = req.params.id
        const product = await Product.findByIdAndDelete(productId)
        if(!product){
            return res.status(404).json({message:"product not found"})
        }
        else{
            res.status(200).json({message:"Product Deleated Sucessfully"})
        }

    }
    catch(error){
        res.status(400).json(error)
    }
})

// Get Product count for price grater than input price
app.get('/products/count/:price',async(req,res)=>{
    try{

        const price = Number(req.params.price)
        console.log(price)
        const productCount = await Product.aggregate([
            {
                $match:{price:{$gt:price}}
            },
            {
                $count:"productCount"
            }
        ])
        res.status(200).send(productCount)
   

    }catch( error){
        res.status(400).json(error)

    }
})
const User = require('./model/user')
// Login route
app.post('/login', async (req,res)=>{
    try{

        const {email,password} = req.body
        const user = await User.findOne({email:email})
        if(!user){
            return res.status(500).json({message:"user not found"})
        }
        console.log(password)
        console.log(user.password)
        const isValid = await bcrypt.compare(password,user.password)
        console.log(isValid)
        if(!isValid){
            return res.status(500).json
            ({message:"Invalid credentials"})
        }
        // token creation 
        let payload = {user:email}
    
    let token = jwt.sign(payload,secretKey)
    console.log(token)
    res.status(200).json({message:"Login sucessful",token:token})

    }catch(error){
        res.status(500).json({ message: "Error logging in", error: error.message })

    }
   

})
app.post('/user',async (req,res)=>{
    try{
        const saltRounds  = 10
        bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {

            if(err){
                console.error("Error occured while hashing",err)
                res.status(500).json({error:"Internal server error"})
            }
            
            var userItem = {
                name:req.body.name,
                email:req.body.email,
                password:hash,
                createAt: new Date()
    
            }
            var user = new User(userItem)
            await user.save()
            res.status(201).json(user)
            // Store hash in your password DB.
        })
       
        
    }catch(error){
        res.status(400).json(error)

    }
})

  
app.listen(port, (err) => {
    if (err) {
        console.log(`Error starting the server: ${err}`);
        process.exit(1);  // Exit if server can't start
    } else {
        console.log(`Server started`);
    }
});
