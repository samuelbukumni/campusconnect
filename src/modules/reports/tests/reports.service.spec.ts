import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { ReportsRepository } from '../repositories/reports.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { ReportReason, ReportStatus } from '../entities/report.entity';

describe('ReportsService', () => {
  let service: ReportsService;
  let reportsRepo: any;
  let usersRepo: any;

  beforeEach(async () => {
    reportsRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByReporter: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };

    usersRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: ReportsRepository, useValue: reportsRepo },
        { provide: UsersRepository, useValue: usersRepo },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReport', () => {
    const mockDto = {
      reportedUserId: 'bad-user',
      reason: ReportReason.NO_SHOW,
      description: 'Did not attend scheduled session',
    };

    it('should throw BadRequestException if user reports themselves', async () => {
      await expect(
        service.createReport('bad-user', mockDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if reported user does not exist', async () => {
      usersRepo.findById.mockResolvedValue(null);

      await expect(
        service.createReport('reporter-1', mockDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create report successfully when reported user exists', async () => {
      usersRepo.findById.mockResolvedValue({ id: 'bad-user' });
      reportsRepo.create.mockResolvedValue({ id: 'rep-1', ...mockDto });

      const result = await service.createReport('reporter-1', mockDto);
      expect(result.id).toBe('rep-1');
      expect(reportsRepo.create).toHaveBeenCalledWith('reporter-1', mockDto);
    });
  });

  describe('updateReportStatus', () => {
    it('should throw NotFoundException if report does not exist', async () => {
      reportsRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateReportStatus('rep-1', { status: ReportStatus.RESOLVED }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update report status successfully', async () => {
      reportsRepo.findById.mockResolvedValue({ id: 'rep-1' });
      reportsRepo.updateStatus.mockResolvedValue({
        id: 'rep-1',
        status: ReportStatus.RESOLVED,
      });

      const result = await service.updateReportStatus('rep-1', {
        status: ReportStatus.RESOLVED,
        adminNotes: 'Resolved amicably',
      });
      expect(result.status).toBe(ReportStatus.RESOLVED);
    });
  });
});
