import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
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
  FaImage
} from 'react-icons/fa';

// Styled Components with theme integration
const Container = styled.div`
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.backgroundColor || 'var(--color-background)'};
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
`;

const SearchAndFilters = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const SearchBar = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
    font-size: 16px;
  }

  input {
    width: 100%;
    padding: 12px 16px 12px 48px;
    border: 1.5px solid ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s;
    background-color: ${({ theme }) => theme.backgroundColor || 'var(--color-background)'};
    color: ${({ theme }) => theme.textColor || 'var(--color-text)'};

    &:focus {
      border-color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
    }

    &::placeholder {
      color: ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
    }
  }
`;

const FilterButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${props => props.active 
    ? (props.theme?.primaryColor || 'var(--color-primary)') 
    : (props.theme?.backgroundColor || 'var(--color-background)')};
  color: ${props => props.active 
    ? '#fff' 
    : (props.theme?.textColor || 'var(--color-text)')};
  border: 1.5px solid ${props => props.active 
    ? (props.theme?.primaryColor || 'var(--color-primary)') 
    : (props.theme?.accentColor || 'var(--color-accent)')};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active 
      ? (props.theme?.secondaryColor || 'var(--color-secondary)') 
      : (props.theme?.accentColor || 'var(--color-accent)')};
    border-color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
    color: ${props => props.active ? '#fff' : '#fff'};
  }

  svg {
    font-size: 14px;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
`;

const ProductCard = styled.div`
  background: ${({ theme }) => theme.backgroundColor || 'var(--color-background)'};
  border-radius: 12px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  position: relative;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
    border-color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  }
`;

const ProductImage = styled.div<{ bgColor?: string; hasImage?: boolean }>`
  height: 120px;
  background: ${props => props.bgColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${props => props.hasImage ? '0' : '36px'};
  font-weight: 700;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${({ theme }) => theme.primaryColor || 'var(--color-primary)'}, ${({ theme }) => theme.secondaryColor || 'var(--color-secondary)'});
  }
`;

const ProductContent = styled.div`
  padding: 16px;
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
`;

const ProductTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
  line-height: 1.3;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ProductPrice = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const Price = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
`;

const PriceUnit = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  margin-left: 2px;
`;

// Add rating container for cards
const CardRatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 12px 0;
`;

const CardStarContainer = styled.div`
  display: flex;
  gap: 1px;

  svg {
    font-size: 14px;
    color: #ffc107;
  }
`;

const CardRatingText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  font-weight: 500;
`;

const TagContainer = styled.div`
  display: flex;
  gap: 6px;
  margin: 12px 0;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: ${({ theme }) => `${theme.primaryColor || 'var(--color-primary)'}20`};
  color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const LearnMoreButton = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.secondaryColor || 'var(--color-secondary)'};
    transform: translateY(-1px);
  }

  svg {
    font-size: 14px;
  }
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const AdminButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const AdminButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${props.theme?.primaryColor || 'var(--color-primary)'};
          color: white;
          &:hover { background: ${props.theme?.secondaryColor || 'var(--color-secondary)'}; }
        `;
      case 'danger':
        return `
          background: #e74c3c;
          color: white;
          &:hover { background: #c0392b; }
        `;
      default:
        return `
          background: ${props.theme?.backgroundColor || 'var(--color-background)'};
          color: ${props.theme?.textColor || 'var(--color-text)'};
          border: 1.5px solid ${props.theme?.accentColor || 'var(--color-accent)'};
          &:hover { 
            background: ${props.theme?.accentColor || 'var(--color-accent)'}; 
            border-color: ${props.theme?.primaryColor || 'var(--color-primary)'}; 
            color: white;
          }
        `;
    }
  }}
`;

const AdminProductActions = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
`;

const AdminActionButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 11;
  
  ${props => props.variant === 'delete' ? `
    background: #e74c3c;
    color: white;
    &:hover { background: #c0392b; transform: scale(1.1); }
  ` : `
    background: ${props.theme?.primaryColor || 'var(--color-primary)'};
    color: white;
    &:hover { background: ${props.theme?.secondaryColor || 'var(--color-secondary)'}; transform: scale(1.1); }
  `}
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.backgroundColor || 'var(--color-background)'};
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
    color: white;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.backgroundColor || 'var(--color-background)'};
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};

  &:focus {
    border-color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  }

  &::placeholder {
    color: ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
  background-color: ${({ theme }) => theme.backgroundColor || 'var(--color-background)'};
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};

  &:focus {
    border-color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  }

  &::placeholder {
    color: ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: ${({ theme }) => theme.backgroundColor || 'var(--color-background)'};
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};

  &:focus {
    border-color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  }
