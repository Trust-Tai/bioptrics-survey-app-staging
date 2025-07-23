import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Products, Product } from './products';

Meteor.methods({
  /**
   * Insert a new product
   */
  async 'products.insert'(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>) {
    // Validate input data
    check(productData, {
      name: String,
      description: String,
      price: Number,
      priceUnit: String,
      rating: Number,
      reviews: Number,
      image: String,
      imageUrl: Match.Optional(String),
      bgColor: String,
      tags: [String],
      category: String
    });

    // Check if user is authorized
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to create products');
    }

    // Check for duplicate product names
    const existingProduct = await Products.findOneAsync({ 
      name: { $regex: `^${productData.name.trim()}$`, $options: 'i' } 
    });
    
    if (existingProduct) {
      throw new Meteor.Error('duplicate-name', 'A product with this name already exists');
    }

    const now = new Date();
    
    return await Products.insertAsync({
      ...productData,
      name: productData.name.trim(),
      description: productData.description.trim(),
      imageUrl: productData.imageUrl || '',
      createdAt: now,
      updatedAt: now,
      createdBy: this.userId
    });
  },

  /**
   * Update an existing product
   */
  async 'products.update'(productId: string, productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>) {
    check(productId, String);
    check(productData, {
      name: String,
      description: String,
      price: Number,
      priceUnit: String,
      rating: Number,
      reviews: Number,
      image: String,
      imageUrl: Match.Optional(String),
      bgColor: String,
      tags: [String],
      category: String
    });

    // Check if user is authorized
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update products');
    }

    // Check if product exists
    const product = await Products.findOneAsync({ _id: productId });
    if (!product) {
      throw new Meteor.Error('not-found', 'Product not found');
    }

    // Check for duplicate product names (excluding current product)
    if (productData.name.trim() !== product.name) {
      const existingProduct = await Products.findOneAsync({ 
        name: { $regex: `^${productData.name.trim()}$`, $options: 'i' },
        _id: { $ne: productId }
      });
      
      if (existingProduct) {
        throw new Meteor.Error('duplicate-name', 'A product with this name already exists');
      }
    }

    return await Products.updateAsync(productId, {
      $set: {
        ...productData,
        name: productData.name.trim(),
        description: productData.description.trim(),
        imageUrl: productData.imageUrl || '',
        updatedAt: new Date()
      }
    });
  },

  /**
   * Remove a product
   */
  async 'products.remove'(productId: string) {
    check(productId, String);

    // Check if user is authorized
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to delete products');
    }

    // Check if product exists
    const product = await Products.findOneAsync({ _id: productId });
    if (!product) {
      throw new Meteor.Error('not-found', 'Product not found');
    }

    return await Products.removeAsync({ _id: productId });
  },

  /**
   * Get all products with optional filtering
   */
  async 'products.list'(filters?: { category?: string; searchTerm?: string }) {
    const query: any = {};
    
    if (filters?.category && filters.category !== 'All') {
      query.category = filters.category;
    }
    
    if (filters?.searchTerm) {
      const searchRegex = { $regex: filters.searchTerm, $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    return await Products.find(query, { sort: { updatedAt: -1 } }).fetchAsync();
  }
});