import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MaterialsService } from '../services/materials.service';
import { MaterialsRepository } from '../repositories/materials.repository';
import { CoursesRepository } from '../../courses/repositories/courses.repository';
import { UserRole } from '../../users/entities/user.entity';

describe('MaterialsService', () => {
  let service: MaterialsService;
  let materialsRepo: any;
  let coursesRepo: any;

  beforeEach(async () => {
    materialsRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      incrementDownloads: jest.fn(),
      delete: jest.fn(),
    };

    coursesRepo = {
      findById: jest.fn(),
      findTopicById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        { provide: MaterialsRepository, useValue: materialsRepo },
        { provide: CoursesRepository, useValue: coursesRepo },
      ],
    }).compile();

    service = module.get<MaterialsService>(MaterialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadMaterial', () => {
    it('should throw NotFoundException if course does not exist', async () => {
      coursesRepo.findById.mockResolvedValue(null);

      await expect(
        service.uploadMaterial('user-1', {
          courseId: 'c1',
          title: 'Notes',
          fileUrl: 'https://example.com/file.pdf',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create material when course exists', async () => {
      coursesRepo.findById.mockResolvedValue({ id: 'c1' });
      materialsRepo.create.mockResolvedValue({ id: 'mat-1', title: 'Notes' });

      const result = await service.uploadMaterial('user-1', {
        courseId: 'c1',
        title: 'Notes',
        fileUrl: 'https://example.com/file.pdf',
      });

      expect(result.id).toBe('mat-1');
    });
  });

  describe('deleteMaterial', () => {
    it('should throw ForbiddenException if user is not uploader and not admin', async () => {
      materialsRepo.findById.mockResolvedValue({
        id: 'mat-1',
        uploaderId: 'owner-id',
      });

      await expect(
        service.deleteMaterial('other-user', 'mat-1', UserRole.LEARNER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow deletion if user is admin', async () => {
      materialsRepo.findById.mockResolvedValue({
        id: 'mat-1',
        uploaderId: 'owner-id',
      });
      materialsRepo.delete.mockResolvedValue(undefined);

      const res = await service.deleteMaterial(
        'admin-user',
        'mat-1',
        UserRole.ADMIN,
      );
      expect(res.message).toContain('successfully deleted');
    });
  });
});