`;

const TagInput = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const TagInputField = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1.5px solid ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background-color: ${({ theme }) => theme.backgroundColor || 'var(--color-background)'};
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};

  &:focus {
    border-color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  }
`;

const AddTagButton = styled.button`
  padding: 8px 16px;
  background: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.secondaryColor || 'var(--color-secondary)'};
  }
`;

const TagsList = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const EditableTag = styled.div`
  background: ${({ theme }) => `${theme.primaryColor || 'var(--color-primary)'}20`};
  color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  
  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
    cursor: pointer;
    padding: 0;
    font-size: 12px;
    
    &:hover {
      color: #e74c3c;
    }
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
`;

const ImageUploadSection = styled.div`
  border: 2px dashed ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s;
  background-color: ${({ theme }) => theme.backgroundColor || 'var(--color-background)'};
  
  &:hover {
    border-color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
    background: ${({ theme }) => `${theme.primaryColor || 'var(--color-primary)'}10`};
  }
`;

const ImagePreview = styled.div`
  width: 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto 16px;
  border: 2px solid ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ColorPalette = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-top: 12px;
`;

const ColorOption = styled.div<{ color: string; selected?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color};
  cursor: pointer;
  border: 3px solid ${props => props.selected 
    ? (props.theme?.primaryColor || 'var(--color-primary)') 
    : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    border-color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.secondaryColor || 'var(--color-secondary)'};
  }
`;

const RemoveImageButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    background: #c0392b;
  }
`;

// Enhanced ProductCard with admin actions
const EnhancedProductCard = styled(ProductCard)`
  position: relative;
  
  &:hover ${AdminProductActions} {
    opacity: 1;
  }
`;

// Predefined color palette
const colorPalette = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)',
  'linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%)',
  '#3498db',
  '#e74c3c',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#34495e',
  '#1abc9c',
  '#e67e22',
  '#95a5a6',
  '#16a085',
  '#27ae60',
  '#8e44ad'
];

const categories = ['All', 'Safety & Wellness', 'Engagement', 'Leadership', 'Culture', 'Diversity & Inclusion', 'Retention'];

// Rating component
const Rating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <StarContainer>
      {[...Array(fullStars)].map((_, i) => <FaStar key={i} />)}
      {hasHalfStar && <FaStarHalfAlt />}
      {[...Array(emptyStars)].map((_, i) => <FaRegStar key={i} />)}
    </StarContainer>
  );
};

