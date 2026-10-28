import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserGender } from '../../modules/users/entities/user.entity';

export async function seedDemoData(dataSource: DataSource, logger: Logger): Promise<void> {
  const userRepo = dataSource.getRepository(User);

  const demoEmail = 'demo@campusconnect.com';
  const existingUser = await userRepo.findOne({
    where: { email: demoEmail },
  });

  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('CampusConnect2026!', salt);

    const demoUser = userRepo.create({
      email: demoEmail,
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'Student',
      gender: UserGender.FEMALE,
      role: UserRole.BOTH,
      matricNumber: 'CSE/2023/001',
      department: 'Computer Engineering',
      level: '300',
      bio: 'CampusConnect Demo Student Account. Active peer tutor in Calculus and Data Structures.',
      coursesToTeach: ['CSC 201', 'MTH 102'],
      coursesNeedingHelp: ['PHY 101'],
      rating: 4.9,
      reviewCount: 8,
      totalSessionsGiven: 12,
      totalSessionsAttended: 6,
      isVerified: true,
      isActive: true,
    });

    await userRepo.save(demoUser);
    logger.log('🎉 Demo account seeded successfully: demo@campusconnect.com (Password: CampusConnect2026!)');
  } else {
    logger.log('Demo account (demo@campusconnect.com) already exists. Skipping user seed.');
  }
}
