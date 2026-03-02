// server/scripts/updateRatings-direct.js
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';

// DIRECT MongoDB URI - Use your actual MongoDB URI
const MONGODB_URI = 'mongodb://localhost:27017/kwetushop';

console.log('\n' + '='.repeat(70));
console.log('📊 PRODUCT RATING UPDATE SCRIPT');
console.log('='.repeat(70));
console.log(`\n📌 Using MongoDB URI: ${MONGODB_URI}`);

const updateAllRatings = async () => {
  try {
    console.log('\n📦 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Get all products
    const products = await Product.find({}).sort({ name: 1 });
    console.log(`\n📊 Found ${products.length} total products in database\n`);

    let updatedCount = 0;
    let errorCount = 0;
    let noReviewCount = 0;

    for (const product of products) {
      try {
        console.log(`┌─ Processing: ${product.name} (${product._id})`);
        
        // Get all approved reviews for this product
        const reviews = await Review.find({ 
          product: product._id, 
          status: 'approved' 
        });
        
        console.log(`│  Found ${reviews.length} reviews`);
        
        if (reviews.length > 0) {
          // Calculate average rating
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = totalRating / reviews.length;
          const roundedRating = Math.round(avgRating * 10) / 10;
          
          // Update the product
          await Product.findByIdAndUpdate(product._id, {
            $set: {
              rating: roundedRating,
              reviewsCount: reviews.length
            }
          });
          
          console.log(`│  ✅ Updated: rating=${roundedRating}⭐, reviews=${reviews.length}`);
          updatedCount++;
        } else {
          // Set to 0 if no reviews
          await Product.findByIdAndUpdate(product._id, {
            $set: {
              rating: 0,
              reviewsCount: 0
            }
          });
          console.log(`│  ℹ️ No reviews, set to 0⭐`);
          noReviewCount++;
        }
        console.log(`└─${'-'.repeat(50)}`);
      } catch (error) {
        console.error(`│  ❌ Error updating ${product.name}:`, error.message);
        console.log(`└─${'-'.repeat(50)}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Products updated with reviews: ${updatedCount}`);
    console.log(`ℹ️ Products set to 0 (no reviews): ${noReviewCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total: ${products.length}`);
    console.log('='.repeat(70));

    // Specifically check your two products
    console.log('\n🔍 Checking specific products:');
    const machine = await Product.findOne({ name: 'Machine' }).select('name rating reviewsCount');
    const woufer = await Product.findOne({ name: 'woufer' }).select('name rating reviewsCount');
    
    if (machine) console.log(`   Machine: rating=${machine.rating}⭐, reviews=${machine.reviewsCount}`);
    if (woufer) console.log(`   woufer: rating=${woufer.rating}⭐, reviews=${woufer.reviewsCount}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Script completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  }
};

updateAllRatings();