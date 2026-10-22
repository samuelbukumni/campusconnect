import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material, MaterialType } from '../entities/material.entity';
import { UploadMaterialDto } from '../dto/upload-material.dto';
import { QueryMaterialsDto } from '../dto/query-materials.dto';

@Injectable()
export class MaterialsRepository {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
  ) {}

  async create(uploaderId: string, dto: UploadMaterialDto): Promise<Material> {
    const material = this.materialRepo.create({
      uploaderId,
      courseId: dto.courseId,
      topicId: dto.topicId,
      title: dto.title,
      description: dto.description,
      fileUrl: dto.fileUrl,
      materialType: dto.materialType || MaterialType.LECTURE_NOTES,
      fileFormat: dto.fileFormat || 'pdf',
      downloadsCount: 0,
    });
    return this.materialRepo.save(material);
  }

  async findById(id: string): Promise<Material | null> {
    return this.materialRepo.findOne({
      where: { id },
      relations: ['uploader', 'course', 'topic'],
    });
  }

  async findMany(query: QueryMaterialsDto): Promise<Material[]> {
    const qb = this.materialRepo
      .createQueryBuilder('material')
      .leftJoinAndSelect('material.uploader', 'uploader')
      .leftJoinAndSelect('material.course', 'course')
      .leftJoinAndSelect('material.topic', 'topic');

    if (query.courseId) {
      qb.andWhere('material.courseId = :courseId', { courseId: query.courseId });
    }

    if (query.topicId) {
      qb.andWhere('material.topicId = :topicId', { topicId: query.topicId });
    }

    if (query.materialType) {
      qb.andWhere('material.materialType = :materialType', {
        materialType: query.materialType,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(material.title ILIKE :search OR material.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    return qb.orderBy('material.createdAt', 'DESC').getMany();
  }

  async incrementDownloads(id: string): Promise<void> {
    await this.materialRepo.increment({ id }, 'downloadsCount', 1);
  }

  async delete(id: string): Promise<void> {
    await this.materialRepo.delete(id);
  }
}
