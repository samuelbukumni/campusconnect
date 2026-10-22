import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { MaterialsRepository } from './repositories/materials.repository';
import { MaterialsService } from './services/materials.service';
import { MaterialsController } from './controllers/materials.controller';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [TypeOrmModule.forFeature([Material]), CoursesModule],
  controllers: [MaterialsController],
  providers: [MaterialsRepository, MaterialsService],
  exports: [MaterialsService, MaterialsRepository],
})
export class MaterialsModule {}
