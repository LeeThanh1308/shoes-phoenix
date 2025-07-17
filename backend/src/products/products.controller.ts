import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
  ConflictException,
  UseGuards,
  Req,
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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadImagesRequiredValidationPipe } from 'src/common/validators/upload-images-required.validator';
import { UploadImageValidationPipe } from 'src/common/validators/upload-image.validator';
import { UploadImagesValidationPipe } from 'src/common/validators/upload-images.validator';
import { FiltersProductDto } from './dto/filters-product.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RequestWithUser } from 'src/common/types/request-with-user';
import { UserRoles } from 'src/guards/roles.decorator';
import { EnumRoles } from 'src/guards/user-role.enum';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({
    summary: 'Create product',
    description: 'Create a new product with images',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Nike Air Max 270' },
        slug: { type: 'string', example: 'nike-air-max-270' },
        barcode: { type: 'string', example: '1234567890123' },
        description: { type: 'string', example: 'Comfortable running shoes' },
        costPrice: { type: 'number', example: 100000 },
        sellingPrice: { type: 'number', example: 150000 },
        discount: { type: 'number', example: 10 },
        isActive: { type: 'boolean', example: true },
        brandID: { type: 'number', example: 1 },
        targetGroupID: { type: 'number', example: 1 },
        categoryID: { type: 'number', example: 1 },
        colors: {
          type: 'string',
          example: '[{"colorID": 1, "quantity": 10}]',
          description: 'JSON string of product colors',
        },
        sizes: {
          type: 'string',
          example: '[{"sizeID": 1, "quantity": 10}]',
          description: 'JSON string of product sizes',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product images',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(new UploadImagesRequiredValidationPipe())
    files: Express.Multer.File[],
  ) {
    return await this.productsService.create(createProductDto, files);
  }

  @ApiOperation({
    summary: 'Create default product data',
    description: 'Create default data for products (for development/testing)',
  })
  @ApiResponse({ status: 200, description: 'Default data created' })
  @Get('create-data')
  async onCreateDefaultData() {
    return await this.productsService.handleCreateDefaultData();
  }

  @ApiOperation({
    summary: 'Get products',
    description: 'Get all products or search by criteria',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search products by keyword',
  })
  @ApiQuery({ name: 'id', required: false, description: 'Get product by ID' })
  @ApiQuery({
    name: 'slug',
    required: false,
    description: 'Get product by slug',
  })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('id') id: string,
    @Query('slug') slug: string,
  ) {
    if (search) {
      return await this.productsService.searchByKeyword(search);
    }
    if (slug) {
      return await this.productsService.findProductBySlug(slug);
    }
    if (id) {
      return await this.productsService.findOne(+id);
    }
    return await this.productsService.findAll();
  }

  @ApiOperation({
    summary: 'Get sold products',
    description: 'Get total sold products count',
  })
  @ApiResponse({ status: 200, description: 'Sold products count retrieved' })
  @Get('solds')
  async getInvetory() {
    return await this.productsService.handleFindTotalSoldProducts();
  }

  @ApiOperation({
    summary: 'Search and filter products',
    description:
      'Search products with advanced filters including keyword, pagination, colors, brands, categories, price range, and sorting',
  })
  @ApiBody({
    type: FiltersProductDto,
    description: 'Search and filter criteria',
  })
  @ApiResponse({
    status: 200,
    description: 'Filtered products retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid filter parameters' })
  @Post('search')
  async searchFilter(@Body() filtersProductDto: FiltersProductDto) {
    return await this.productsService.searchFilter(filtersProductDto);
  }

  @Get('cashiers')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER, EnumRoles.STAFF])
  async onSearchProductByCashiers(
    @Req() req: RequestWithUser,
    @Query('search') search: string,
  ) {
    const user = req.user;
    return await this.productsService.handleSearchProductByCashiers(
      search,
      user,
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.productsService.findOne(+id);
  // }

  @ApiOperation({
    summary: 'Update product',
    description: 'Update product information and images',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Nike Air Max 270' },
        slug: { type: 'string', example: 'nike-air-max-270' },
        barcode: { type: 'string', example: '1234567890123' },
        description: { type: 'string', example: 'Comfortable running shoes' },
        costPrice: { type: 'number', example: 100000 },
        sellingPrice: { type: 'number', example: 150000 },
        discount: { type: 'number', example: 10 },
        isActive: { type: 'boolean', example: true },
        brandID: { type: 'number', example: 1 },
        targetGroupID: { type: 'number', example: 1 },
        categoryID: { type: 'number', example: 1 },
        colors: {
          type: 'string',
          example: '[{"colorID": 1, "quantity": 10}]',
          description: 'JSON string of product colors',
        },
        sizes: {
          type: 'string',
          example: '[{"sizeID": 1, "quantity": 10}]',
          description: 'JSON string of product sizes',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product images',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles(new UploadImagesValidationPipe())
    files: Express.Multer.File[],
  ) {
    return await this.productsService.update(+id, updateProductDto, files);
  }

  @ApiOperation({
    summary: 'Delete product(s)',
    description: 'Delete one or many products by ID(s)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        ids: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Product(s) deleted successfully' })
  @ApiResponse({ status: 409, description: 'Please provide either id or ids.' })
  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.productsService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.productsService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }

  @ApiOperation({
    summary: 'Get trending products',
    description: 'Get trending products with pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: '10',
  })
  @ApiResponse({ status: 200, description: 'Trending products retrieved' })
  @Get('trendings')
  async onGetTrendings(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return await this.productsService.handleGetTrendings(page, limit);
  }

  @ApiOperation({
    summary: 'Get product brands',
    description: 'Get all product brands',
  })
  @ApiResponse({ status: 200, description: 'Product brands retrieved' })
  @Get('brands')
  async onGetProductBrands() {
    return await this.productsService.handleGetProductBrands();
  }

  @ApiOperation({
    summary: 'Count products',
    description: 'Get total number of products',
  })
  @ApiResponse({ status: 200, description: 'Product count retrieved' })
  @Get('count')
  async onCountTotalProducts() {
    return await this.productsService.handleCountTotalProducts();
  }

  @ApiOperation({
    summary: 'Get inventory by color and size',
    description:
      'Get inventory for a product by color and size (for staff/manager/ceo)',
  })
  @ApiParam({ name: 'colorID', description: 'Color ID' })
  @ApiParam({ name: 'sizeID', description: 'Size ID' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved' })
  @Get('inventory/:colorID/:sizeID')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER, EnumRoles.STAFF])
  async onGetInventory(
    @Param('colorID') colorID: string,
    @Param('sizeID') sizeID: string,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return await this.productsService.handleGetInventory(
      +colorID,
      +sizeID,
      user,
    );
  }
}
