import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MaterialsService } from '../services/materials.service';
import { UploadMaterialDto } from '../dto/upload-material.dto';
import { QueryMaterialsDto } from '../dto/query-materials.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { User } from '../../users/entities/user.entity';

@ApiTags('Academic Materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Upload academic study material / past question metadata' })
  @ApiResponse({ status: 201, description: 'Material uploaded successfully' })
  async upload(
    @CurrentUser() user: User,
    @Body() dto: UploadMaterialDto,
  ) {
    return this.materialsService.uploadMaterial(user.id, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Browse and filter academic materials by course, topic, or keyword' })
  @ApiResponse({ status: 200, description: 'List of academic materials' })
  async findAll(@Query() query: QueryMaterialsDto) {
    return this.materialsService.getMaterials(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get details of an academic material' })
  @ApiResponse({ status: 200, description: 'Academic material details' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialsService.getMaterialById(id);
  }

  @Public()
  @Post(':id/download')
  @ApiOperation({ summary: 'Increment download counter and retrieve material file link' })
  @ApiResponse({ status: 200, description: 'Download recorded and file returned' })
  async recordDownload(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialsService.recordDownload(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete study material (only uploader or administrator)' })
  @ApiResponse({ status: 200, description: 'Academic material deleted' })
  async delete(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.materialsService.deleteMaterial(user.id, id, user.role);
  }
}
