import { Meteor } from 'meteor/meteor';
import { Products, Product } from './products';

// Initial product data
const initialProducts: Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
  {
    name: 'Whole Person Safety',
    description: 'Comprehensive safety assessment covering physical, mental, and emotional well-being indicators for workplace safety.',
    price: 2499,
    priceUnit: '/month',
    rating: 4.8,
    reviews: 142,
    image: 'WPS',
    imageUrl: '',
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    tags: ['Safety', 'Wellness', 'Premium'],
    category: 'Safety & Wellness',
    whatsIncluded: ['Comprehensive safety assessment', 'Real-time analytics dashboard', 'Custom reporting tools', 'Expert consultation included'],
    screenshots: ['https://via.placeholder.com/800x600/667eea/white?text=WPS+Dashboard', 'https://via.placeholder.com/800x600/764ba2/white?text=Safety+Analytics', 'https://via.placeholder.com/800x600/667eea/white?text=Reporting+Tools']
  },
  {
    name: 'Employee Engagement Plus',
    description: 'Advanced employee engagement survey with AI-powered insights and real-time analytics dashboard.',
    price: 1899,
    priceUnit: '/month',
    rating: 4.6,
    reviews: 89,
    image: 'EEP',
    imageUrl: '',
    bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    tags: ['Engagement', 'Analytics', 'AI'],
    category: 'Engagement',
    whatsIncluded: ['AI-powered insights', 'Real-time analytics', 'Custom surveys', 'Team benchmarking'],
    screenshots: ['https://via.placeholder.com/800x600/f093fb/white?text=Engagement+Dashboard', 'https://via.placeholder.com/800x600/f5576c/white?text=AI+Insights', 'https://via.placeholder.com/800x600/f093fb/white?text=Survey+Builder']
  },
  {
    name: 'Leadership 360 Assessment',
    description: 'Multi-perspective leadership evaluation tool with comprehensive feedback reports and development plans.',
    price: 3299,
    priceUnit: '/month',
    rating: 4.9,
    reviews: 67,
    image: 'L360',
    imageUrl: '',
    bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    tags: ['Leadership', '360 Feedback', 'Development'],
    category: 'Leadership',
    whatsIncluded: ['360-degree feedback', 'Personalized development plan', 'Coaching session', 'Progress tracking'],
    screenshots: ['https://via.placeholder.com/800x600/4facfe/white?text=360+Assessment', 'https://via.placeholder.com/800x600/00f2fe/white?text=Feedback+Reports', 'https://via.placeholder.com/800x600/4facfe/white?text=Development+Plans']
  },
  {
    name: 'Culture & Climate Survey',
    description: 'Organizational culture assessment with climate analysis and actionable improvement recommendations.',
    price: 1599,
    priceUnit: '/month',
    rating: 4.4,
    reviews: 156,
    image: 'CCS',
    imageUrl: '',
    bgColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    tags: ['Culture', 'Climate', 'Assessment'],
    category: 'Culture'
  },
  {
    name: 'Diversity & Inclusion Tracker',
    description: 'Track and measure D&I initiatives with bias detection, inclusion metrics, and progress monitoring.',
    price: 2199,
    priceUnit: '/month',
    rating: 4.7,
    reviews: 91,
    image: 'DIT',
    imageUrl: '',
    bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    tags: ['Diversity', 'Inclusion', 'Tracking'],
    category: 'Diversity & Inclusion'
  },
  {
    name: 'Exit Interview Intelligence',
    description: 'Smart exit interview system with predictive analytics to identify retention risks and improvement areas.',
    price: 999,
    priceUnit: '/month',
    rating: 4.3,
    reviews: 78,
    image: 'EII',
    imageUrl: '',
    bgColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    tags: ['Exit Interviews', 'Predictive', 'Retention'],
    category: 'Retention'
  }
];

export async function seedProducts() {
  console.log('Checking for existing products...');
  
  // Check if products already exist
  const existingCount = await Products.find().countAsync();
  
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing products, skipping seed.`);
    return;
  }
  
  console.log('Seeding initial products...');
  
  const now = new Date();
  let insertedCount = 0;
  
  for (const productData of initialProducts) {
    try {
      await Products.insertAsync({
        ...productData,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      });
      insertedCount++;
    } catch (error) {
      console.error(`Error inserting product "${productData.name}":`, error);
    }
  }
  
  console.log(`Successfully inserted ${insertedCount} products`);
}