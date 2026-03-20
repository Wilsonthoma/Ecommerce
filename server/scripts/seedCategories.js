// server/scripts/seedCategories.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';

dotenv.config();

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const categories = await Category.seedCategories();
    await Category.updateProductCounts();
    
    console.log(`\n✅ Seeded ${categories.length} categories:\n`);
    categories.forEach(cat => {
      console.log(`  📱 ${cat.name}`);
      console.log(`     Products: ${cat.productCount}`);
      console.log(`     Subcategories: ${cat.subcategories.map(s => s.name).join(', ')}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();