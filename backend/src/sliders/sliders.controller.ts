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
  UploadedFile,
  UseInterceptors,
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
import { SlidersService } from './sliders.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { UploadImageValidationPipe } from 'src/common/validators/upload-image.validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageRequiredValidationPipe } from 'src/common/validators/upload-image-required.validator';

@ApiTags('Sliders')
@Controller('sliders')
export class SlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  @ApiOperation({
    summary: 'Create slider',
    description: 'Create a new slider with image',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Summer Sale' },
        description: { type: 'string', example: 'Get up to 50% off' },
        link: { type: 'string', example: '/sale' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Slider image',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Slider created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createSliderDto: CreateSliderDto,
    @UploadedFile(new UploadImageRequiredValidationPipe())
    file: Express.Multer.File,
  ) {
    return await this.slidersService.create(createSliderDto, file);
  }

  @ApiOperation({
    summary: 'Get sliders',
    description: 'Get all sliders or search by keyword',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search sliders by keyword',
  })
  @ApiResponse({ status: 200, description: 'Sliders retrieved successfully' })
  @Get()
  async findAll(@Query('search') search: string) {
    if (search) {
      return await this.slidersService.searchByKeyword(search);
    }
    return await this.slidersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.slidersService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateSliderDto,
    @UploadedFile(new UploadImageRequiredValidationPipe())
    file: Express.Multer.File,
  ) {
    return await this.slidersService.update(+id, updateCategoryDto, file);
  }

  @Delete('')
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.slidersService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.slidersService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}
