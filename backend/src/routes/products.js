const express = require('express');
const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);

// Protected routes
router.post('/', authenticateToken, requireRole('farmer'), productController.createProduct);
router.get('/my-products', authenticateToken, requireRole('farmer'), productController.getMyProducts);
router.put('/:id', authenticateToken, requireRole('farmer'), productController.updateProduct);
router.delete('/:id', authenticateToken, requireRole('farmer'), productController.deleteProduct);

module.exports = router;
