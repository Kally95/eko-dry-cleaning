import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@eko-cleaning.com' },
    update: {},
    create: {
      email: 'admin@eko-cleaning.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create garment types
  const garmentTypes = [
    { name: 'Jacket', displayOrder: 1 },
    { name: 'Trousers', displayOrder: 2 },
    { name: 'Waistcoat', displayOrder: 3 },
    { name: 'Shirt', displayOrder: 4 },
    { name: 'Dress', displayOrder: 5 },
    { name: 'Skirt', displayOrder: 6 },
    { name: 'Coat', displayOrder: 7 },
    { name: 'High-vis coat', displayOrder: 8 },
    { name: 'Tie', displayOrder: 9 },
    { name: 'Top', displayOrder: 10 },
    { name: 'MISC', displayOrder: 11 },
    { name: 'High-vis vest', displayOrder: 12 },
    { name: 'Raincoat', displayOrder: 13 },
    { name: 'Rain jacket', displayOrder: 14 },
    { name: 'Jumpers', displayOrder: 15 },
    { name: 'Aprons', displayOrder: 16 },
    { name: 'Table covers', displayOrder: 17 },
  ];

  for (const garment of garmentTypes) {
    await prisma.garmentType.upsert({
      where: { name: garment.name },
      update: {},
      create: garment,
    });
  }
  console.log('Created garment types:', garmentTypes.length);

  // Create companies
  const securicorp = await prisma.company.upsert({
    where: { id: 'company-securicorp' },
    update: {},
    create: {
      id: 'company-securicorp',
      name: 'Securicorp',
    },
  });

  const fortress = await prisma.company.upsert({
    where: { id: 'company-fortress' },
    update: {},
    create: {
      id: 'company-fortress',
      name: 'Fortress Security',
    },
  });

  const citywatch = await prisma.company.upsert({
    where: { id: 'company-citywatch' },
    update: {},
    create: {
      id: 'company-citywatch',
      name: 'CityWatch Services',
    },
  });
  console.log('Created companies: Securicorp, Fortress Security, CityWatch Services');

  // Create sites for Securicorp
  await prisma.site.upsert({
    where: { id: 'site-canary-wharf' },
    update: {},
    create: {
      id: 'site-canary-wharf',
      name: 'Canary Wharf Tower',
      address: '1 Canada Square, Canary Wharf, London E14 5AB',
      pin: '1234',
      companyId: securicorp.id,
    },
  });

  await prisma.site.upsert({
    where: { id: 'site-the-shard' },
    update: {},
    create: {
      id: 'site-the-shard',
      name: 'The Shard',
      address: '32 London Bridge Street, London SE1 9SG',
      pin: '5678',
      companyId: securicorp.id,
    },
  });

  // Create sites for Fortress
  await prisma.site.upsert({
    where: { id: 'site-liverpool-street' },
    update: {},
    create: {
      id: 'site-liverpool-street',
      name: 'Liverpool Street Station',
      address: 'Liverpool Street, London EC2M 7QH',
      pin: '9012',
      companyId: fortress.id,
    },
  });

  // Create sites for CityWatch
  await prisma.site.upsert({
    where: { id: 'site-waterloo' },
    update: {},
    create: {
      id: 'site-waterloo',
      name: 'Waterloo Station',
      address: 'Waterloo Road, London SE1 8SW',
      pin: '3456',
      companyId: citywatch.id,
    },
  });

  console.log('Created sites for all companies');

  console.log('\n✅ Database seeded successfully!');
  console.log('\nDefault admin credentials:');
  console.log('Email: admin@eko-cleaning.com');
  console.log('Password: admin123');
  console.log('\nSite PINs:');
  console.log('Canary Wharf Tower: 1234');
  console.log('The Shard: 5678');
  console.log('Liverpool Street Station: 9012');
  console.log('Waterloo Station: 3456');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
