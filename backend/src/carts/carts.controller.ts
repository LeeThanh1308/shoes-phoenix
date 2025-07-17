import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
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
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RequestWithUser } from 'src/common/types/request-with-user';

@ApiTags('Carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @ApiOperation({
    summary: 'Add to cart',
    description: 'Add item to user cart',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() req: RequestWithUser,
    @Body() createCartDto: CreateCartDto,
  ) {
    return await this.cartsService.create(createCartDto, req.user);
  }

  @Post('cashiers')
  @UseGuards(AuthGuard)
  async onCreateCashiersCarts(
    @Req() req: RequestWithUser,
    @Body() createCartDto: CreateCartDto,
  ) {
    return await this.cartsService.handleCreateCashiersCarts(
      createCartDto,
      req.user,
    );
  }

  @Get('cashiers')
  @UseGuards(AuthGuard)
  async onGetCashiersCarts(@Req() req: RequestWithUser) {
    return await this.cartsService.handleGetCashiersCarts(req.user);
  }

  @ApiOperation({
    summary: 'Get my cart',
    description: 'Get current user cart items',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Cart items retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  @UseGuards(AuthGuard)
  async onGetMyCarts(@Req() req: RequestWithUser) {
    return await this.cartsService.handleGetMyCarts(req.user);
  }

  @Get()
  async findAll(
    @Body()
    body: {
      productId: number;
      colorId: number;
      sizeId: number;
      inputQuantity: number;
    },
  ) {
    const { productId, colorId, sizeId, inputQuantity } = body;
    return await this.cartsService.checkStockAvailability(
      productId,
      colorId,
      sizeId,
      inputQuantity,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return await this.cartsService.update(+id, updateCartDto, req.user);
  }

  @Delete()
  @UseGuards(AuthGuard)
  async remove(
    @Req() req: RequestWithUser,
    @Body() data: { id: string; ids: number[]; clears: boolean },
  ) {
    if (data.id) {
      return await this.cartsService.removeOne(+data.id, req.user);
    }
    if (data.clears) {
      return await this.cartsService.handleClearsCarts(req.user);
    }
    if (data.ids) {
      return await this.cartsService.removeMany(data.ids, req.user);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}
