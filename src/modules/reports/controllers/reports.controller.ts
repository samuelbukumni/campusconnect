import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportStatusDto } from '../dto/update-report-status.dto';
import { ReportStatus } from '../entities/report.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User, UserRole } from '../../users/entities/user.entity';

@ApiTags('Disciplinary & Safety Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a report regarding misconduct, scam, or no-show' })
  @ApiResponse({ status: 201, description: 'Report successfully submitted' })
  async createReport(
    @CurrentUser() user: User,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.createReport(user.id, dto);
  }

  @Get('my-reports')
  @ApiOperation({ summary: 'List reports submitted by current student' })
  @ApiResponse({ status: 200, description: 'List of user reports' })
  async getMyReports(@CurrentUser() user: User) {
    return this.reportsService.getMyReports(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all reports (Admin only)' })
  @ApiQuery({ name: 'status', enum: ReportStatus, required: false })
  @ApiResponse({ status: 200, description: 'List of all reports' })
  async getAllReports(
    @CurrentUser() user: User,
    @Query('status') status?: ReportStatus,
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can view all reports');
    }
    return this.reportsService.getAllReports(status);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update report resolution status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Report status updated' })
  async updateReportStatus(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can update report status');
    }
    return this.reportsService.updateReportStatus(id, dto);
  }
}
