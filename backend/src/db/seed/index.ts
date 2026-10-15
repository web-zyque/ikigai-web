import 'dotenv/config';
import { seedCategories } from './category.seed';
import { seedAdmin } from './admin.seed';

async function main() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // Seed categories first (required for products)
    await seedCategories();
    console.log('');
    
    
    // Seed admin user (optional - only if environment variables are provided)
    if (process.env.INITIAL_ADMIN_PASSWORD) {
      await seedAdmin();
    } else {
      console.log('⚠️  Skipping admin seeding - INITIAL_ADMIN_PASSWORD not provided');
      console.log('   To create an admin user, run: pnpm run seed:admin');
    }
    
    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🏁 Seeding process finished');
  });