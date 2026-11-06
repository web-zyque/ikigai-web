import {
  Global,
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

export const DB = 'DB';
const DB_POOL = 'DB_POOL';

@Injectable()
class DbPoolLifecycle implements OnApplicationShutdown {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  onApplicationShutdown() {
    return this.pool.end();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: DB_POOL,
      useFactory: () =>
        new Pool({ connectionString: process.env.DATABASE_URL! }),
    },
    {
      provide: DB,
      useFactory: (pool: Pool) => drizzle({ client: pool, schema }),
      inject: [DB_POOL],
    },
    DbPoolLifecycle,
  ],
  exports: [DB],
})
export class DbModule {}
