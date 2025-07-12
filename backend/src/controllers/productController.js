const Joi = require('joi');
const db = require('../config/database');

// Validation schemas
const createProductSchema = Joi.object({
  variety: Joi.string().min(2).max(100).required(),
  quantity: Joi.number().integer().min(1).required(),
  pricePerKg: Joi.number().positive().precision(2).required(),
  qualityGrade: Joi.string().valid('premium', 'standard', 'organic').required(),
  harvestDate: Joi.date().min('now').required(),
  description: Joi.string().max(1000).optional(),
  location: Joi.string().max(255).required()
});

class ProductController {
  async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 10, variety, qualityGrade, minPrice, maxPrice, location } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT p.*, u.name as farmer_name, u.phone as farmer_phone, u.email as farmer_email
        FROM products p
        JOIN users u ON p.farmer_id = u.id
        WHERE p.status = 'available'
      `;
      
      const params = [];

      // Add filters
      if (variety) {
        query += ` AND p.variety LIKE ?`;
        params.push(`%${variety}%`);
      }

      if (qualityGrade) {
        query += ` AND p.quality_grade = ?`;
        params.push(qualityGrade);
      }

      if (minPrice) {
        query += ` AND p.price_per_kg >= ?`;
        params.push(parseFloat(minPrice));
      }

      if (maxPrice) {
        query += ` AND p.price_per_kg <= ?`;
        params.push(parseFloat(maxPrice));
      }

      if (location) {
        query += ` AND p.location LIKE ?`;
        params.push(`%${location}%`);
      }

      query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), parseInt(offset));

      const [products] = await db.execute(query, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        WHERE p.status = 'available'
      `;
      const countParams = [];

      if (variety) {
        countQuery += ` AND p.variety LIKE ?`;
        countParams.push(`%${variety}%`);
      }

      if (qualityGrade) {
        countQuery += ` AND p.quality_grade = ?`;
        countParams.push(qualityGrade);
      }

      if (minPrice) {
        countQuery += ` AND p.price_per_kg >= ?`;
        countParams.push(parseFloat(minPrice));
      }

      if (maxPrice) {
        countQuery += ` AND p.price_per_kg <= ?`;
        countParams.push(parseFloat(maxPrice));
      }

      if (location) {
        countQuery += ` AND p.location LIKE ?`;
        countParams.push(`%${location}%`);
      }

      const [countResult] = await db.execute(countQuery, countParams);
      const totalProducts = countResult[0].total;

      res.json({
        success: true,
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts,
          hasNextPage: offset + products.length < totalProducts,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products'
      });
    }
  }

  async createProduct(req, res) {
    try {
      // Validate input
      const { error, value } = createProductSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      // Check if user is a farmer
      if (req.user.userType !== 'farmer') {
        return res.status(403).json({
          success: false,
          message: 'Only farmers can create products'
        });
      }

      const { variety, quantity, pricePerKg, qualityGrade, harvestDate, description, location } = value;

      const [result] = await db.execute(
        'INSERT INTO products (farmer_id, variety, quantity_kg, price_per_kg, quality_grade, harvest_date, description, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.userId, variety, quantity, pricePerKg, qualityGrade, harvestDate, description || null, location]
      );

      // Get the created product
      const [createdProduct] = await db.execute(
        'SELECT * FROM products WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: createdProduct[0]
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product'
      });
    }
  }

  async getMyProducts(req, res) {
    try {
      if (req.user.userType !== 'farmer') {
        return res.status(403).json({
          success: false,
          message: 'Only farmers can view their products'
        });
      }

      const [products] = await db.execute(
        'SELECT * FROM products WHERE farmer_id = ? ORDER BY created_at DESC',
        [req.user.userId]
      );

      res.json({
        success: true,
        products
      });
    } catch (error) {
      console.error('Get my products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your products'
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { quantity, pricePerKg, status, description } = req.body;

      // Check if product belongs to the farmer
      const [products] = await db.execute(
        'SELECT * FROM products WHERE id = ? AND farmer_id = ?',
        [id, req.user.userId]
      );

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or you don\'t have permission to update it'
        });
      }

      // Update product
      const updateFields = [];
      const updateValues = [];

      if (quantity !== undefined) {
        updateFields.push('quantity_kg = ?');
        updateValues.push(quantity);
      }

      if (pricePerKg !== undefined) {
        updateFields.push('price_per_kg = ?');
        updateValues.push(pricePerKg);
      }

      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      updateValues.push(id);

      await db.execute(
        `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      res.json({
        success: true,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product'
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      // Check if product belongs to the farmer
      const [products] = await db.execute(
        'SELECT * FROM products WHERE id = ? AND farmer_id = ?',
        [id, req.user.userId]
      );

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or you don\'t have permission to delete it'
        });
      }

      await db.execute('DELETE FROM products WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product'
      });
    }
  }
}

module.exports = new ProductController();
