import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductList from './ProductList';

const Dashboard = ({ user, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    variety: '',
    quantity: '',
    pricePerKg: '',
    qualityGrade: 'standard',
    harvestDate: '',
    description: '',
    location: ''
  });

  useEffect(() => {
    fetchProducts();
    if (user.userType === 'farmer') {
      fetchMyProducts();
    }
  }, [user.userType]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/products/my-products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMyProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching my products:', error);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/products', newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert('Product added successfully!');
        setNewProduct({
          variety: '',
          quantity: '',
          pricePerKg: '',
          qualityGrade: 'standard',
          harvestDate: '',
          description: '',
          location: ''
        });
        fetchProducts();
        fetchMyProducts();
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert(error.response?.data?.message || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value
    });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    avatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#27ae60',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    },
    userDetails: {
      lineHeight: '1.5'
    },
    userName: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0'
    },
    userRole: {
      fontSize: '14px',
      opacity: '0.8',
      margin: '0'
    },
    headerActions: {
      display: 'flex',
      gap: '10px'
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#2c3e50'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '20px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#27ae60',
      margin: '0'
    },
    statLabel: {
      fontSize: '14px',
      color: '#666',
      margin: '5px 0 0 0'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user.userType === 'farmer' ? '🌱' : '🏪'}
          </div>
          <div style={styles.userDetails}>
            <h2 style={styles.userName}>Welcome, {user.name}!</h2>
            <p style={styles.userRole}>
              {user.userType === 'farmer' ? '🌱 Farmer' : '🏪 Wholesaler'} • {user.email}
            </p>
            {user.location && <p style={styles.userRole}>📍 {user.location}</p>}
          </div>
        </div>
        <div style={styles.headerActions}>
          <button className="btn btn-danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statNumber}>{products.length}</p>
          <p style={styles.statLabel}>Available Products</p>
        </div>
        {user.userType === 'farmer' && (
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{myProducts.length}</p>
            <p style={styles.statLabel}>My Products</p>
          </div>
        )}
        <div style={styles.statCard}>
          <p style={styles.statNumber}>
            {user.userType === 'farmer' ? '🌱' : '🏪'}
          </p>
          <p style={styles.statLabel}>
            {user.userType === 'farmer' ? 'Farmer Account' : 'Wholesaler Account'}
          </p>
        </div>
      </div>

      {/* Farmer Product Form */}
      {user.userType === 'farmer' && (
        <div className="card">
          <h3 style={styles.sectionTitle}>🌱 Add New Product</h3>
          <form onSubmit={handleProductSubmit}>
            <div style={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Banana Variety:</label>
                <input
                  type="text"
                  name="variety"
                  value={newProduct.variety}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Cavendish, Robusta"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Quantity (kg):</label>
                <input
                  type="number"
                  name="quantity"
                  value={newProduct.quantity}
                  onChange={handleInputChange}
                  className="form-input"
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Price per kg (₹):</label>
                <input
                  type="number"
                  step="0.01"
                  name="pricePerKg"
                  value={newProduct.pricePerKg}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Quality Grade:</label>
                <select
                  name="qualityGrade"
                  value={newProduct.qualityGrade}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="organic">Organic</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Harvest Date:</label>
                <input
                  type="date"
                  name="harvestDate"
                  value={newProduct.harvestDate}
                  onChange={handleInputChange}
                  className="form-input"
                  min={getTomorrowDate()}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Location:</label>
                <input
                  type="text"
                  name="location"
                  value={newProduct.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Kerala, India"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Description (Optional):</label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Describe your bananas..."
                rows="3"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </form>
        </div>
      )}

      {/* Product Lists */}
      <ProductList 
        products={products} 
        userType={user.userType}
        title={user.userType === 'farmer' ? "🌟 All Available Products" : "🍌 Available Bananas"}
      />

      {user.userType === 'farmer' && myProducts.length > 0 && (
        <ProductList 
          products={myProducts} 
          userType={user.userType}
          title="📦 My Products"
          isMyProducts={true}
        />
      )}
    </div>
  );
};

export default Dashboard;
