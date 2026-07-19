/**
 * Database Seed Script
 *
 * 📚 INTERVIEW EXPLANATION:
 * A "seed" file populates your database with initial/test data.
 * Useful for:
 *   - Development: have realistic data to work with
 *   - Demos: show the app already populated
 *   - Testing: predictable starting state
 *
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (in development only)
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@cardealership.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log(`✅ Regular user created: ${user.email}`);

  // Create sample vehicles
  const vehicles = [
    { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5, imageUrl: '/uploads/toyota_camry_1784477285419.jpg' },
    { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 30000, quantity: 3, imageUrl: '/uploads/toyota_rav4_1784477296483.jpg' },
    { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 8, imageUrl: '/uploads/honda_civic_1784477308131.jpg' },
    { make: 'Honda', model: 'CR-V', category: 'SUV', price: 32000, quantity: 4, imageUrl: '/uploads/honda_crv_1784477319531.jpg' },
    { make: 'Ford', model: 'F-150', category: 'Truck', price: 40000, quantity: 2, imageUrl: '/uploads/ford_f150_1784477331532.jpg' },
    { make: 'Tesla', model: 'Model 3', category: 'Electric', price: 45000, quantity: 6, imageUrl: '/uploads/tesla_model3_1784477342241.jpg' },
    { make: 'Tesla', model: 'Model Y', category: 'Electric', price: 52000, quantity: 3, imageUrl: '/uploads/tesla_modely_1784477355975.jpg' },
    { make: 'BMW', model: '3 Series', category: 'Sedan', price: 55000, quantity: 2, imageUrl: '/uploads/bmw_3series_1784477365841.jpg' },
    { make: 'Chevrolet', model: 'Tahoe', category: 'SUV', price: 58000, quantity: 1, imageUrl: '/uploads/chevrolet_tahoe_1784477377682.jpg' },
    { make: 'Hyundai', model: 'Tucson', category: 'SUV', price: 28000, quantity: 0, imageUrl: '/uploads/hyundai_tucson_1784477387344.jpg' }, // Out of stock
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.create({ data: vehicle });
  }

  console.log(`✅ ${vehicles.length} vehicles created`);
  console.log('\n🎉 Seed complete!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin: admin@cardealership.com / admin123');
  console.log('   User:  user@example.com / user123');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
