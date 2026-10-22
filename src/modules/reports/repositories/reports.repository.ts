import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from '../entities/report.entity';
import { CreateReportDto } from '../dto/create-report.dto';

@Injectable()
export class ReportsRepository {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
  ) {}

  async create(reporterId: string, dto: CreateReportDto): Promise<Report> {
    const report = this.reportRepo.create({
      reporterId,
      reportedUserId: dto.reportedUserId,
      sessionId: dto.sessionId,
      reason: dto.reason,
      description: dto.description,
      status: ReportStatus.PENDING,
    });
    return this.reportRepo.save(report);
  }

  async findById(id: string): Promise<Report | null> {
    return this.reportRepo.findOne({
      where: { id },
      relations: ['reporter', 'reportedUser', 'session'],
    });
  }

  async findByReporter(reporterId: string): Promise<Report[]> {
    return this.reportRepo.find({
      where: { reporterId },
      relations: ['reportedUser', 'session'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(status?: ReportStatus): Promise<Report[]> {
    const qb = this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('report.reportedUser', 'reportedUser')
      .leftJoinAndSelect('report.session', 'session');

    if (status) {
      qb.andWhere('report.status = :status', { status });
    }

    return qb.orderBy('report.createdAt', 'DESC').getMany();
  }

  async updateStatus(
    id: string,
    status: ReportStatus,
    adminNotes?: string,
  ): Promise<Report | null> {
    await this.reportRepo.update(id, {
      status,
      ...(adminNotes ? { adminNotes } : {}),
    });
    return this.findById(id);
  }
}
