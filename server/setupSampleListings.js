/**
 * Safe seed for sample listings with users
 * Usage: node setupSampleListings.js
 */

require('dotenv').config();

const { initialize } = require('./db/mongoConnection');
const bcrypt = require('bcryptjs');

const Listing = require('./models/Listing');
const User = require('./models/User');

// Sample owners to create
const sampleOwners = [
  {
    name: 'Ramesh Reddy',
    email: 'ramesh.property@gmail.com',
    password: 'owner123',
    role: 'owner'
  },
  {
    name: 'Lakshmi Venkatesh',
    email: 'lakshmi.homes@gmail.com',
    password: 'owner123',
    role: 'owner'
  },
  {
    name: 'David Wilson',
    email: 'david.estates@gmail.com',
    password: 'owner123',
    role: 'owner'
  },
  {
    name: 'Meera Krishnan',
    email: 'meera.rentals@gmail.com',
    password: 'owner123',
    role: 'owner'
  },
  {
    name: 'Sunil Agarwal',
    email: 'sunil.properties@gmail.com',
    password: 'owner123',
    role: 'owner'
  },
  {
    name: 'Sanjay K',
    email: 'sanjayk.1234@gmail.com',
    password: 'Sanjayk*1',
    role: 'owner'
  }
];

// Sample users to create
const sampleUsers = [
  {
    name: 'Sanjay K',
    email: 'sanjayk.123it@kongu.edu',
    password: 'Sanjayk*1',
    role: 'user'
  },
  {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@gmail.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gmail.com',
    password: 'user123',
    role: 'user'
  }
];