const Marketplace: React.FC = () => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  
  // Admin modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  
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
    tags: [],
    category: 'Safety & Wellness'
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
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
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
      tags: [],
      category: 'Safety & Wellness'
    });
    setEditingProduct(null);
    setNewTagInput('');
    setImagePreview('');
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

  const addTag = () => {
    if (newTagInput.trim() && !formData.tags?.includes(newTagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTagInput.trim()]
      }));
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

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
      tags: formData.tags!,
      category: formData.category!
    };

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
    // Add purchase logic here
    alert(`Purchasing ${product.name} for $${product.price}${product.priceUnit}`);
    setShowProductDetail(false);
  };

  const handleLearnMore = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleCloseProductDetail = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
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
      <Container theme={theme}>
        <PageHeader>
          <Title theme={theme}>Survey Marketplace</Title>
          <AdminButtons>
            <AdminButton variant="primary" theme={theme} onClick={openAddModal}>
              <FaPlus />
              Add Product
            </AdminButton>
          </AdminButtons>
        </PageHeader>

        <SearchAndFilters>
          <SearchBar theme={theme}>
            <FaSearch />
            <input
              type="text"
              placeholder="Search survey products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          <FilterButton
            active={showFilters}
            theme={theme}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            Filters
          </FilterButton>
        </SearchAndFilters>

        <CategoryFilter>
          {categories.map(category => (
            <FilterButton
              key={category}
              active={selectedCategory === category}
              theme={theme}
              onClick={() => setSelectedCategory(category)}
            >
              <FaTags />
              {category}
            </FilterButton>
          ))}
        </CategoryFilter>

        <ProductGrid>
          {filteredProducts.map(product => (
            <EnhancedProductCard 
              key={product._id} 
              theme={theme}
              onMouseEnter={() => setHoveredProduct(product._id!)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <AdminProductActions>
                <AdminActionButton theme={theme} onClick={() => openEditModal(product)}>
                  <FaEdit />
                </AdminActionButton>
                <AdminActionButton 
                  variant="delete" 
                  theme={theme}
                  onClick={() => handleDelete(product._id!)}
                >
                  <FaTrash />
                </AdminActionButton>
              </AdminProductActions>
              
              <ProductImage bgColor={product.bgColor} hasImage={!!product.imageUrl} theme={theme}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  product.image
                )}
              </ProductImage>
              
              <ProductContent>
                <ProductHeader>
                  <ProductTitle theme={theme}>{product.name}</ProductTitle>
                  <ProductPrice>
                    <Price theme={theme}>${product.price}</Price>
                    <PriceUnit theme={theme}>{product.priceUnit}</PriceUnit>
                  </ProductPrice>
                </ProductHeader>

                <CardRatingContainer>
                  <CardStarContainer>
                    {[...Array(Math.floor(product.rating))].map((_, i) => <FaStar key={i} />)}
                    {product.rating % 1 !== 0 && <FaStarHalfAlt />}
                    {[...Array(5 - Math.floor(product.rating) - (product.rating % 1 !== 0 ? 1 : 0))].map((_, i) => <FaRegStar key={i} />)}
                  </CardStarContainer>
                  <CardRatingText theme={theme}>
                    {product.rating} ({product.reviews} reviews)
                  </CardRatingText>
                </CardRatingContainer>

                <TagContainer>
                  {product.tags.slice(0, 3).map(tag => (
                    <Tag key={tag} theme={theme}>{tag}</Tag>
                  ))}
                  {product.tags.length > 3 && (
                    <Tag theme={theme}>+{product.tags.length - 3}</Tag>
                  )}
                </TagContainer>

                <ActionButtons>
                  <LearnMoreButton theme={theme} onClick={() => handleLearnMore(product)}>
                    Learn More
                  </LearnMoreButton>
                </ActionButtons>
              </ProductContent>

              {/* Tooltip */}
              <Tooltip visible={hoveredProduct === product._id} theme={theme}>
                <TooltipTitle theme={theme}>{product.name}</TooltipTitle>
                <TooltipCategory theme={theme}>Category: {product.category}</TooltipCategory>
                <TooltipDescription theme={theme}>{product.description}</TooltipDescription>
                <TooltipRating>
                  <Rating rating={product.rating} />
                  <RatingText theme={theme}>
                    {product.rating} ({product.reviews} reviews)
                  </RatingText>
                </TooltipRating>
                <TooltipTags>
                  {product.tags.map(tag => (
                    <TooltipTag key={tag} theme={theme}>{tag}</TooltipTag>
                  ))}
                </TooltipTags>
              </Tooltip>
            </EnhancedProductCard>
          ))}
        </ProductGrid>

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
          <ProductDetailModal onClick={(e) => e.target === e.currentTarget && handleCloseProductDetail()}>
            <ProductDetailContent theme={theme}>
              <ProductDetailHeader>
                <div>
                  <ProductDetailTitle theme={theme}>{selectedProduct.name}</ProductDetailTitle>
                  <ProductDetailPrice theme={theme}>
                    ${selectedProduct.price}{selectedProduct.priceUnit}
                  </ProductDetailPrice>
                </div>
                <CloseButton theme={theme} onClick={handleCloseProductDetail}>
                  <FaTimes />
                </CloseButton>
              </ProductDetailHeader>

              <ProductDetailImageSection>
                <ProductDetailImage 
                  bgColor={selectedProduct.bgColor} 
                  hasImage={!!selectedProduct.imageUrl}
                  theme={theme}
                >
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
                  ) : (
                    selectedProduct.image
                  )}
                </ProductDetailImage>

                <ProductDetailInfo>
                  <ProductDetailCategory theme={theme}>
                    {selectedProduct.category}
                  </ProductDetailCategory>
                  
                  <ProductDetailRating theme={theme}>
                    <Rating rating={selectedProduct.rating} />
                    <span style={{ fontSize: '16px', fontWeight: '600' }}>
                      {selectedProduct.rating} out of 5 ({selectedProduct.reviews} reviews)
                    </span>
                  </ProductDetailRating>
                </ProductDetailInfo>
              </ProductDetailImageSection>

              <ProductDetailDescription theme={theme}>
                {selectedProduct.description}
              </ProductDetailDescription>

              <ProductDetailTags>
                <ProductDetailTagsTitle theme={theme}>Tags</ProductDetailTagsTitle>
                <ProductDetailTagsList>
                  {selectedProduct.tags.map(tag => (
                    <ProductDetailTag key={tag} theme={theme}>{tag}</ProductDetailTag>
                  ))}
                </ProductDetailTagsList>
              </ProductDetailTags>

              <ProductDetailActions>
                <CancelButton theme={theme} onClick={handleCloseProductDetail}>
                  Cancel
                </CancelButton>
                <PurchaseButton theme={theme} onClick={() => handlePurchase(selectedProduct)}>
                  Purchase
                </PurchaseButton>
              </ProductDetailActions>
            </ProductDetailContent>
          </ProductDetailModal>
        )}

        {/* Enhanced Add/Edit Product Modal */}
        {showModal && (
          <Modal onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <ModalContent theme={theme}>
              <ModalHeader>
                <ModalTitle theme={theme}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </ModalTitle>
                <CloseButton theme={theme} onClick={closeModal}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>

              <FormGroup>
                <Label theme={theme}>Product Name *</Label>
                <Input
                  theme={theme}
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Whole Person Safety Assessment"
                />
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Description *</Label>
                <TextArea
                  theme={theme}
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the product features and benefits..."
                />
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Category</Label>
                <Select
                  theme={theme}
                  value={formData.category || 'Safety & Wellness'}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.filter(cat => cat !== 'All').map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <FormGroup>
                  <Label theme={theme}>Price</Label>
                  <Input
                    theme={theme}
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    placeholder="2499"
                  />
                </FormGroup>

                <FormGroup>
                  <Label theme={theme}>Price Unit</Label>
                  <Select
                    theme={theme}
                    value={formData.priceUnit || '/month'}
                    onChange={(e) => handleInputChange('priceUnit', e.target.value)}
                  >
                    <option value="/month">Per Month</option>
                    <option value="/year">Per Year</option>
                    <option value="/quarter">Per Quarter</option>
                    <option value="">One-time</option>
                  </Select>
                </FormGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <FormGroup>
                  <Label theme={theme}>Rating</Label>
                  <Input
                    theme={theme}
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating || ''}
                    onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                    placeholder="4.5"
                  />
                </FormGroup>

                <FormGroup>
                  <Label theme={theme}>Number of Reviews</Label>
                  <Input
                    theme={theme}
                    type="number"
                    value={formData.reviews || ''}
                    onChange={(e) => handleInputChange('reviews', parseInt(e.target.value) || 0)}
                    placeholder="142"
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <Label theme={theme}>Product Image</Label>
                <ImageUploadSection theme={theme}>
                  {imagePreview ? (
                    <div>
                      <ImagePreview theme={theme}>
                        <img src={imagePreview} alt="Preview" />
                      </ImagePreview>
                      <div>
                        <UploadButton theme={theme} htmlFor="image-upload">
                          <FaUpload />
                          Change Image
                        </UploadButton>
                        <RemoveImageButton onClick={removeImage}>
                          Remove Image
                        </RemoveImageButton>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <FaImage size={24} color={theme.accentColor || 'var(--color-accent)'} style={{ marginBottom: 8 }} />
                      <p style={{ margin: 0, color: theme.accentColor || 'var(--color-accent)', fontSize: 14 }}>
                        Upload an image or use initials with background color
                      </p>
                      <UploadButton theme={theme} htmlFor="image-upload" style={{ marginTop: 12 }}>
                        <FaUpload />
                        Upload Image
                      </UploadButton>
                    </div>
                  )}
                  <FileInput
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </ImageUploadSection>
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Image Text (Initials)</Label>
                <Input
                  theme={theme}
                  value={formData.image || ''}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="WPS (displayed when no image is uploaded)"
                />
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Background Color</Label>
                <Input
                  theme={theme}
                  value={formData.bgColor || ''}
                  onChange={(e) => handleInputChange('bgColor', e.target.value)}
                  placeholder="Custom CSS background (gradient or solid color)"
                />
                <ColorPalette>
                  {colorPalette.map((color, index) => (
                    <ColorOption
                      key={index}
                      color={color}
                      selected={formData.bgColor === color}
                      theme={theme}
                      onClick={() => selectColor(color)}
                      title={color}
                    />
                  ))}
                </ColorPalette>
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Tags</Label>
                <TagInput>
                  <TagInputField
                    theme={theme}
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <AddTagButton theme={theme} type="button" onClick={addTag}>
                    Add
                  </AddTagButton>
                </TagInput>
                <TagsList>
                  {formData.tags?.map(tag => (
                    <EditableTag key={tag} theme={theme}>
                      {tag}
                      <button onClick={() => removeTag(tag)}>×</button>
                    </EditableTag>
                  ))}
                </TagsList>
              </FormGroup>

              <ModalActions>
                <AdminButton theme={theme} onClick={closeModal}>
                  Cancel
                </AdminButton>
                <AdminButton variant="primary" theme={theme} onClick={handleSave}>
                  <FaSave />
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </AdminButton>
              </ModalActions>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </AdminLayout>
  );
};

