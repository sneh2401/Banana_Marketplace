import React, { useState } from 'react';

const ProductList = ({ products, userType, title, isMyProducts = false }) => {
  const [filters, setFilters] = useState({
    variety: '',
    qualityGrade: '',
    location: ''
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      variety: '',
      qualityGrade: '',
      location: ''
    });
  };

  const filteredProducts = products.filter(product => {
    return (
      (!filters.variety || product.variety.toLowerCase().includes(filters.variety.toLowerCase())) &&
      (!filters.qualityGrade || product.quality_grade === filters.qualityGrade) &&
      (!filters.location || product.location.toLowerCase().includes(filters.location.toLowerCase()))
    );
  });

  const handleContact = (product) => {
    const message = `Hi ${product.farmer_name}, I'm interested in your ${product.variety} bananas (${product.quantity_kg}kg at ₹${product.price_per_kg}/kg). Can we discuss further?`;
    const whatsappUrl = `https://wa.me/${product.farmer_phone?.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getQualityBadgeStyle = (grade) => {
    const colors = {
      premium: { backgroundColor: '#f39c12', color: 'white' },
      organic: { backgroundColor: '#27ae60', color: 'white' },
      standard: { backgroundColor: '#95a5a6', color: 'white' }
    };
    return { ...styles.qualityBadge, ...colors[grade] };
  };

  const getStatusBadgeStyle = (status) => {
    const colors = {
      available: { backgroundColor: '#27ae60', color: 'white' },
      sold: { backgroundColor: '#e74c3c', color: 'white' },
      expired: { backgroundColor: '#95a5a6', color: 'white' }
    };
    return { ...styles.qualityBadge, ...colors[status] };
  };

  const styles = {
    section: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      marginBottom: '30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '15px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: 0
    },
    count: {
      fontSize: '16px',
      color: '#666'
    },
    filtersContainer: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '15px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '20px'
    },
    card: {
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#fff',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    cardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '15px'
    },
    variety: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: 0
    },
    price: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#27ae60'
    },
    detail: {
      margin: '8px 0',
      color: '#555',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    detailLabel: {
      fontWeight: '600',
      minWidth: '80px'
    },
    farmer: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '15px',
      paddingTop: '15px',
      borderTop: '1px solid #e9ecef'
    },
    farmerAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#27ae60',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '10px',
      fontSize: '18px'
    },
    farmerInfo: {
      flex: 1
    },
    farmerName: {
      fontWeight: 'bold',
      margin: 0,
      fontSize: '14px'
    },
    farmerEmail: {
      fontSize: '12px',
      color: '#666',
      margin: 0
    },
    qualityBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      display: 'inline-block'
    },
    actions: {
      marginTop: '15px',
      display: 'flex',
      gap: '10px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#666'
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '20px'
    },
    emptyText: {
      fontSize: '18px',
      marginBottom: '10px'
    },
    emptySubtext: {
      fontSize: '14px',
      color: '#999'
    }
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={styles.title}>{title}</h3>
          <p style={styles.count}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            {filteredProducts.length !== products.length && ` (filtered from ${products.length})`}
          </p>
        </div>
      </div>

      {/* Filters */}
      {!isMyProducts && products.length > 0 && (
        <div style={styles.filtersContainer}>
          <h4 style={{ marginBottom: '15px', color: '#333' }}>🔍 Filter Products</h4>
          <div style={styles.filtersGrid}>
            <div className="form-group">
              <label className="form-label">Variety:</label>
              <input
                type="text"
                name="variety"
                value={filters.variety}
                onChange={handleFilterChange}
                className="form-input"
                placeholder="e.g., Cavendish"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Quality Grade:</label>
              <select
                name="qualityGrade"
                value={filters.qualityGrade}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All Grades</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="organic">Organic</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Location:</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="form-input"
                placeholder="e.g., Kerala"
              />
            </div>
          </div>
          
          <button 
            onClick={clearFilters}
            className="btn btn-secondary"
            style={{ fontSize: '14px', padding: '8px 16px' }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div style={styles.grid}>
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              style={styles.card}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.cardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.cardHeader}>
                <h4 style={styles.variety}>{product.variety}</h4>
                <div style={styles.price}>₹{product.price_per_kg}/kg</div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <span style={getQualityBadgeStyle(product.quality_grade)}>
                  {product.quality_grade}
                </span>
                {isMyProducts && (
                  <span style={{...getStatusBadgeStyle(product.status), marginLeft: '8px'}}>
                    {product.status}
                  </span>
                )}
              </div>
              
              <div style={styles.detail}>
                <span style={styles.detailLabel}>📦 Quantity:</span>
                <span>{product.quantity_kg} kg</span>
              </div>
              
              <div style={styles.detail}>
                <span style={styles.detailLabel}>📅 Harvest:</span>
                <span>{new Date(product.harvest_date).toLocaleDateString()}</span>
              </div>
              
              <div style={styles.detail}>
                <span style={styles.detailLabel}>📍 Location:</span>
                <span>{product.location}</span>
              </div>
              
              {product.description && (
                <div style={styles.detail}>
                  <span style={styles.detailLabel}>📝 Description:</span>
                  <span>{product.description}</span>
                </div>
              )}
              
              {!isMyProducts && (
                <div style={styles.farmer}>
                  <div style={styles.farmerAvatar}>🌱</div>
                  <div style={styles.farmerInfo}>
                    <p style={styles.farmerName}>{product.farmer_name}</p>
                    <p style={styles.farmerEmail}>{product.farmer_email}</p>
                  </div>
                </div>
              )}
              
              {userType === 'wholesaler' && !isMyProducts && (
                <div style={styles.actions}>
                  <button 
                    onClick={() => handleContact(product)}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    💬 Contact Farmer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            {isMyProducts ? '📦' : '🍌'}
          </div>
          <p style={styles.emptyText}>
            {isMyProducts 
              ? 'No products added yet' 
              : filteredProducts.length === 0 && products.length > 0
                ? 'No products match your filters'
                : 'No products available yet'
            }
          </p>
          <p style={styles.emptySubtext}>
            {isMyProducts 
              ? 'Add your first product using the form above!'
              : filteredProducts.length === 0 && products.length > 0
                ? 'Try adjusting your filters to see more results'
                : 'Check back later for new listings.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
