import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';
import { categories } from '../schema';

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

const initialCategories = [
  { name: 'Lighting', description: 'LED lights, headlights, fog lamps, and other lighting accessories' },
  { name: 'Fog Lamps', description: 'Specialized fog lamps for better visibility' },
  { name: 'Headlights', description: 'Headlight assemblies and upgrades' },
  { name: 'Tail Lights', description: 'Tail light assemblies and LED upgrades' },
  { name: 'Horns', description: 'Horns and sound accessories' },
  { name: 'Seat Covers', description: 'Seat covers and interior protection' },
  { name: 'Car Perfumes', description: 'Air fresheners and car perfumes' },
  { name: 'Android Stereos', description: 'Android-based infotainment systems' },
  { name: 'Roof Light Bars', description: 'Roof-mounted light bars and accessories' },
  { name: 'Mirror Covers', description: 'Side mirror covers and accessories' },
  { name: 'Exterior Accessories', description: 'Various exterior car accessories' },
  { name: 'Other Accessories', description: 'Miscellaneous car accessories' },
];

export async function seedCategories() {
  console.log('📦 Seeding categories...');
  
  try {
    let created = 0;
    let existing = 0;
    
    for (const category of initialCategories) {
      const slug = category.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const existingCategory = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);
      
      if (existingCategory.length === 0) {
        await db.insert(categories).values({
          name: category.name,
          slug,
          description: category.description,
        });
        console.log(`   ✅ Created category: ${category.name}`);
        created++;
      } else {
        console.log(`   ⏭️  Category already exists: ${category.name}`);
        existing++;
      }
    }
    
    console.log(`📦 Categories: ${created} created, ${existing} existing`);
  } catch (error) {
    console.error('❌ Category seeding failed:', error);
    throw error;
  }
}

export async function closeCategoriesConnection() {
  // Neon serverless doesn't require explicit connection closing
  // This function is provided for consistency with the pattern
  console.log('🔌 Categories connection closed');
}

// Allow running this script directly
if (require.main === module) {
  (async () => {
    try {
      console.log('Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Missing');
      await seedCategories();
      console.log('Category seeding completed!');
    } catch (error) {
      console.error(error);
      process.exit(1);
    } finally {
      await closeCategoriesConnection();
    }
  })();
}