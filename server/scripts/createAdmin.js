#!/usr/bin/env node

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import colors from 'colors';

// Load environment variables
dotenv.config();

const AdminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'super-admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: String,
  lastLogin: Date
}, {
  timestamps: true
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function createFirstAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Connected to database'.green);

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists:'.yellow);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      process.exit(0);
    }

    // Create admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await Admin.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'super-admin',
      isActive: true
    });

    console.log('✅ First admin created successfully:'.green);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n⚠️  IMPORTANT:'.yellow);
    console.log('   Please change the password after first login!'.yellow);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:'.red, error.message);
    console.error('\n💡 Make sure:'.yellow);
    console.error('   1. MongoDB is running'.yellow);
    console.error('   2. DB_URI is set in .env file'.yellow);
    console.error('   3. The database server is accessible'.yellow);
    process.exit(1);
  }
}

// Run the script
createFirstAdmin();