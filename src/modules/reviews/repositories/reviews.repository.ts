import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async createReview(
    learnerId: string,
    tutorId: string,
    dto: CreateReviewDto,
  ): Promise<Review> {
    const review = this.reviewRepo.create({
      sessionId: dto.sessionId,
      tutorId,
      learnerId,
      rating: dto.rating,
      comment: dto.comment,
    });
    return this.reviewRepo.save(review);
  }

  async findBySessionAndLearner(
    sessionId: string,
    learnerId: string,
  ): Promise<Review | null> {
    return this.reviewRepo.findOne({
      where: { sessionId, learnerId },
    });
  }

  async findByTutor(tutorId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { tutorId },
      relations: ['learner'],
      order: { createdAt: 'DESC' },
    });
  }

  async calculateTutorRating(tutorId: string): Promise<{ average: number; count: number }> {
    const reviews = await this.reviewRepo.find({ where: { tutorId } });
    if (!reviews.length) {
      return { average: 0, count: 0 };
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = parseFloat((sum / reviews.length).toFixed(2));
    return { average, count: reviews.length };
  }
}
