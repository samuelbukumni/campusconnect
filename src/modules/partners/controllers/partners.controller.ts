import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PartnersService } from '../services/partners.service';
import { FindPartnerDto } from '../dto/find-partner.dto';
import { ReshufflePartnerDto } from '../dto/reshuffle-partner.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@ApiTags('Study Partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post('match')
  @ApiOperation({ summary: 'Find and match with a peer study partner for a course' })
  @ApiResponse({ status: 201, description: 'Study partner match created successfully' })
  async matchPartner(
    @CurrentUser() user: User,
    @Body() dto: FindPartnerDto,
  ) {
    return this.partnersService.matchPartner(user.id, dto);
  }

  @Get('my-partners')
  @ApiOperation({ summary: 'List all study partner matches for current student' })
  @ApiResponse({ status: 200, description: 'List of study partner matches' })
  async getMyPartners(@CurrentUser() user: User) {
    return this.partnersService.getMyPartners(user.id);
  }

  @Post(':id/reshuffle')
  @ApiOperation({ summary: 'Reshuffle an active study partner match if incompatible' })
  @ApiResponse({ status: 200, description: 'Partner match reshuffled successfully' })
  async reshufflePartner(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReshufflePartnerDto,
  ) {
    return this.partnersService.reshufflePartner(user.id, id, dto);
  }
}
