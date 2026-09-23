import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import type { DatabaseConfig } from '@/config/configuration';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.getOrThrow<DatabaseConfig>('database');
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          ssl: db.ssl ? { rejectUnauthorized: false } : false,
          synchronize: false,
          logging: db.logging,
          autoLoadEntities: true,
          entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
          migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
          migrationsTableName: 'typeorm_migrations',
          // Les migrations ne sont pas jouees au demarrage : elles font partie
          // du processus de deploiement, ou elles peuvent etre controlees et
          // annulees.
          migrationsRun: false,
          // Le pool est dimensionne pour un service transactionnel : peu de
          // connexions, tenues courtes.
          extra: {
            max: 20,
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: 30_000,
            statement_timeout: 15_000,
            keepalives: true,
            keepalives_idle: 10,
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
