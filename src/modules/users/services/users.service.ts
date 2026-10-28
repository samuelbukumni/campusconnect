import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('A student with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = await this.usersRepository.create({
      ...createUserDto,
      email: createUserDto.email.toLowerCase().trim(),
      password: hashedPassword,
    });

    delete user.password;
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Student profile not found');
    }
    return user;
  }

  async findByEmail(email: string, includePassword = false): Promise<User | null> {
    return this.usersRepository.findByEmail(email, includePassword);
  }

  async findAll(filters?: {
    courseToTeach?: string;
    courseNeedingHelp?: string;
    role?: string;
  }): Promise<User[]> {
    return this.usersRepository.findAll(filters);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    const updated = await this.usersRepository.update(user.id, updateUserDto);
    return updated!;
  }

  async markVerified(id: string): Promise<void> {
    await this.usersRepository.update(id, { isVerified: true });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update(id, { password: passwordHash });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findById(id);
    await this.usersRepository.delete(id);
    return { message: 'Student account deactivated successfully' };
  }
}
