import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { UseGuards } from '@nestjs/common';
import { AuthSocketGuard } from 'src/guards/authSocket.guard';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
@UseGuards(AuthSocketGuard)
export class PaymentsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly paymentsService: PaymentsService) {}

  @SubscribeMessage('handleCreatePayment')
  create(
    @MessageBody() createPaymentDto: CreatePaymentDto,
    @ConnectedSocket() client: any,
  ) {
    this.server.emit('onCreatePayment', createPaymentDto);
    return createPaymentDto;
    return this.paymentsService.create(createPaymentDto);
  }

  @SubscribeMessage('joinCreateOrder')
  handleJoinCreateOrder(@ConnectedSocket() client: Socket & { userID: any }) {
    client.join(client.userID);
    return { message: 'Join room success' };
  }

  @SubscribeMessage('sendTransactionClosed')
  async handleTransactionClosed(
    @MessageBody() data: { orderCode: number },
    @ConnectedSocket() client: Socket & { userID: any },
  ) {
    await this.paymentsService.handleTransactionCancelled(data.orderCode);
    client.to(client.userID).emit('newOrder', null);
  }
}
