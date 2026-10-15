import 'dotenv/config';
import { seedCategories, closeCategoriesConnection } from './category.seed';
import { seedAdmin, closeAdminConnection } from './admin.seed';

async function main() {
  await seedCategories();
  
  // Only seed admin if password is provided
  if (process.env.INITIAL_ADMIN_PASSWORD) {
    await seedAdmin();
  } else {
    console.log('⚠️  Skipping admin seeding - INITIAL_ADMIN_PASSWORD not provided');
    console.log('   To create an admin user, run: pnpm run seed:admin');
  }

  console.log('✅ Database seeding completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await closeCategoriesConnection();
    await closeAdminConnection();
  });