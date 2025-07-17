import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  HttpException,
  UseGuards,
  Query,
  Headers,
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
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CartsService } from 'src/carts/carts.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Response } from 'express';
import Handlebars from 'handlebars';
import * as fs from 'fs';
import { PaymentsService } from './payments.service';
import { Accounts } from 'src/accounts/entities/account.entity';
import { RequestWithUser } from 'src/common/types/request-with-user';
import { UserRoles } from 'src/guards/roles.decorator';
import { EnumRoles } from 'src/guards/user-role.enum';
import { PaymentsGateway } from './payments.gateway';
import { OrderPaymentStatus } from './types/enum/status-payment.enum';
import { CreatePaymentCashierDto } from './dto/create-payment.cashier';
@ApiTags('Payments')
@Controller('payment')
export class PaymentsController {
  constructor(
    private readonly paymentsGateway: PaymentsGateway,
    private readonly paymentService: PaymentsService,
    private readonly cartService: CartsService,
  ) {}

  @ApiOperation({
    summary: 'Create payment',
    description: 'Create a new payment',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @UseGuards(AuthGuard)
  async onCreatedDataPayment(
    @Req() req: RequestWithUser | any,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    const user = req.user;
    const data = await this.paymentService.handleCreateDataPayment(
      user.id,
      createPaymentDto,
    );
    this.paymentsGateway.server.emit('onCreatePayment', data);
    return data;
  }

  @ApiOperation({
    summary: 'Update payment status by order code',
    description: 'Update payment status for a given order code',
  })
  @ApiParam({ name: 'orderCode', description: 'Order code' })
  @ApiResponse({ status: 200, description: 'Payment status updated' })
  @Post('orders/:orderCode')
  async onUpdateStatusPayment(@Param('orderCode') orderCode: string) {
    return await this.paymentService.handleUpdateStatusPayment(+orderCode);
  }

  @ApiOperation({
    summary: 'Check out status payment by cashier',
    description: 'Check out status payment for an order by cashier',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'orderCode', description: 'Order code' })
  @ApiResponse({ status: 200, description: 'Checkout status retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('orders/:orderCode/checkout')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER, EnumRoles.STAFF])
  async onCheckOutStatusPaymentByCashier(
    @Req() req: RequestWithUser,
    @Param('orderCode') orderCode: string,
  ) {
    return await this.paymentService.handleCheckOutStatusPaymentByCashier(
      +orderCode,
      req.user.id,
      this.paymentsGateway,
    );
  }

  @ApiOperation({
    summary: 'Handle payment webhook',
    description: 'Handle webhook callback from payment gateway',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { orderCode: { type: 'number' }, status: { type: 'string' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  @Post('webhook')
  handleWebhook(@Body() body: any, @Headers('x-signature') signature: string) {
    console.log(
      'Calling............................................................................................................',
    );
    const isValid = this.paymentService.verifyPayOSWebhook(body);
    console.log(isValid);
    // ✅ Hợp lệ rồi → xử lý đơn hàng
    const { orderCode, status } = body;

    if (status === 'PAID') {
      // TODO: Cập nhật trạng thái đơn hàng trong DB
      console.log(`✅ Đơn ${orderCode} đã thanh toán thành công`);
    } else if (status === 'CANCELLED') {
      console.log(`❌ Đơn ${orderCode} đã bị hủy`);
    }

    return { received: true };
  }

  @ApiOperation({
    summary: 'Create payment by cashier',
    description: 'Create a new payment by cashier',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('cashier')
  @UseGuards(AuthGuard)
  async onCreatedDataPaymentCashier(
    @Req() req: RequestWithUser | any,
    @Body() createPaymentDto: CreatePaymentCashierDto,
  ) {
    const user = req.user;
    const data = await this.paymentService.handleCreatedDataPaymentCashier(
      user.id,
      createPaymentDto,
    );
    if (createPaymentDto.paymentMethod === 'transfer') {
      this.paymentsGateway.server.to(user.id).emit('newOrder', data);
    }
    return data;
  }

  @ApiOperation({
    summary: 'Get payment status enum',
    description: 'Get all possible payment status values',
  })
  @ApiResponse({ status: 200, description: 'Payment status enum' })
  @Get('product-status')
  async onGetProductStatus() {
    return OrderPaymentStatus;
  }

  @ApiOperation({
    summary: 'Get my orders',
    description: 'Get current user orders',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User orders retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('orders')
  @UseGuards(AuthGuard)
  async onGetMyOrders(@Req() req: RequestWithUser) {
    const user = req.user;
    return await this.paymentService.handleGetMyOrders(user);
  }

  @ApiOperation({
    summary: 'Get my order detail',
    description: 'Get detail of a specific order for current user',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order detail retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('orders/:id')
  @UseGuards(AuthGuard)
  async onGetMyDetailOrder(
    @Req() req: RequestWithUser,
    @Param('id') id: number,
  ) {
    const user = req.user;
    return await this.paymentService.handleGetMyDetailOrder(user, id);
  }

  @ApiOperation({
    summary: 'Get admin orders',
    description: 'Get all orders for admin/manager/staff',
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'filter', required: false, description: 'Filter string' })
  @ApiResponse({ status: 200, description: 'Admin orders retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('admin/orders')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER, EnumRoles.STAFF])
  async onGetOrdersAdmin(@Query('filter') filter: string) {
    return await this.paymentService.handleGetOrdersAdmin(filter);
  }

  @ApiOperation({
    summary: 'Update admin orders',
    description: 'Update orders for admin/manager/staff',
  })
  @ApiBearerAuth()
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, description: 'Orders updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('admin/orders')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER, EnumRoles.STAFF])
  async onUpdatedOrdersAdmin(@Body() updatePaymentDto: UpdatePaymentDto) {
    return await this.paymentService.handleUpdatedOrdersAdmin(updatePaymentDto);
  }

  @ApiOperation({
    summary: 'Update payment by ID',
    description: 'Update payment information by ID',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, description: 'Payment updated' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @ApiOperation({
    summary: 'Delete payment by ID',
    description: 'Delete payment by ID',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment deleted' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }

  @ApiOperation({
    summary: 'Get orders by branch',
    description: 'Get all orders for a specific branch',
  })
  @ApiParam({ name: 'id', description: 'Branch ID' })
  @ApiResponse({ status: 200, description: 'Orders for branch retrieved' })
  @Get('orders/branch/:id')
  async onGetOrderBranch(@Param('id') id: number) {
    return await this.paymentService.handleGetOrderBranch(id);
  }
}
