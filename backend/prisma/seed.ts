import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clear existing data
  await prisma.activity.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: 'password123',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password: 'password123',
    },
  });

  console.log('Created users:', { user1, user2 });

  // Create test activities
  const activity1 = await prisma.activity.create({
    data: {
      type: 'Course',
      date: '2024-01-15',
      duration: 30,
      distance: 5,
      ownerId: user1.id,
    },
  });

  const activity2 = await prisma.activity.create({
    data: {
      type: 'Vélo',
      date: '2024-01-16',
      duration: 60,
      distance: 25,
      ownerId: user1.id,
    },
  });

  const activity3 = await prisma.activity.create({
    data: {
      type: 'Natation',
      date: '2024-01-17',
      duration: 45,
      distance: 2,
      ownerId: user2.id,
    },
  });

  console.log('Created activities:', { activity1, activity2, activity3 });
  console.log('Seeding finished successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
