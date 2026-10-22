import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPartnerMatch } from './entities/study-partner-match.entity';
import { User } from '../users/entities/user.entity';
import { PartnersRepository } from './repositories/partners.repository';
import { PartnersService } from './services/partners.service';
import { PartnersController } from './controllers/partners.controller';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyPartnerMatch, User]),
    CoursesModule,
  ],
  controllers: [PartnersController],
  providers: [PartnersRepository, PartnersService],
  exports: [PartnersService, PartnersRepository],
})
export class PartnersModule {}
