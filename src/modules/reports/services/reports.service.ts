import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ReportsRepository } from '../repositories/reports.repository';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportStatusDto } from '../dto/update-report-status.dto';
import { Report, ReportStatus } from '../entities/report.entity';
import { UsersRepository } from '../../users/repositories/users.repository';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportsRepo: ReportsRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async createReport(
    reporterId: string,
    dto: CreateReportDto,
  ): Promise<Report> {
    if (reporterId === dto.reportedUserId) {
      throw new BadRequestException('You cannot file a disciplinary report against yourself');
    }

    const reportedUser = await this.usersRepo.findById(dto.reportedUserId);
    if (!reportedUser) {
      throw new NotFoundException(
        `User with ID ${dto.reportedUserId} not found`,
      );
    }

    return this.reportsRepo.create(reporterId, dto);
  }

  async getMyReports(reporterId: string): Promise<Report[]> {
    return this.reportsRepo.findByReporter(reporterId);
  }

  async getAllReports(status?: ReportStatus): Promise<Report[]> {
    return this.reportsRepo.findAll(status);
  }

  async updateReportStatus(
    id: string,
    dto: UpdateReportStatusDto,
  ): Promise<Report> {
    const report = await this.reportsRepo.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    const updated = await this.reportsRepo.updateStatus(
      id,
      dto.status,
      dto.adminNotes,
    );
    return updated!;
  }
}
