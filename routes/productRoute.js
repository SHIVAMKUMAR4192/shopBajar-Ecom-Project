const express = require('express')
const router = express.Router();

const { getProducts, newProduct,getSingleProduct,updatePrdouct,deleteProductById,createProductReview, getProductReviews,deleteReview } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

router.route('/product/new').post(isAuthenticatedUser,newProduct);
router.route('/products').get(isAuthenticatedUser,getProducts);
router.route('/product/:id').get(getSingleProduct)
// router.route('/admin/product/:id').put(updatePrdouct)
router.route('/admin/product/:id').put(isAuthenticatedUser,authorizeRoles('admin'),updatePrdouct).delete(isAuthenticatedUser,authorizeRoles('admin'),deleteProductById)
router.route('/review').put(isAuthenticatedUser,createProductReview);
router.route('/review').get(isAuthenticatedUser,getProductReviews);
router.route('/review').delete(isAuthenticatedUser,deleteReview)
module.exports = router;