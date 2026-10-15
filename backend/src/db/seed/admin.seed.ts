import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';
import * as schema from '../schema';
import { admins } from '../schema';

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

export async function seedAdmin() {
  const adminId = process.env.INITIAL_ADMIN_ID || 'admin';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@ikigaiautomotive.com';
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Administrator';
  const adminRole = process.env.INITIAL_ADMIN_ROLE || 'ADMIN';

  if (!adminPassword) {
    console.error('❌ INITIAL_ADMIN_PASSWORD environment variable is required');
    throw new Error('Missing admin password');
  }

  console.log('👤 Creating initial admin user...');
  
  try {
    // Check if admin already exists
    const existing = await db
      .select()
      .from(admins)
      .where(eq(admins.adminId, adminId))
      .limit(1);
    
    if (existing.length > 0) {
      console.log(`   ⏭️  Admin user '${adminId}' already exists`);
      return;
    }

    // Create admin user
    const passwordHash = await argon2.hash(adminPassword);
    
    await db.insert(admins).values({
      adminId,
      fullName: adminName,
      email: adminEmail,
      passwordHash,
      role: adminRole as 'ADMIN' | 'STAFF',
      isActive: true,
    });
    
    console.log(`   ✅ Admin user created successfully!`);

    
  } catch (error: any) {
    if (error?.code === '23505') {
      if (error.constraint === 'admins_admin_id_unique') {
        console.log(`   ⏭️  Admin ID '${adminId}' already exists`);
      } else if (error.constraint === 'admins_email_unique') {
        console.log(`   ⏭️  Admin email '${adminEmail}' already registered`);
      }
    } else {
      console.error('❌ Admin seeding failed:', error);
      throw error;
    }
  }
}

export async function closeAdminConnection() {

  console.log('🔌 Admin connection closed');
}

// Allow running this script directly
if (require.main === module) {
  (async () => {
    try {
      console.log('Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Missing');
      await seedAdmin();
      console.log('\n🔐 Keep these credentials secure!');
    } catch (error) {
      console.error(error);
      process.exit(1);
    } finally {
      await closeAdminConnection();
    }
  })();
}