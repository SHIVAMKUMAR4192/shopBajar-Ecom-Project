const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true, 'Please enter product name'],
        trim:true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price:{
        type:Number,
        required:[true, 'Please enter product name'],
        maxLength: [5, 'Product name cannot exceed 5 characters'],
        default:0.0


    },
    description: {
        type:String,
        required:[true, 'Please enter product name'],
    },
    ratings:{
        type:Number,
        min: 0,
        max: 5
        },
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            url: {
               type:String,
               required: true 
            },
        }
    ],
    category:{
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values:[
                'Electronics',
                'Cameras',
                'Laptop',
                'Accessories',
                'Headphones',
                'Food',
                'Books',
                'Clothes/shoe',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home Appliances '
            ],
            message: 'Please select correct category for product'
        }
    },
    seller: {
        type: String,
        required: [true,'Please enter product seller']
    },
    stock:{
        type: Number,
        required: [true, 'Please enter product stock'],
        maxLength: [5, 'Product name cannot exceed 5characters'],
        default: 0
    },
    numofReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    product_quality: {
        type: String
    },
    createdAt:{
        type:Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema);