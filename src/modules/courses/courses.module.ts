import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Topic } from './entities/topic.entity';
import { CoursesRepository } from './repositories/courses.repository';
import { CoursesService } from './services/courses.service';
import { CoursesController } from './controllers/courses.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Topic]),
    UsersModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesRepository, CoursesService],
  exports: [CoursesService, CoursesRepository],
})
export class CoursesModule {}
