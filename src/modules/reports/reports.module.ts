import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportsRepository } from './repositories/reports.repository';
import { ReportsService } from './services/reports.service';
import { ReportsController } from './controllers/reports.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Report]), UsersModule],
  controllers: [ReportsController],
  providers: [ReportsRepository, ReportsService],
  exports: [ReportsService, ReportsRepository],
})
export class ReportsModule {}
