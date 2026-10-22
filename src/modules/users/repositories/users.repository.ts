import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repo.create(userData);
    return this.repo.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id, isActive: true } });
  }

  async findByEmail(email: string, includePassword = false): Promise<User | null> {
    const qb = this.repo.createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .andWhere('user.isActive = true');

    if (includePassword) {
      qb.addSelect('user.password');
    }

    return qb.getOne();
  }

  async findAll(options?: {
    courseToTeach?: string;
    courseNeedingHelp?: string;
    role?: string;
  }): Promise<User[]> {
    const qb = this.repo.createQueryBuilder('user')
      .where('user.isActive = true');

    if (options?.role) {
      qb.andWhere('user.role = :role', { role: options.role });
    }

    if (options?.courseToTeach) {
      qb.andWhere('user.coursesToTeach LIKE :teachCourse', {
        teachCourse: `%${options.courseToTeach}%`,
      });
    }

    if (options?.courseNeedingHelp) {
      qb.andWhere('user.coursesNeedingHelp LIKE :helpCourse', {
        helpCourse: `%${options.courseNeedingHelp}%`,
      });
    }

    return qb.orderBy('user.rating', 'DESC').getMany();
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.update(id, { isActive: false });
    return (result.affected || 0) > 0;
  }
}
