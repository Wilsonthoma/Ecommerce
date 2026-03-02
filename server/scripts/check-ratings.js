// server/scripts/check-ratings.js
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const MONGODB_URI = 'mongodb://localhost:27017/kwetushop';

const checkRatings = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 CHECKING PRODUCT RATINGS');
  console.log('='.repeat(60));
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check specific products
    const specificProducts = [
      { name: 'Machine', id: '69977672fd31e6b630f101f0' },
      { name: 'woufer', id: '69962653d0cf43f04184247b' },
      { name: 'Earpods', id: '699623d2d0cf43f041842401' },
      { name: 'Headphone', id: '6997776efd31e6b630f10225' },
      { name: 'Power Bank', id: '699770fd8e9119d28de225fc' },
      { name: 'Digital Watch', id: '69976fb48e9119d28de225a5' },
      { name: 'television', id: '699625a5d0cf43f041842457' }
    ];

    console.log('📊 PRODUCT RATINGS:');
    console.log('-'.repeat(60));
    
    for (const sp of specificProducts) {
      const product = await Product.findById(sp.id).select('name rating reviewsCount');
      if (product) {
        const stars = '⭐'.repeat(Math.round(product.rating) || 0);
        console.log(`   ${product.name.padEnd(15)}: ${product.rating}⭐ ${stars.padEnd(10)} (${product.reviewsCount} reviews)`);
      }
    }

    // Show all products with non-zero ratings
    console.log('\n📊 ALL PRODUCTS WITH REVIEWS:');
    console.log('-'.repeat(60));
    
    const productsWithReviews = await Product.find({ 
      reviewsCount: { $gt: 0 } 
    }).sort({ rating: -1 });
    
    if (productsWithReviews.length > 0) {
      productsWithReviews.forEach(p => {
        const stars = '⭐'.repeat(Math.round(p.rating) || 0);
        console.log(`   ${p.name.padEnd(15)}: ${p.rating}⭐ ${stars.padEnd(10)} (${p.reviewsCount} reviews)`);
      });
    } else {
      console.log('   No products with reviews found');
    }

    console.log('\n' + '='.repeat(60));
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkRatings();
