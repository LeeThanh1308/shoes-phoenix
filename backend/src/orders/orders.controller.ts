import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create order', description: 'Create a new order' })
  @ApiBody({
    type: CreateOrderDto,
    description: 'Order data',
  })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @ApiOperation({
    summary: 'Get revenues',
    description: 'Get revenue statistics for a date range and branch',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date (timestamp)',
    example: '1640995200000',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date (timestamp)',
    example: '1643673600000',
  })
  @ApiQuery({
    name: 'branchID',
    required: true,
    description: 'Branch ID',
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Revenue data retrieved' })
  @Get('revenues')
  async onGetRevenues(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchID') branchID: string,
  ) {
    return await this.ordersService.handleGetRevenues(
      +startDate,
      +endDate,
      +branchID,
    );
  }

  @ApiOperation({
    summary: 'Get product trends',
    description: 'Get trending products for a date range',
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
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date (timestamp)',
    example: '1640995200000',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date (timestamp)',
    example: '1643673600000',
  })
  @ApiResponse({ status: 200, description: 'Product trends retrieved' })
  @Get('trendings')
  async onGetProductTrendings(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.ordersService.handleGetProductTrendings(
      page,
      limit,
      +startDate,
      +endDate,
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.ordersService.findOne(+id);
  // }

  @ApiOperation({
    summary: 'Update order',
    description: 'Update an existing order',
  })
  @ApiParam({ name: 'id', description: 'Order ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @ApiOperation({ summary: 'Delete order', description: 'Delete an order' })
  @ApiParam({ name: 'id', description: 'Order ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
