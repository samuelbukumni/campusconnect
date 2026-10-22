import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { User } from '../../users/entities/user.entity';

@ApiTags('Reviews & Testimonials')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Submit a 1-5 star review and feedback for a completed session' })
  @ApiResponse({ status: 201, description: 'Review submitted successfully' })
  async createReview(
    @CurrentUser() user: User,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(user.id, dto);
  }

  @Public()
  @Get('tutor/:tutorId')
  @ApiOperation({ summary: 'Retrieve all reviews and testimonials for a tutor' })
  @ApiResponse({ status: 200, description: 'List of tutor reviews' })
  async getTutorReviews(@Param('tutorId', ParseUUIDPipe) tutorId: string) {
    return this.reviewsService.getTutorReviews(tutorId);
  }
}
