import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsRepository } from './repositories/reviews.repository';
import { ReviewsService } from './services/reviews.service';
import { ReviewsController } from './controllers/reviews.controller';
import { TutoringModule } from '../tutoring/tutoring.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    TutoringModule,
    UsersModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsRepository, ReviewsService],
  exports: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