const sampleListings = [
  {
    title: 'Modern 3 BHK Apartment',
    locationText: 'Anna Salai, Chennai, Tamil Nadu',
    location: { type: 'Point', coordinates: [80.2707, 13.0827] }, // [lng, lat] Chennai
    price: 25000,
    propertyType: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    area: 1200,
    furnished: 'FURNISHED',
    furnishing: 'Furnished',
    ownerEmail: 'ramesh.property@gmail.com',
    description: 'Beautiful apartment with modern amenities. Perfect for small families. Located in prime area with excellent connectivity.',
    amenities: ['PARKING', 'SECURITY', 'FURNISHED'],
    images: ['/images/properties/House2.jpg', '/images/properties/House3.jpg'],
    verified: true,
    status: 'available',
    depositAmount: 50000,
    availableFor: 'Family',
    availableUnits: 1
  },
  {
    title: 'Luxury Villa with Garden',
    locationText: 'Ramanathapuram, Coimbatore, Tamil Nadu',
    location: { type: 'Point', coordinates: [76.9382, 11.0168] }, // Coimbatore
    price: 45000,
    propertyType: 'Villa',
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    furnished: 'SEMI_FURNISHED',
    furnishing: 'Semi-furnished',
    ownerEmail: 'lakshmi.homes@gmail.com',
    description: 'Spacious villa with private garden and parking. Perfect for large families with modern amenities.',
    amenities: ['PRIVATE_GARDEN', 'SERVANT_QUARTERS', 'FULL_POWER_BACKUP', 'PARKING', 'SECURITY'],
    images: ['/images/properties/Front_View.jpg', '/images/properties/House2_Front.jpg'],
    verified: true,
    status: 'available',
    depositAmount: 90000,
    availableFor: 'Family',
    availableUnits: 1
  },
  {
    title: 'Cozy 1 BHK for Rent',
    locationText: 'Madurai Central, Madurai, Tamil Nadu',
    location: { type: 'Point', coordinates: [78.1198, 9.9252] }, // Madurai
    price: 12000,
    propertyType: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    area: 500,
    furnished: 'UNFURNISHED',
    furnishing: 'Unfurnished',
    ownerEmail: 'david.estates@gmail.com',
    description: 'Affordable and cozy 1 BHK near public transport. Ideal for bachelors or working professionals.',
    amenities: ['NEAR_TRANSPORT', 'WATER_SUPPLY', 'SECURITY'],
    images: ['/images/properties/House3.jpg'],
    verified: false,
    status: 'available',
    depositAmount: 24000,
    availableFor: 'Bachelors',
    availableUnits: 1
  },
  {
    title: 'Premium 2 BHK Apartment',
    locationText: 'Indiranagar, Bangalore, Karnataka',
    location: { type: 'Point', coordinates: [77.6408, 12.9784] }, // [lng, lat] Bangalore
    price: 30000,
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 1000,
    furnished: 'FURNISHED',
    furnishing: 'Furnished',
    ownerEmail: 'meera.rentals@gmail.com',
    description: 'Well-furnished 2 BHK apartment in heart of Bangalore. Close to IT parks and shopping malls.',
    amenities: ['PARKING', 'SECURITY', 'FURNISHED', 'LIFT', 'POWER_BACKUP'],
    images: ['/images/properties/House2.jpg'],
    verified: true,
    status: 'available',
    depositAmount: 60000,
    availableFor: 'Any',
    availableUnits: 1
  },
  {
    title: 'Spacious 4 BHK House',
    locationText: 'Jubilee Hills, Hyderabad, Telangana',
    location: { type: 'Point', coordinates: [78.4071, 17.4326] }, // [lng, lat] Hyderabad
    price: 55000,
    propertyType: 'House',
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    furnished: 'SEMI_FURNISHED',
    furnishing: 'Semi-furnished',
    ownerEmail: 'sunil.properties@gmail.com',
    description: 'Large family house with modern facilities. Perfect for joint families with servant quarters.',
    amenities: ['PRIVATE_GARDEN', 'SERVANT_QUARTERS', 'PARKING', 'SECURITY', 'POWER_BACKUP'],
    images: ['/images/properties/House3.jpg'],
    verified: true,
    status: 'available',
    depositAmount: 110000,
    availableFor: 'Family',
    availableUnits: 1
  },
  {
    title: 'Studio Apartment',
    locationText: 'Koregaon Park, Pune, Maharashtra',
    location: { type: 'Point', coordinates: [73.8567, 18.5204] }, // [lng, lat] Pune
    price: 15000,
    propertyType: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    area: 400,
    furnished: 'FURNISHED',
    furnishing: 'Furnished',
    ownerEmail: 'ramesh.property@gmail.com',
    description: 'Compact and fully furnished studio apartment. Perfect for single professionals.',
    amenities: ['FURNISHED', 'SECURITY', 'LIFT'],
    images: ['/images/rooms/Kitchen.jpg'],
    verified: false,
    status: 'available',
    depositAmount: 30000,
    availableFor: 'Bachelors',
    availableUnits: 1
  },
  {
    title: 'Luxury 3 BHK Penthouse',
    locationText: 'Bandra West, Mumbai, Maharashtra',
    location: { type: 'Point', coordinates: [72.8273, 19.0596] }, // [lng, lat] Mumbai (Bandra)
    price: 80000,
    propertyType: 'Apartment',
    bedrooms: 3,
    bathrooms: 3,
    area: 2000,
    furnished: 'FURNISHED',
    furnishing: 'Furnished',
    ownerEmail: 'lakshmi.homes@gmail.com',
    description: 'Premium penthouse with sea view. Fully furnished with premium amenities and concierge service.',
    amenities: ['PARKING', 'SECURITY', 'FURNISHED', 'LIFT', 'GYM', 'SWIMMING_POOL'],
    images: ['/images/properties/House2_Front.jpg'],
    verified: true,
    status: 'available',
    depositAmount: 160000,
    availableFor: 'Family',
    availableUnits: 1
  },
  {
    title: 'Budget 2 BHK Flat',
    locationText: 'Dwarka, Delhi, NCR',
    location: { type: 'Point', coordinates: [77.0433, 28.6139] }, // [lng, lat] Delhi
    price: 20000,
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    area: 800,
    furnished: 'UNFURNISHED',
    furnishing: 'Unfurnished',
    ownerEmail: 'david.estates@gmail.com',
    description: 'Affordable 2 BHK flat in good locality. Suitable for small families.',
    amenities: ['PARKING', 'WATER_SUPPLY'],
    images: ['/images/rooms/Balcony.jpg'],
    verified: false,
    status: 'available',
    depositAmount: 40000,
    availableFor: 'Any',
    availableUnits: 1
  },
  {
    title: 'Family Villa with Pool',
    locationText: 'Calangute, Goa',
    location: { type: 'Point', coordinates: [73.7559, 15.5439] }, // [lng, lat] Goa (Calangute)
    price: 65000,
    propertyType: 'Villa',
    bedrooms: 5,
    bathrooms: 4,
    area: 3500,
    furnished: 'FURNISHED',
    furnishing: 'Furnished',
    ownerEmail: 'meera.rentals@gmail.com',
    description: 'Luxury villa with private pool and garden. Perfect for large families or vacation rentals.',
    amenities: ['PRIVATE_GARDEN', 'SWIMMING_POOL', 'PARKING', 'SECURITY', 'SERVANT_QUARTERS'],
    images: ['/images/properties/House2_Hall.jpg'],
    verified: true,
    status: 'available',
    depositAmount: 130000,
    availableFor: 'Family',
    availableUnits: 1
  },
  {
    title: 'Modern 1 BHK Apartment',
    locationText: 'Salt Lake, Kolkata, West Bengal',
    location: { type: 'Point', coordinates: [88.3639, 22.5726] }, // [lng, lat] Kolkata
    price: 18000,
    propertyType: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    area: 600,
    furnished: 'SEMI_FURNISHED',
    furnishing: 'Semi-furnished',
    ownerEmail: 'sunil.properties@gmail.com',
    description: 'Well-maintained 1 BHK apartment in prime location. Close to metro and shopping areas.',
    amenities: ['PARKING', 'SECURITY', 'LIFT', 'NEAR_TRANSPORT'],
    images: ['/images/rooms/BathRoom.jpg'],
    verified: true,
    status: 'available',
    depositAmount: 36000,
    availableFor: 'Any',
    availableUnits: 1
  }
];

