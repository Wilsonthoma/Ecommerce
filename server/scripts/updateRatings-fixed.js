// server/scripts/updateRatings-fixed.js - WITH HARDCODED URI FOR TESTING
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from the correct path
dotenv.config({ path: join(__dirname, '..', '.env') });

// For testing - if env still not loading, use this directly
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kwetushop';

console.log('\n' + '='.repeat(70));
console.log('📊 PRODUCT RATING UPDATE SCRIPT');
console.log('='.repeat(70));
console.log(`\n📌 Using MongoDB URI: ${MONGODB_URI.replace(/:([^:@]{3})[^@]*@/, ':****@')}`);

const updateAllRatings = async () => {
  try {
    console.log('\n📦 Connecting to MongoDB...');
    
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI is not defined');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Get all products
    const products = await Product.find({}).sort({ name: 1 });
    console.log(`\n📊 Found ${products.length} total products in database\n`);

    let updatedCount = 0;
    let errorCount = 0;
    let noReviewCount = 0;
    let productsWithReviews = [];

    for (const product of products) {
      try {
        console.log(`┌─ Processing: ${product.name}`);
        console.log(`│  ID: ${product._id}`);
        
        // Get all approved reviews for this product
        const reviews = await Review.find({ 
          product: product._id, 
          status: 'approved' 
        }).sort({ createdAt: -1 });
        
        console.log(`│  Found ${reviews.length} approved reviews`);
        
        if (reviews.length > 0) {
          // Calculate average rating
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = totalRating / reviews.length;
          const roundedRating = Math.round(avgRating * 10) / 10;
          
          // Show review details
          console.log(`│  Reviews breakdown:`);
          reviews.forEach((review, idx) => {
            console.log(`│    ${idx + 1}. Rating: ${review.rating}⭐ - ${review.userName} - "${review.comment.substring(0, 30)}..."`);
          });
          
          console.log(`│  Average: ${avgRating.toFixed(2)} → ${roundedRating}⭐`);
          
          // Update the product
          const updatedProduct = await Product.findByIdAndUpdate(
            product._id,
            {
              $set: {
                rating: roundedRating,
                reviewsCount: reviews.length
              }
            },
            { new: true }
          );
          
          console.log(`│  ✅ Updated: rating=${updatedProduct.rating}⭐, reviews=${updatedProduct.reviewsCount}`);
          updatedCount++;
          productsWithReviews.push({
            name: product.name,
            oldRating: product.rating,
            newRating: updatedProduct.rating,
            reviews: reviews.length
          });
        } else {
          // No reviews, set to 0
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
        console.error(`│  ❌ Error updating product ${product._id}:`, error.message);
        console.log(`└─${'-'.repeat(50)}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Products updated with reviews: ${updatedCount}`);
    console.log(`ℹ️ Products with no reviews: ${noReviewCount}`);
    console.log(`❌ Errors encountered: ${errorCount}`);
    console.log(`📊 Total products processed: ${products.length}`);
    
    if (productsWithReviews.length > 0) {
      console.log('\n📋 Products updated with new ratings:');
      console.log('-'.repeat(70));
      productsWithReviews.forEach(p => {
        console.log(`   ${p.name}: ${p.oldRating}⭐ → ${p.newRating}⭐ (${p.reviews} reviews)`);
      });
    }

    // Verify specific products from your database
    const specificProducts = [
      { id: '69977672fd31e6b630f101f0', name: 'Machine' },
      { id: '69962653d0cf43f04184247b', name: 'woufer' }
    ];

    console.log('\n🔍 VERIFYING SPECIFIC PRODUCTS:');
    console.log('-'.repeat(70));
    
    for (const sp of specificProducts) {
      const product = await Product.findById(sp.id).select('name rating reviewsCount');
      if (product) {
        console.log(`   ${sp.name}: rating=${product.rating}⭐, reviews=${product.reviewsCount}`);
      } else {
        console.log(`   ${sp.name}: NOT FOUND`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ SCRIPT COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  }
};

// Run the update
updateAllRatings();