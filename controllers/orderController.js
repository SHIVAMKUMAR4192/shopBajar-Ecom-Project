const Order = require('../models/order');
const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require ('../middleware/catchAsyncErrors')


exports.newOrder = catchAsyncErrors(async(req,res,next) => {

    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
    } = req.body;
    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt:Date.now(),
        user: req.user.id
    })

    res.status(201).json({
        success: true,
        order
    })
});

//Get single order = /api/v1/order/:id

exports.getSingleOrder = catchAsyncErrors(async (req, res,next)=>{

    const order = await Order.findById(req.params.id).populate('user','name email');
    if(!order){
        return next(new ErrorHandler('Order not found',404))
    }
    res.status(200).json({
        success: true,
        order
    })
})

// Get logged in user orders = /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    try {
        // Retrieve the user ID from req.user.id
        const userId = req.user.id;

        // Find orders for the logged-in user
        const orders = await Order.find({ user: userId });

        // Send orders as response
        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        // Handle any errors
        return next(new ErrorHandler('Error fetching user orders', 500));
    }
});

//Get all orders - ADMIN = /api/v1/admin/orders
exports.allOrders = catchAsyncErrors(async (req, res,next)=>{
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    });
});

//Update /Process order - ADMIN = /api/v1/admin/order/:id
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }

    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('This order has already been delivered', 400));
    }

    try {
        // Update stock for each item in the order
        for (const item of order.orderItems) {
            await updateStock(item.product, item.quantity);
        }

        // Update order status and delivery date
        order.orderStatus = req.body.status;
        order.deliveredAt = Date.now();

        // Save the updated order
        await order.save();

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        return next(new ErrorHandler('Failed to update order', 500));
    }
});


async function updateStock(id, quantity) {
    try {
        const product = await Product.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }
        product.stock -= quantity;
        await product.save();
    } catch (error) {
        throw new Error('Failed to update stock');
    }
}



// Delete order by ID - ADMIN
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        // Find the order by ID and delete it
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            // Order not found
            return next(new ErrorHandler('Order not found', 404));
        }

        // Order found and deleted
        res.status(200).json({
            success: true,
            message: 'Order deleted successfully',
        });
    } catch (error) {
        return next(new ErrorHandler('Failed to delete order', 500));
    }
});
