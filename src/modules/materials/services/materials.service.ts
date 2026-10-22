import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MaterialsRepository } from '../repositories/materials.repository';
import { UploadMaterialDto } from '../dto/upload-material.dto';
import { QueryMaterialsDto } from '../dto/query-materials.dto';
import { Material } from '../entities/material.entity';
import { CoursesRepository } from '../../courses/repositories/courses.repository';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class MaterialsService {
  constructor(
    private readonly materialsRepo: MaterialsRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async uploadMaterial(
    uploaderId: string,
    dto: UploadMaterialDto,
  ): Promise<Material> {
    const course = await this.coursesRepo.findById(dto.courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${dto.courseId} not found`);
    }

    if (dto.topicId) {
      const topic = await this.coursesRepo.findTopicById(dto.topicId);
      if (!topic) {
        throw new NotFoundException(`Topic with ID ${dto.topicId} not found`);
      }
    }

    return this.materialsRepo.create(uploaderId, dto);
  }

  async getMaterials(query: QueryMaterialsDto): Promise<Material[]> {
    return this.materialsRepo.findMany(query);
  }

  async getMaterialById(id: string): Promise<Material> {
    const material = await this.materialsRepo.findById(id);
    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    return material;
  }

  async recordDownload(id: string): Promise<Material> {
    const material = await this.getMaterialById(id);
    await this.materialsRepo.incrementDownloads(id);
    material.downloadsCount += 1;
    return material;
  }

  async deleteMaterial(
    userId: string,
    id: string,
    userRole: UserRole,
  ): Promise<{ message: string }> {
    const material = await this.getMaterialById(id);

    if (material.uploaderId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to delete this study material',
      );
    }

    await this.materialsRepo.delete(id);
    return { message: 'Academic material successfully deleted' };
  }
}
