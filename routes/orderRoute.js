const express = require('express');
const router = express.Router();

const{
    newOrder,
    getSingleOrder,
    myOrders,
    allOrders,
    updateOrder,
    deleteOrder,

}= require('../controllers/orderController');

const { isAuthenticatedUser,authorizeRoles } = require('../middleware/auth');

router.route('/order/new').post(isAuthenticatedUser,newOrder);
router.route('/orders/:id').get(isAuthenticatedUser,getSingleOrder);
router.route('/orders/my').get(isAuthenticatedUser,myOrders);
router.route('/admin/orders/').get(isAuthenticatedUser,authorizeRoles('admin'), allOrders);
router.route('/admin/order/:id').put(isAuthenticatedUser,authorizeRoles('admin'),updateOrder);
 router.delete('/admin/order/:id', isAuthenticatedUser, deleteOrder);
module.exports = router;