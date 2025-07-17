import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  ConflictException,
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
import { StoreItemsService } from './store-items.service';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';

@ApiTags('Store Items')
@Controller('store-items')
export class StoreItemsController {
  constructor(private readonly storeItemsService: StoreItemsService) {}

  @ApiOperation({
    summary: 'Create store item',
    description: 'Create a new store item',
  })
  @ApiResponse({ status: 201, description: 'Store item created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  async create(@Body() createStoreItemDto: CreateStoreItemDto) {
    return await this.storeItemsService.create(createStoreItemDto);
  }

  @ApiOperation({
    summary: 'Get store items',
    description: 'Get all store items or search by keyword',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search store items by keyword',
  })
  @ApiResponse({
    status: 200,
    description: 'Store items retrieved successfully',
  })
  @Get()
  async findAll(@Query('search') search: string) {
    if (search) return await this.storeItemsService.searchByKeyword(search);
    return await this.storeItemsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.storeItemsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStoreItemDto: UpdateStoreItemDto,
  ) {
    return await this.storeItemsService.update(+id, updateStoreItemDto);
  }

  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.storeItemsService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.storeItemsService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}
