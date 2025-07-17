import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/files/files.service';
import { UploadImageValidationPipe } from 'src/common/validators/upload-image.validator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly filesServices: FilesService,
  ) {}

  @ApiOperation({
    summary: 'Create category',
    description: 'Create a new product category with image',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Running Shoes' },
        description: { type: 'string', example: 'Sports running shoes' },
        parent: { type: 'number', example: 1 },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Category image',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile(new UploadImageValidationPipe()) file: Express.Multer.File,
  ) {
    try {
      return await this.categoriesService.create(createCategoryDto, file);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @ApiOperation({
    summary: 'Get categories',
    description: 'Get all categories or search by criteria',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search categories by keyword',
  })
  @ApiQuery({ name: 'id', required: false, description: 'Get category by ID' })
  @ApiQuery({
    name: 'parent',
    required: false,
    description: 'Get categories by parent ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('id') id: string,
    @Query('parent') parent: string,
  ) {
    if (search) {
      return await this.categoriesService.searchByKeyword(search);
    } else if (id || parent) {
      return await this.categoriesService.findOne({ id: +id, parent: +parent });
    } else {
      return await this.categoriesService.findAll();
    }
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.categoriesService.update(+id, updateCategoryDto, file);
  }

  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data?.id) {
      return await this.categoriesService.removeOne(+data?.id);
    } else if (data?.ids) {
      return await this.categoriesService.removeMany(data?.ids);
    }
    if (!data?.id || !data?.ids) {
      throw new BadRequestException('Please provide either id or ids.');
    }
  }

  @ApiOperation({
    summary: 'Count categories',
    description: 'Get total number of categories',
  })
  @ApiResponse({ status: 200, description: 'Category count retrieved' })
  @Get('count')
  async onCountTotalCategories() {
    return await this.categoriesService.handleCountTotalCategories();
  }
}
