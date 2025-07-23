import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  priceUnit: string;
  rating: number;
  reviews: number;
  image: string;
  imageUrl?: string;
  bgColor: string;
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export const Products = new Mongo.Collection<Product>('products');

// Define schema for validation
const ProductSchema = new SimpleSchema({
  name: { type: String },
  description: { type: String },
  price: { type: Number },
  priceUnit: { type: String },
  rating: { type: Number, min: 0, max: 5 },
  reviews: { type: Number, min: 0 },
  image: { type: String },
  imageUrl: { type: String, optional: true },
  bgColor: { type: String },
  tags: { type: Array },
  'tags.$': { type: String },
  category: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  createdBy: { type: String }
});

// Attach schema using type assertion (common pattern in Meteor apps)
(Products as any).attachSchema?.(ProductSchema);

// Server-side publications
if (Meteor.isServer) {
  // Publish all products
  Meteor.publish('products.all', function() {
    return Products.find({});
  });

  // Publish products by category
  Meteor.publish('products.byCategory', function(category: string) {
    if (!category || category === 'All') {
      return Products.find({});
    }
    return Products.find({ category });
  });

  // Publish a single product by ID
  Meteor.publish('products.single', function(productId: string) {
    return Products.find({ _id: productId });
  });
}