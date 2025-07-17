import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { TempOrdersService } from './temp-orders.service';
import { CreateTempOrderDto } from './dto/create-temp-order.dto';
import { UpdateTempOrderDto } from './dto/update-temp-order.dto';

@ApiTags('Temp Orders')
@Controller('temp-orders')
export class TempOrdersController {
  constructor(private readonly tempOrdersService: TempOrdersService) {}

  @ApiOperation({
    summary: 'Create temp order',
    description: 'Create a new temporary order',
  })
  @ApiResponse({ status: 201, description: 'Temp order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createTempOrderDto: CreateTempOrderDto) {
    return this.tempOrdersService.create(createTempOrderDto);
  }

  @Get()
  findAll() {
    return this.tempOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tempOrdersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTempOrderDto: UpdateTempOrderDto,
  ) {
    return this.tempOrdersService.update(+id, updateTempOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tempOrdersService.remove(+id);
  }
}