export default Marketplace;

// Additional styled components for tooltip functionality
const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
`;

const StarContainer = styled.div`
  display: flex;
  gap: 2px;

  svg {
    font-size: 16px;
    color: #ffc107;
  }
`;

const RatingText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
`;

// Tooltip styled components
const Tooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.backgroundColor || 'var(--color-background)'};
  border: 2px solid ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 300px;
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
  margin-top: 8px;

  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  }
`;

const TooltipTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
`;

const TooltipDescription = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.4;
  color: ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
`;

const TooltipRating = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const TooltipCategory = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  font-weight: 500;
  margin-bottom: 8px;
`;

const TooltipTags = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const TooltipTag = styled.span`
  background: ${({ theme }) => `${theme.primaryColor || 'var(--color-primary)'}15`};
  color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
`;

// Product Detail Modal components
const ProductDetailModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ProductDetailContent = styled.div`
  background: ${({ theme }) => theme.backgroundColor || 'var(--color-background)'};
  border-radius: 16px;
  padding: 32px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
`;

const ProductDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
`;

const ProductDetailImageSection = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  align-items: flex-start;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const ProductDetailImage = styled.div<{ bgColor?: string; hasImage?: boolean }>`
  width: 200px;
  height: 150px;
  background: ${props => props.bgColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${props => props.hasImage ? '0' : '48px'};
  font-weight: 700;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }

  @media (max-width: 600px) {
    width: 100%;
    height: 200px;
  }
