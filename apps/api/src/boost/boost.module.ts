import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { GamificationModule } from '../gamification/gamification.module';
import { ProgressModule } from '../learning/progress.module';
import { BOOST_ENTITIES } from './boost.entities';
import { BoostController } from './boost.controller';
import { BoostService } from './boost.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(BOOST_ENTITIES),
    AuthModule,
    ProgressModule,
    GamificationModule,
  ],
  controllers: [BoostController],
  providers: [BoostService],
  exports: [BoostService],
})
export class BoostModule {}
