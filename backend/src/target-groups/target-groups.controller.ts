import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ConflictException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TargetGroupsService } from './target-groups.service';
import { CreateTargetGroupDto } from './dto/create-target-group.dto';
import { UpdateTargetGroupDto } from './dto/update-target-group.dto';

@ApiTags('Target Groups')
@Controller('target-groups')
export class TargetGroupsController {
  constructor(private readonly targetGroupsService: TargetGroupsService) {}

  @ApiOperation({
    summary: 'Create target group',
    description: 'Create a new target group',
  })
  @ApiResponse({
    status: 201,
    description: 'Target group created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  async create(@Body() createTargetGroupDto: CreateTargetGroupDto) {
    return await this.targetGroupsService.create(createTargetGroupDto);
  }

  @ApiOperation({
    summary: 'Get target groups',
    description: 'Get all target groups or search by keyword',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search target groups by keyword',
  })
  @ApiResponse({
    status: 200,
    description: 'Target groups retrieved successfully',
  })
  @Get()
  async findAll(@Query('search') search: string) {
    if (search) {
      return await this.targetGroupsService.searchByKeyword(search);
    }
    return await this.targetGroupsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.targetGroupsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTargetGroupDto: UpdateTargetGroupDto,
  ) {
    return await this.targetGroupsService.update(+id, updateTargetGroupDto);
  }

  @Delete('')
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.targetGroupsService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.targetGroupsService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}
