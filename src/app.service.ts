import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string; service: string; timestamp: string } {
    return {
      status: 'healthy',
      service: 'The Student Tutoring Application (StudyConnect) API',
      timestamp: new Date().toISOString(),
    };
  }
}
