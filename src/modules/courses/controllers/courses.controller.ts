import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CoursesService } from '../services/courses.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CreateTopicDto } from '../dto/create-topic.dto';
import { QueryCoursesDto } from '../dto/query-courses.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Courses & Topics')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Browse all courses with topic counts and live tutor demand metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'List of courses with available tutors and learners seeking help counts.',
  })
  async findAll(@Query() query: QueryCoursesDto) {
    return this.coursesService.findAll(query);
  }

  @Public()
  @Get('search')
  @ApiOperation({
    summary: 'Search courses and curriculum topics by keyword (e.g. "Integration" or "MTH 102")',
  })
  @ApiResponse({
    status: 200,
    description: 'Matching courses with topics and tutor availability stats.',
  })
  async search(@Query('q') q: string) {
    return this.coursesService.findAll({ q });
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get single course details with topics syllabus and list of verified student tutors',
  })
  @ApiResponse({
    status: 200,
    description: 'Course details, topics, and available tutors.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Register a new university course' })
  @ApiResponse({ status: 201, description: 'Course created successfully.' })
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/topics')
  @ApiOperation({ summary: 'Add a syllabus topic to a course (e.g. "Integration by Parts")' })
  @ApiResponse({ status: 201, description: 'Topic added successfully.' })
  async addTopic(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createTopicDto: CreateTopicDto,
  ) {
    return this.coursesService.addTopic(id, createTopicDto);
  }

  @Public()
  @Post('seed')
  @ApiOperation({
    summary: 'Pre-populate default university courses (Calculus, Data Structures, Physics, etc.)',
  })
  @ApiResponse({ status: 201, description: 'Courses catalog seeded.' })
  async seed() {
    return this.coursesService.seedDefaultCourses();
  }
}
