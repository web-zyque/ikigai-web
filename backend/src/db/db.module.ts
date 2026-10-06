import { Global, Module } from '@nestjs/common';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export const DB = 'DB';

@Global()
@Module({
  providers: [
    {
      provide: DB,
      useFactory: () => drizzle(neon(process.env.DATABASE_URL!), { schema }),
    },
  ],
  exports: [DB],
})
export class DbModule {}
