import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup, 
  Modal, 
  Badge,
  Alert,
  Spinner
} from 'react-bootstrap';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { Products, Product } from '/imports/api/products/products';
import { useTheme } from '/imports/contexts/ThemeContext';
import { 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar, 
  FaShoppingCart, 
  FaSearch, 
  FaFilter,
  FaTags,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaUpload,
  FaImage,
  FaCheck
} from 'react-icons/fa';

// Color palette constant
const colorPalette = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #ff8a80 0%, #ffb74d 100%)',
  'linear-gradient(135deg, #81c784 0%, #aed581 100%)',
  'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)'
];

// Rating component using Bootstrap styling
const Rating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="d-flex align-items-center gap-1">
      {[...Array(Math.floor(rating))].map((_, i) => 
        <FaStar key={i} className="text-warning" style={{ fontSize: '14px' }} />
      )}
      {rating % 1 !== 0 && <FaStarHalfAlt className="text-warning" style={{ fontSize: '14px' }} />}
      {[...Array(5 - Math.floor(rating) - (rating % 1 !== 0 ? 1 : 0))].map((_, i) => 
        <FaRegStar key={i} className="text-warning" style={{ fontSize: '14px' }} />
      )}
    </div>
  );
};

const Marketplace: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  
  // Admin modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newScreenshotInput, setNewScreenshotInput] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    priceUnit: '/month',
    rating: 4.5,
    reviews: 0,
    image: '',
    imageUrl: '',
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    whatsIncluded: [],
    screenshots: []
  });

  // Subscribe to products data using useTracker
  const { products, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('products.all');
    return {
      products: Products.find({}, { sort: { updatedAt: -1 } }).fetch(),
      isLoading: !handle.ready()
    };
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      priceUnit: '/month',
      rating: 4.5,
      reviews: 0,
      image: '',
      imageUrl: '',
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      whatsIncluded: [],
      screenshots: []
    });
    setEditingProduct(null);
    setImagePreview('');
    setNewFeatureInput('');
    setNewScreenshotInput('');
    setShowColorPalette(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({ ...product });
    setEditingProduct(product);
    setImagePreview(product.imageUrl || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    if (newFeatureInput.trim() && !formData.whatsIncluded?.includes(newFeatureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        whatsIncluded: [...(prev.whatsIncluded || []), newFeatureInput.trim()]
      }));
      setNewFeatureInput('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      whatsIncluded: prev.whatsIncluded?.filter(feature => feature !== featureToRemove) || []
    }));
  };

  const addScreenshot = () => {
    if (newScreenshotInput.trim() && !formData.screenshots?.includes(newScreenshotInput.trim())) {
      setFormData(prev => ({
        ...prev,
        screenshots: [...(prev.screenshots || []), newScreenshotInput.trim()]
      }));
      setNewScreenshotInput('');
    }
  };

  const removeScreenshot = (screenshotToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots?.filter(screenshot => screenshot !== screenshotToRemove) || []
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Form data before sending:', JSON.stringify(formData, null, 2));

    const productData = {
      name: formData.name!,
      description: formData.description!,
      price: formData.price!,
      priceUnit: formData.priceUnit!,
      rating: formData.rating!,
      reviews: formData.reviews!,
      image: formData.image!,
      imageUrl: formData.imageUrl || '',
      bgColor: formData.bgColor!,
      tags: formData.tags || [],
      category: formData.category || 'General',
      whatsIncluded: formData.whatsIncluded || [],
      screenshots: formData.screenshots || []
    };

    console.log('Product data being sent:', JSON.stringify(productData, null, 2));

    if (editingProduct && editingProduct._id) {
      // Update existing product
      Meteor.call('products.update', editingProduct._id, productData, (error: Meteor.Error | null) => {
        if (error) {
          console.error('Error updating product:', error);
          alert('Error updating product: ' + error.message);
        } else {
          closeModal();
        }
      });
    } else {
      // Add new product
      Meteor.call('products.insert', productData, (error: Meteor.Error | null, result: string) => {
        if (error) {
          console.error('Error creating product:', error);
          alert('Error creating product: ' + error.message);
        } else {
          closeModal();
        }
      });
    }
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      Meteor.call('products.remove', productId, (error: Meteor.Error | null) => {
        if (error) {
          console.error('Error deleting product:', error);
          alert('Error deleting product: ' + error.message);
        }
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        handleInputChange('imageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    handleInputChange('imageUrl', '');
  };

  const selectColor = (color: string) => {
    handleInputChange('bgColor', color);
  };

  const handlePurchase = (product: Product) => {
    console.log('Purchasing:', product.name);
    
    // Store the selected product in localStorage for the AccountDetails page
    const selectedPlan = {
      id: product._id,
      name: product.name,
      price: `$${product.price}`,
      billing: product.priceUnit,
      description: product.description,
      rating: product.rating,
      reviews: product.reviews,
      whatsIncluded: product.whatsIncluded || []
    };
    
    localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
    
    // Close the product detail modal
    setShowProductDetail(false);
    setSelectedProduct(null);
    
    // Navigate to the AccountDetails page
    navigate('/admin/account-details');
  };

  const handleLearnMore = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleCloseProductDetail = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (limit to 10MB for screenshots)
      if (file.size > 10 * 1024 * 1024) {
        alert('Screenshot size should be less than 10MB');
        return;
      }
      
      setUploadingScreenshot(true);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        
        // Add the screenshot to the list
        if (!formData.screenshots?.includes(result)) {
          setFormData(prev => ({
            ...prev,
            screenshots: [...(prev.screenshots || []), result]
          }));
        }
        
        setUploadingScreenshot(false);
        
        // Reset the file input
        e.target.value = '';
      };
      
      reader.onerror = () => {
        alert('Error reading file');
        setUploadingScreenshot(false);
      };
      
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Container>
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <h3>Loading products...</h3>
          </div>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Row className="mb-4">
          <Col>
            <h1 className="fw-bold" style={{ color: theme.textColor || 'var(--color-text)' }}>
              Marketplace
            </h1>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={openAddModal}>
              <FaPlus /> Add Product
            </Button>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <InputGroup>
              <Form.Control
                placeholder="Search survey products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: '8px 0 0 8px' }}
              />
              <Button variant="outline-secondary">
                <FaSearch />
              </Button>
              <Button 
                variant={showFilters ? 'primary' : 'outline-primary'} 
                onClick={() => setShowFilters(!showFilters)}
                className="d-flex align-items-center gap-2"
                style={{ borderRadius: '0 8px 8px 0', marginLeft: '8px' }}
              >
                <FaFilter />
                Filters
              </Button>
            </InputGroup>
          </Col>
        </Row>

        <Row>
          {filteredProducts.map(product => (
            <Col key={product._id} xs={12} sm={6} md={4} lg={3} xl={3} className="mb-4">
              <Card 
                onMouseEnter={() => setHoveredProduct(product._id!)}
                onMouseLeave={() => setHoveredProduct(null)}
                style={{ 
                  position: 'relative', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  height: '100%' // Ensure cards have consistent height
                }}
              >
                {/* Edit and Delete buttons overlay */}
                <div 
                  className="position-absolute top-0 end-0 p-2" 
                  style={{ 
                    zIndex: 10,
                    opacity: hoveredProduct === product._id ? 1 : 0,
                    visibility: hoveredProduct === product._id ? 'visible' : 'hidden',
                    transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out'
                  }}
                >
                  <div className="d-flex gap-1">
                    <Button 
                      variant="outline-light"
                      size="sm"
                      onClick={() => openEditModal(product)}
                      style={{ 
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        color: '#007bff'
                      }}
                    >
                      <FaEdit size={12} />
                    </Button>
                    <Button 
                      variant="outline-light"
                      size="sm"
                      onClick={() => handleDelete(product._id!)}
                      style={{ 
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        color: '#dc3545'
                      }}
                    >
                      <FaTrash size={12} />
                    </Button>
                  </div>
                </div>

                <div style={{ 
                  height: '150px', 
                  background: product.bgColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {product.imageUrl ? (
                    <Card.Img src={product.imageUrl} alt={product.name} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#fff'
                    }}>
                      {product.image}
                    </div>
                  )}
                </div>
                
                <Card.Body>
                  <Card.Title style={{ 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    color: theme.textColor || 'var(--color-text)',
                    marginBottom: '8px'
                  }}>
                    {product.name}
                  </Card.Title>
                  <Card.Text style={{ 
                    color: theme.accentColor || 'var(--color-accent)',
                    marginBottom: '8px'
                  }}>
                    ${product.price} {product.priceUnit}
                  </Card.Text>

                  <div className="d-flex align-items-center gap-2" style={{ marginBottom: '8px' }}>
                    <div className="d-flex align-items-center gap-1">
                      {[...Array(Math.floor(product.rating))].map((_, i) => 
                        <FaStar key={i} className="text-warning" style={{ fontSize: '14px' }} />
                      )}
                      {product.rating % 1 !== 0 && <FaStarHalfAlt className="text-warning" style={{ fontSize: '14px' }} />}
                      {[...Array(5 - Math.floor(product.rating) - (product.rating % 1 !== 0 ? 1 : 0))].map((_, i) => 
                        <FaRegStar key={i} className="text-warning" style={{ fontSize: '14px' }} />
                      )}
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      color: theme.accentColor || 'var(--color-accent)',
                      fontWeight: 500
                    }}>
                      ({product.reviews} reviews)
                    </span>
                  </div>

                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      onClick={() => handleLearnMore(product)} 
                      className="flex-grow-1"
                    >
                      Learn More
                    </Button>
                  </div>
                </Card.Body>

                {/* Tooltip */}
                <div 
                  className={`position-absolute top-100 start-50 translate-middle-x bg-light border rounded-3 p-3 shadow ${hoveredProduct === product._id ? 'd-block' : 'd-none'}`}
                  style={{ zIndex: 1000, width: '300px' }}
                >
                  <h6 className="text-dark" style={{ margin: 0 }}>
                    {product.name}
                  </h6>
                  <div className="text-muted" style={{ fontSize: '12px', marginBottom: '8px' }}>
                    {product.description}
                  </div>
                  <div className="d-flex align-items-center gap-1" style={{ marginBottom: '8px' }}>
                    <div className="d-flex align-items-center gap-1">
                      {[...Array(Math.floor(product.rating))].map((_, i) => <FaStar key={i} className="text-warning" style={{ fontSize: '14px' }} />)}
                      {product.rating % 1 !== 0 && <FaStarHalfAlt className="text-warning" style={{ fontSize: '14px' }} />}
                      {[...Array(5 - Math.floor(product.rating) - (product.rating % 1 !== 0 ? 1 : 0))].map((_, i) => <FaRegStar key={i} className="text-warning" style={{ fontSize: '14px' }} />)}
                    </div>
                    <span className="text-muted" style={{ fontSize: '12px' }}>
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                  {(product as Product).whatsIncluded && (product as Product).whatsIncluded!.length > 0 && (
                    <div>
                      <strong className="text-dark" style={{ fontSize: '12px' }}>What's Included:</strong>
                      <ul className="list-unstyled" style={{ margin: 0, paddingLeft: '1.2em', fontSize: '12px' }}>
                        {(product as Product).whatsIncluded!.slice(0, 5).map((feature, index) => (
                          <li key={index} className="text-muted">
                            • {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {filteredProducts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: theme.accentColor || 'var(--color-accent)'
          }}>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Product Detail Modal */}
        {showProductDetail && selectedProduct && (
          <Modal show={showProductDetail} onHide={handleCloseProductDetail} centered>
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedProduct.name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="text-center mb-3">
                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  background: selectedProduct.bgColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ 
                      objectFit: 'cover', 
                      width: '100%', 
                      height: '100%',
                      borderRadius: '12px'
                    }} />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '36px',
                      fontWeight: 700,
                      color: '#fff'
                    }}>
                      {selectedProduct.image}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <strong>Description:</strong>
                <p className="text-muted" style={{ marginBottom: '0' }}>
                  {selectedProduct.description}
                </p>
              </div>

              <div className="mb-3">
                <strong>Price:</strong>
                <p className="text-muted" style={{ marginBottom: '0' }}>
                  ${selectedProduct.price} {selectedProduct.priceUnit}
                </p>
              </div>

              <div className="mb-3">
                <strong>Rating:</strong>
                <div className="d-flex align-items-center gap-1">
                  <div className="d-flex align-items-center gap-1">
                    {[...Array(Math.floor(selectedProduct.rating))].map((_, i) => <FaStar key={i} className="text-warning" style={{ fontSize: '16px' }} />)}
                    {selectedProduct.rating % 1 !== 0 && <FaStarHalfAlt className="text-warning" style={{ fontSize: '16px' }} />}
                    {[...Array(5 - Math.floor(selectedProduct.rating) - (selectedProduct.rating % 1 !== 0 ? 1 : 0))].map((_, i) => <FaRegStar key={i} className="text-warning" style={{ fontSize: '16px' }} />)}
                  </div>
                  <span className="text-muted" style={{ fontSize: '14px' }}>
                    {selectedProduct.rating} out of 5 ({selectedProduct.reviews} reviews)
                  </span>
                </div>
              </div>

              {selectedProduct.whatsIncluded && selectedProduct.whatsIncluded.length > 0 && (
                <div className="mb-3">
                  <strong>What's Included:</strong>
                  <ul className="list-unstyled" style={{ margin: 0, paddingLeft: '1.2em', fontSize: '14px' }}>
                    {selectedProduct.whatsIncluded.map((feature, index) => (
                      <li key={index} className="text-muted">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProduct.screenshots && selectedProduct.screenshots.length > 0 && (
                <div className="mb-3">
                  <strong>Screenshots:</strong>
                  <div className="d-flex flex-wrap gap-2" style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    padding: '8px',
                    borderRadius: '8px',
                    background: theme.backgroundColor || 'var(--color-background)',
                    border: `1px solid ${theme.accentColor || 'var(--color-accent)'}`
                  }}>
                    {selectedProduct.screenshots.map((screenshot, index) => (
                      <div key={index} style={{ 
                        width: '100px', 
                        height: '80px', 
                        borderRadius: '4px', 
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <img src={screenshot} alt={`${selectedProduct.name} screenshot ${index + 1}`} style={{ 
                          objectFit: 'cover', 
                          width: '100%', 
                          height: '100%',
                          borderRadius: '4px'
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseProductDetail}>
                Close
              </Button>
              <Button variant="primary" onClick={() => handlePurchase(selectedProduct)}>
                Purchase
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {/* Enhanced Add/Edit Product Modal */}
        {showModal && (
          <Modal show={showModal} onHide={closeModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Whole Person Safety Assessment"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the product features and benefits..."
                    rows={3}
                    required
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Price</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                        placeholder="2499"
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Price Unit</Form.Label>
                      <Form.Select
                        value={formData.priceUnit || '/month'}
                        onChange={(e) => handleInputChange('priceUnit', e.target.value)}
                      >
                        <option value="/month">Per Month</option>
                        <option value="/year">Per Year</option>
                        <option value="/quarter">Per Quarter</option>
                        <option value="">One-time</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Rating</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating || ''}
                        onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                        placeholder="4.5"
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Number of Reviews</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.reviews || ''}
                        onChange={(e) => handleInputChange('reviews', parseInt(e.target.value) || 0)}
                        placeholder="142"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Product Image</Form.Label>
                  <div>
                    {imagePreview ? (
                      <div className="mb-3">
                        <img src={imagePreview} alt="Preview" style={{ 
                          width: '100%', 
                          height: 'auto', 
                          borderRadius: '8px',
                          border: `2px solid ${theme.accentColor || 'var(--color-accent)'}`
                        }} />
                        <div className="d-flex gap-2">
                          <Button variant="primary" onClick={() => document.getElementById('image-upload')?.click()}>
                            <FaUpload /> Change Image
                          </Button>
                          <Button variant="danger" onClick={removeImage}>
                            Remove Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FaImage size={48} color={theme.accentColor || 'var(--color-accent)'} className="mb-2" />
                        <p className="text-muted" style={{ marginBottom: '12px' }}>
                          Upload an image or use initials with background color
                        </p>
                        <Button variant="primary" onClick={() => document.getElementById('image-upload')?.click()}>
                          <FaUpload /> Upload Image
                        </Button>
                      </div>
                    )}
                    <Form.Control
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Image Text (Initials)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="WPS (displayed when no image is uploaded)"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Background Color</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.bgColor || ''}
                    onChange={(e) => handleInputChange('bgColor', e.target.value)}
                    placeholder="Custom CSS background (gradient or solid color)"
                  />
                  <div className="d-flex align-items-center gap-2" style={{ marginTop: '8px' }}>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowColorPalette(!showColorPalette)}
                      style={{ 
                        borderRadius: '8px',
                        flex: 1
                      }}
                    >
                      Choose from preset colors
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => selectColor(formData.bgColor!)}
                      style={{ 
                        borderRadius: '8px',
                        display: showColorPalette ? 'inline-flex' : 'none',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FaCheck /> Select Color
                    </Button>
                  </div>
                  {showColorPalette && (
                    <div className="d-flex flex-wrap gap-2" style={{ marginTop: '8px' }}>
                      {colorPalette.map((color: string, index: number) => (
                        <div
                          key={index}
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '8px', 
                            background: color,
                            cursor: 'pointer',
                            border: `3px solid ${formData.bgColor === color ? (theme.primaryColor || 'var(--color-primary)') : 'transparent'}`,
                            transition: 'all 0.2s'
                          }}
                          onClick={() => selectColor(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>What's Included</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      value={newFeatureInput}
                      onChange={(e) => setNewFeatureInput(e.target.value)}
                      placeholder="Add a feature..."
                      style={{ flex: 1 }}
                    />
                    <Button 
                      variant="primary" 
                      onClick={addFeature}
                      style={{ 
                        flexShrink: 0,
                        display: newFeatureInput.trim() ? 'inline-flex' : 'none',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FaPlus /> Add
                    </Button>
                  </div>
                  <div className="d-flex flex-wrap gap-2" style={{ marginTop: '8px' }}>
                    {formData.whatsIncluded?.map((feature, index) => (
                      <div key={index} className="badge bg-light text-dark border" style={{ 
                        padding: '8px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {feature}
                        <button 
                          onClick={() => removeFeature(feature)} 
                          style={{ 
                            background: 'none',
                            border: 'none',
                            color: theme.primaryColor || 'var(--color-primary)',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Screenshots</Form.Label>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex gap-2">
                      <Button 
                        variant="primary" 
                        onClick={() => document.getElementById('screenshot-upload')?.click()}
                        disabled={uploadingScreenshot}
                        style={{ 
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FaUpload />
                        {uploadingScreenshot ? 'Uploading...' : 'Upload Screenshot'}
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={addScreenshot}
                        style={{ 
                          flexShrink: 0,
                          display: newScreenshotInput.trim() ? 'inline-flex' : 'none',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FaPlus /> Add URL
                      </Button>
                    </div>
                    <Form.Control
                      id="screenshot-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      disabled={uploadingScreenshot}
                      style={{ display: 'none' }}
                    />
                    <div className="d-flex flex-wrap gap-2" style={{ 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      padding: '8px',
                      borderRadius: '8px',
                      background: theme.backgroundColor || 'var(--color-background)',
                      border: `1px solid ${theme.accentColor || 'var(--color-accent)'}`
                    }}>
                      {formData.screenshots?.map((screenshot, index) => (
                        <div key={index} style={{ 
                          width: '100px', 
                          height: '80px', 
                          borderRadius: '4px', 
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <img src={screenshot} alt={`Screenshot ${index + 1}`} style={{ 
                            objectFit: 'cover', 
                            width: '100%', 
                            height: '100%',
                            borderRadius: '4px'
                          }} />
                          <div className="position-absolute top-0 end-0 p-1">
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => removeScreenshot(screenshot)}
                              style={{ 
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                padding: 0,
                                minWidth: 0
                              }}
                            >
                              &times;
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                <FaSave /> {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Container>
    </AdminLayout>
  );
};

export default Marketplace;