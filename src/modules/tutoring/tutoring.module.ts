import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutoringSession } from './entities/tutoring-session.entity';
import { SessionParticipant } from './entities/session-participant.entity';
import { TutoringRepository } from './repositories/tutoring.repository';
import { TutoringService } from './services/tutoring.service';
import { TutoringController } from './controllers/tutoring.controller';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TutoringSession, SessionParticipant]),
    UsersModule,
    CoursesModule,
  ],
  controllers: [TutoringController],
  providers: [TutoringRepository, TutoringService],
  exports: [TutoringService, TutoringRepository],
})
export class TutoringModule {}
