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
    { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5 },
    { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 30000, quantity: 3 },
    { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 8 },
    { make: 'Honda', model: 'CR-V', category: 'SUV', price: 32000, quantity: 4 },
    { make: 'Ford', model: 'F-150', category: 'Truck', price: 40000, quantity: 2 },
    { make: 'Tesla', model: 'Model 3', category: 'Electric', price: 45000, quantity: 6 },
    { make: 'Tesla', model: 'Model Y', category: 'Electric', price: 52000, quantity: 3 },
    { make: 'BMW', model: '3 Series', category: 'Sedan', price: 55000, quantity: 2 },
    { make: 'Chevrolet', model: 'Tahoe', category: 'SUV', price: 58000, quantity: 1 },
    { make: 'Hyundai', model: 'Tucson', category: 'SUV', price: 28000, quantity: 0 }, // Out of stock
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