async function seed() {
  try {
    await initialize();
    console.log('Connected to MongoDB, seeding data...\n');

    // Create sample owners
    console.log('Creating sample owners...');
    const createdOwners = [];
    for (const ownerData of sampleOwners) {
      const existingOwner = await User.findOne({ email: ownerData.email });
      if (existingOwner) {
        console.log(`  Owner ${ownerData.email} already exists, skipping...`);
        createdOwners.push(existingOwner);
      } else {
        const hashedPassword = await bcrypt.hash(ownerData.password, 10);
        const owner = await User.create({
          name: ownerData.name,
          email: ownerData.email,
          password_hash: hashedPassword,
          role: ownerData.role
        });
        createdOwners.push(owner);
        console.log(`  ✓ Created owner: ${ownerData.name} (${ownerData.email})`);
      }
    }

    // Create sample users
    console.log('\nCreating sample users...');
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`  User ${userData.email} already exists, skipping...`);
      } else {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({
          name: userData.name,
          email: userData.email,
          password_hash: hashedPassword,
          role: userData.role
        });
        console.log(`  ✓ Created user: ${userData.name} (${userData.email})`);
      }
    }

    // Create owner email to owner ID mapping
    const ownerMap = {};
    createdOwners.forEach(owner => {
      ownerMap[owner.email] = owner._id;
    });

    // Create listings with owner references
    console.log('\nCreating sample listings...');
    const owners = sampleListings.map(l => l.ownerEmail);
    await Listing.deleteMany({ ownerEmail: { $in: owners } });
    console.log('  Removed existing sample listings for owners:', owners);

    const listingsWithOwner = sampleListings.map(listing => ({
      ...listing,
      owner: ownerMap[listing.ownerEmail] || null
    }));

    const created = await Listing.insertMany(listingsWithOwner);
    console.log(`\n✓ Inserted ${created.length} sample listings:`);
    created.forEach((c) => console.log(`  - ${c.title} (₹${c.price}/month) - ${c.locationText || c.location}`));

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('='.repeat(50));
    console.log('🏠 OWNER LOGINS (Password: owner123):');
    sampleOwners.forEach(owner => {
      console.log(`   ${owner.email}`);
    });
    console.log('\n👤 USER LOGINS (Password: user123):');
    sampleUsers.forEach(user => {
      console.log(`   ${user.email}`);
    });
    console.log('='.repeat(50));
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
