const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require ('../middleware/catchAsyncErrors')
const APIFeatures = require('../utils/apiFeatures');
//create new product = /api/v1/product/new
exports.newProduct = catchAsyncErrors(async (req,res,next) =>{

    req.body.user = req.user.id;
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })
})

//Get all products = /api/v1/products
exports.getProducts =catchAsyncErrors (async (req,res,next) =>{

    const resPerPage =4;
    const productCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(),req.query)
                        .search()
                        .filter()
                        .pagination(resPerPage);
    const products = await apiFeatures.query;

    res.status(200).json({
        success: true,
        count: products.length,
        productCount,
        products
    })
})

//Get single product details = /api/v1/product/:id
exports.getSingleProduct =catchAsyncErrors( async (req,res,next) =>{
    const product = await Product.findById(req.params.id);
    if(!product) {
        return next(new ErrorHandler('Product not found', 404));
    }else{
        res.status(200).json({
            success: true,
            product
        })
    }
})

//update Product = /api/v1/admin/product/:id

exports.updatePrdouct = catchAsyncErrors (async (req,res,next) =>{
    let product = await Product.findById(req.params.id);

    if(!product) {
        return next(new ErrorHandler('Product not found', 404));
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModfy: false
    });

    res.status(200).json({
        success: true,
        product
    })
})

//delete Product = /api/v1/admin/product/:id


exports.deleteProductById = catchAsyncErrors(async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

// Create new review = /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    // Validate input data
    if (!rating || !comment || !productId) {
        return next(new ErrorHandler('Please provide rating, comment, and productId', 400));
    }

    // Find the product by ID
    const product = await Product.findById(productId);

    // Check if the product exists
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    // Create a review object
    const review = {
        user: req.user?._id,
        name: req.user?.name, 
        rating: Number(rating), 
        comment
    };

    // Validate that the user object and user ID are present
    if (!req.user || !req.user._id) {
        return next(new ErrorHandler('User not authenticated or user ID is missing', 400));
    }

    // Check if the user has already reviewed the product
    const existingReview = product.reviews.find(review => review.user && review.user.toString() === req.user._id.toString());

    if (existingReview) {
        // Update the existing review
        existingReview.comment = comment;
        existingReview.rating = Number(rating);
    } else {
        // Add a new review
        product.reviews.push(review);
        product.numofReviews = product.reviews.length;
    }

    // Calculate the average rating for the product
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.ratings = totalRating / product.reviews.length;

    // Save the updated product with reviews and ratings
    await product.save();

    // Return a success response
    res.status(200).json({
        success: true,
        message: 'Review added/updated successfully'
    });
});


//Get product Reviews = /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req,res,next)=>{
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews,

    });
});

//Delete product reviews = /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    // Filter out the review to delete
    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    // Recalculate the number of reviews and average rating
    product.numofReviews = reviews.length;

    if (product.numofReviews > 0) {
        product.ratings = reviews.reduce((acc, item) => acc + item.rating, 0) / product.numofReviews;
        product.ratings = parseFloat(product.ratings.toFixed(2)); // Optionally round to 2 decimal places
    } else {
        product.ratings = 0; // Set to 0 if there are no reviews left
    }

    // Update the product with the new reviews and ratings
    product.reviews = reviews;
    await product.save();

    res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
    });
});