`;

const ProductDetailInfo = styled.div`
  flex: 1;
`;

const ProductDetailTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
`;

const ProductDetailPrice = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  margin-bottom: 16px;
`;

const ProductDetailCategory = styled.div`
  display: inline-block;
  background: ${({ theme }) => `${theme.primaryColor || 'var(--color-primary)'}20`};
  color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
`;

const ProductDetailDescription = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
  margin-bottom: 24px;
`;

const ProductDetailRating = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: ${({ theme }) => `${theme.primaryColor || 'var(--color-primary)'}10`};
  border-radius: 12px;
`;

const ProductDetailTags = styled.div`
  margin-bottom: 32px;
`;

const ProductDetailTagsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
`;

const ProductDetailTagsList = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ProductDetailTag = styled.span`
  background: ${({ theme }) => `${theme.primaryColor || 'var(--color-primary)'}15`};
  color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
`;

const ProductDetailActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.accentColor || 'var(--color-accent)'};

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const PurchaseButton = styled.button`
  background: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  min-width: 120px;

  &:hover {
    background: ${({ theme }) => theme.secondaryColor || 'var(--color-secondary)'};
    transform: translateY(-1px);
  }
`;

const CancelButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.textColor || 'var(--color-text)'};
  border: 2px solid ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  min-width: 120px;

  &:hover {
    background: ${({ theme }) => theme.accentColor || 'var(--color-accent)'};
    color: white;
  }
`;