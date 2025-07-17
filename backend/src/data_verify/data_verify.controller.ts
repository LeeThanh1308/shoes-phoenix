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
import { DataVerifyService } from './data_verify.service';
import { CreateDataVerifyDto } from './dto/create-data_verify.dto';
import { UpdateDataVerifyDto } from './dto/update-data_verify.dto';

@ApiTags('Data Verify')
@Controller('data-verify')
export class DataVerifyController {
  constructor(private readonly dataVerifyService: DataVerifyService) {}

  @ApiOperation({
    summary: 'Create data verify',
    description: 'Create a new data verification record',
  })
  @ApiResponse({ status: 201, description: 'Data verify created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  create(@Body() createDataVerifyDto: CreateDataVerifyDto) {
    return this.dataVerifyService.create(createDataVerifyDto);
  }

  @Get()
  findAll() {
    return this.dataVerifyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataVerifyService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDataVerifyDto: UpdateDataVerifyDto,
  ) {
    return this.dataVerifyService.update(+id, updateDataVerifyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataVerifyService.remove(+id);
  }
}
