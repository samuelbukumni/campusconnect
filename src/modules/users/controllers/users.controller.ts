import {
  Controller,
  Get,
  Patch,
  Delete,
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
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Users / Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Browse / search student tutors and learners' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'courseToTeach', required: false, type: String })
  @ApiQuery({ name: 'courseNeedingHelp', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of students matching search criteria' })
  async findAll(
    @Query('role') role?: UserRole,
    @Query('courseToTeach') courseToTeach?: string,
    @Query('courseNeedingHelp') courseNeedingHelp?: string,
  ) {
    return this.usersService.findAll({ role, courseToTeach, courseNeedingHelp });
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current student profile' })
  @ApiResponse({ status: 200, description: 'Current authenticated student profile' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student details by ID' })
  @ApiResponse({ status: 200, description: 'Student profile details' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Patch('profile/me')
  @ApiOperation({ summary: 'Update current student profile' })
  @ApiResponse({ status: 200, description: 'Updated student profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('profile/me')
  @ApiOperation({ summary: 'Deactivate current student account' })
  @ApiResponse({ status: 200, description: 'Student account deactivated' })
  async remove(@CurrentUser('id') userId: string) {
    return this.usersService.remove(userId);
  }
}
