import * as crypto from 'crypto';
import * as querystring from 'qs';

import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, IsNull, MoreThan, Not, Repository } from 'typeorm';

import { CartsService } from 'src/carts/carts.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Order } from 'src/orders/entities/order.entity';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { messages } from './types/interfaces/message.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { StoreItem } from 'src/store-items/entities/store-item.entity';
import { TempOrder } from 'src/temp-orders/entities/temp-order.entity';
import { MyCartsResponse } from 'src/carts/types/my-carts-response.type';
import {
  OrderPaymentMethod,
  OrderPaymentStatus,
  PaymentStatusKey,
  PaymentStatusVI,
} from './types/enum/status-payment.enum';
import { Accounts } from 'src/accounts/entities/account.entity';
import { generateMessage } from 'src/common/messages/index.messages';
import moment from 'moment';
import { Branch } from 'src/branches/entities/branch.entity';
import PayOS from '@payos/node';
import { PaymentsGateway } from './payments.gateway';
import { Cart } from 'src/carts/entities/cart.entity';

@Injectable()
export class PaymentsService {
  private readonly clientId: string = process.env.PAYOS_CLIENT_ID!;
  private readonly apiKey: string = process.env.PAYOS_API_KEY!;
  private readonly checksumKey: string = process.env.PAYOS_CHECKSUM_KEY!;
  private readonly domainApp: string = process.env.DOMAIN!;
  private readonly storeItemsRepository: Repository<StoreItem>;
  private readonly tempOrderRepository: Repository<TempOrder>;
  private readonly orderRepository: Repository<Order>;
  private readonly payos: PayOS = new PayOS(
    this.clientId,
    this.apiKey,
    this.checksumKey,
  );
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private readonly dataSource: DataSource,
    private readonly cartService: CartsService,
  ) {
    this.storeItemsRepository = this.dataSource.getRepository(StoreItem);
    this.tempOrderRepository = this.dataSource.getRepository(TempOrder);
    this.orderRepository = this.dataSource.getRepository(Order);
    this.payos = new PayOS(this.clientId, this.apiKey, this.checksumKey);
  }

  async sortObject(obj: { [key: string]: any }) {
    const sorted: { [key: string]: string } = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
      sorted[encodeURIComponent(key)] = encodeURIComponent(obj[key]).replace(
        /%20/g,
        '+',
      );
    }

    return sorted;
  }

  async verifyPayOSWebhook(webhookData: any) {
    try {
      // Sử dụng hàm mặc định của PayOS SDK
      const isValid = this.payos.verifyPaymentWebhookData(webhookData);
      console.log(isValid);
      if (isValid) {
        // Giao dịch hợp lệ, xử lý logic tiếp theo
        console.log('Webhook verified successfully');
        return { success: true, message: 'Payment verified' };
      } else {
        // Giao dịch không hợp lệ
        throw new BadRequestException('Invalid webhook data');
      }
    } catch (error) {
      throw new BadRequestException('Webhook verification failed');
    }
  }

  async handleUpdateStatusPayment(orderId: number) {
    try {
      const orderInfo = await this.payos.getPaymentLinkInformation(orderId);
      if (!orderInfo) {
        throw new NotFoundException({
          messages: 'Không tìm thấy thông tin đơn hàng.',
        });
      }
      const findPaymentOrder = await this.paymentsRepository.findOne({
        where: {
          orderCode: orderId,
          price: orderInfo.amount,
        },
      });
      if (!findPaymentOrder) {
        throw new NotFoundException({
          messages: 'Đơn hàng không tồn tại trên hệ thống.',
        });
      }
      findPaymentOrder.paymentStatus =
        PaymentStatusKey?.[orderInfo.status] ?? findPaymentOrder.paymentStatus;
      if (orderInfo.status == PaymentStatusKey.PAID) {
        findPaymentOrder.orderStatus = OrderPaymentStatus.UNPACKED;
      }
      await this.paymentsRepository.save(findPaymentOrder);
      return { orderInfo, orderID: findPaymentOrder.id };
    } catch (error) {
      throw error;
    }
  }

  async handleCheckOutStatusPaymentByCashier(
    orderId: number,
    userID: string,
    paymentsGateway: PaymentsGateway,
  ) {
    if (orderId) {
      const orderInfo = await this.payos.getPaymentLinkInformation(orderId);
      paymentsGateway.server.to(userID).emit('transactionStatus', orderInfo);
      if (orderInfo.status == PaymentStatusKey.PAID) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
          const findPayment = await this.paymentsRepository.findOne({
            relations: {
              tempOrders: {
                account: true,
                staff: true,
                storeItem: true,
                size: true,
                color: true,
                product: true,
                payment: true,
              },
            },
            where: {
              orderCode: orderInfo.orderCode,
              price: orderInfo.amount,
              staff: {
                id: userID,
              },
            },
          });
          if (!findPayment?.tempOrders) {
            throw new NotFoundException({
              message: 'TempOrders không được để trống.',
            });
          }
          const removeId = await Promise.all(
            findPayment?.tempOrders.map((_) => {
              const { id, ...props } = _;
              return props;
            }),
          );
          const createOrders = this.orderRepository.create(removeId);
          await queryRunner.manager.save(Order, createOrders);
          await queryRunner.manager.save(Payment, {
            ...findPayment,
            paymentStatus: PaymentStatusKey?.[orderInfo?.status],
            orderStatus: OrderPaymentStatus.PAID_IN_STORE,
            orderCode: undefined,
          });
          const findCarts = await queryRunner.manager.find(Cart, {
            where: {
              cashier: {
                id: userID,
              },
            },
          });
          await queryRunner.manager.remove(Cart, findCarts);
          await queryRunner.commitTransaction();
          return {
            ...orderInfo,
            message: PaymentStatusVI?.[orderInfo?.status],
          };
        } catch (error) {
          queryRunner.rollbackTransaction();
          throw error;
        } finally {
          queryRunner.release();
        }
      } else {
        return orderInfo;
      }
    }
    return;
  }

  async handleTransactionCancelled(orderID: number) {
    const isPaymentExist = await this.paymentsRepository.findOne({
      where: {
        orderCode: orderID,
        paymentStatus: Not(PaymentStatusKey.PAID),
      },
    });
    if (isPaymentExist?.id && orderID) {
      return await this.payos.cancelPaymentLink(orderID);
    }
    return;
  }

  async handleCreateBankTransferOrder(
    amount: number,
    items: Array<{ name: string; quantity: number; price: number }>,
    cancelUrl: string,
    returnUrl: string,
  ) {
    try {
      const body = {
        orderCode: Number(String(new Date().getTime()).slice(-6)),
        amount: Math.ceil(amount),
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        description: 'Thanh toán',
        cancelUrl,
        returnUrl,
      };

      const paymentLinkRes = await this.payos.createPaymentLink(body);
      return {
        bin: paymentLinkRes.bin,
        checkoutUrl: paymentLinkRes.checkoutUrl,
        accountNumber: paymentLinkRes.accountNumber,
        accountName: paymentLinkRes.accountName,
        amount: paymentLinkRes.amount,
        description: paymentLinkRes.description,
        orderCode: paymentLinkRes.orderCode,
        qrCode: paymentLinkRes.qrCode,
      };
    } catch (e) {
      throw e;
    }
  }

  async handleCreateDataPayment(
    userID: string,
    createPaymentDto: CreatePaymentDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const carts: MyCartsResponse = await this.cartService.handleGetMyCarts({
        id: userID,
      });
      if (!carts?.items?.length) {
        throw new BadRequestException({
          messages: 'Giỏ hàng đang trống',
        });
      }
      const createPayment = this.paymentsRepository.create({
        ...createPaymentDto,
        paymentMethod:
          createPaymentDto.paymentMethod == 'transfer'
            ? OrderPaymentMethod.TRANSFER
            : OrderPaymentMethod.CASH,
      });
      const tempOrders: TempOrder[] = await Promise.all(
        carts?.items?.map(async (_) => {
          const {
            id: storeId,
            sold,
            inventory,
          } = await this.cartService.handleFindTotalSold(_.color.id, _.size.id);
          if (!storeId || _?.quantity > inventory) {
            throw new ConflictException();
          }
          return this.tempOrderRepository.create({
            name: _.name,
            account: {
              id: userID,
            },
            quantity: _?.quantity,
            totalAmount: Math.ceil(
              _?.sellingPrice * (1 - _?.discount / 100) * _?.quantity,
            ),
            size: {
              id: _.size.id,
            },
            product: {
              id: _?.productId,
            },
            color: { id: _?.color.id },
            storeItem: { id: storeId },
          });
        }),
      );
      if (
        createPaymentDto.paymentMethod == 'transfer' &&
        createPaymentDto?.returnUrl &&
        createPaymentDto?.cancelUrl
      ) {
        const createPaymentLink = await this.handleCreateBankTransferOrder(
          carts.total,
          tempOrders.map((_) => ({
            name: _?.name,
            quantity: _?.quantity,
            price: _?.totalAmount,
          })),
          createPaymentDto?.returnUrl,
          createPaymentDto?.cancelUrl,
        );
        const data = (await queryRunner.manager.save(Payment, {
          ...createPayment,
          orderCode: createPaymentLink.orderCode,
          price: carts.total,
          tempOrders,
          paymentMethod: OrderPaymentMethod.TRANSFER,
          paymentStatus: PaymentStatusKey.PENDING,
          orderStatus: OrderPaymentStatus.CONFIRMED,
          account: {
            id: userID,
          },
        })) as Payment;
        await this.cartService.handleClearsCarts({ id: userID });
        await queryRunner.commitTransaction();
        return { ...createPaymentLink, orderID: data.id };
      } else if (createPaymentDto.paymentMethod == 'cash') {
        const data = await queryRunner.manager.save(Payment, {
          ...createPayment,
          price: carts.total,
          tempOrders,
          paymentMethod: OrderPaymentMethod.CASH,
          orderStatus: OrderPaymentStatus.CONFIRMED,
          account: {
            id: userID,
          },
        });
        await this.cartService.handleClearsCarts({ id: userID });
        await queryRunner.commitTransaction();
        return data;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async handleCreatedDataPaymentCashier(
    userID: string,
    createPaymentDto: CreatePaymentDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const carts: MyCartsResponse =
        await this.cartService.handleGetCashiersCarts({
          id: userID,
        });
      if (!carts?.items?.length) {
        throw new BadRequestException({
          messages: 'Giỏ hàng đang trống',
        });
      }
      const createPayment = this.paymentsRepository.create({
        ...createPaymentDto,
        paymentMethod:
          createPaymentDto.paymentMethod == 'transfer'
            ? OrderPaymentMethod.TRANSFER
            : OrderPaymentMethod.CASH,
      });
      const tempOrders: TempOrder[] = await Promise.all(
        carts?.items?.map(async (_) => {
          const {
            id: storeId,
            sold,
            inventory,
          } = await this.cartService.handleFindTotalSold(_.color.id, _.size.id);
          if (!storeId || _?.quantity > inventory) {
            throw new ConflictException({
              message: !storeId
                ? 'StoreId không hợp lệ'
                : 'Số lượng không hợp lệ.',
            });
          }
          return this.tempOrderRepository.create({
            name: _.name,
            staff: {
              id: userID,
            },
            quantity: _?.quantity,
            totalAmount:
              _?.sellingPrice * (1 - _?.discount / 100) * _?.quantity,
            size: {
              id: _.size.id,
            },
            product: {
              id: _?.productId,
            },
            color: { id: _?.color.id },
            storeItem: { id: storeId },
          });
        }),
      );
      if (
        createPaymentDto.paymentMethod == 'transfer' &&
        createPaymentDto?.returnUrl &&
        createPaymentDto?.cancelUrl
      ) {
        const createPaymentLink = await this.handleCreateBankTransferOrder(
          carts.total,
          tempOrders.map((_) => ({
            name: _?.name,
            quantity: _?.quantity,
            price: _?.totalAmount,
          })),
          createPaymentDto?.returnUrl,
          createPaymentDto?.cancelUrl,
        );
        const findPaymentPrev = await this.paymentsRepository.find({
          where: {
            staff: {
              id: userID,
            },
            paymentStatus: PaymentStatusKey.PENDING,
            orderStatus: OrderPaymentStatus.PENDING_IN_STORE,
          },
        });
        await queryRunner.manager.remove(Payment, findPaymentPrev);
        const data = (await queryRunner.manager.save(Payment, {
          ...createPayment,
          orderCode: createPaymentLink.orderCode,
          price: carts.total,
          tempOrders,
          paymentMethod: OrderPaymentMethod.TRANSFER,
          paymentStatus: PaymentStatusKey.PENDING,
          orderStatus: OrderPaymentStatus.PENDING_IN_STORE,
          staff: {
            id: userID,
          },
        })) as Payment;
        await queryRunner.commitTransaction();
        return { ...createPaymentLink, carts };
      } else if (createPaymentDto.paymentMethod == 'cash') {
        const data = (await queryRunner.manager.save(Payment, {
          ...createPayment,
          price: carts.total,
          tempOrders,
          paymentMethod: OrderPaymentMethod.CASH,
          orderStatus: OrderPaymentStatus.PAID_IN_STORE,
          staff: {
            id: userID,
          },
        })) as Payment;
        const removeId = await Promise.all(
          data.tempOrders.map((_) => {
            const { id, ...props } = _;
            return props;
          }),
        );
        const createOrders = this.orderRepository.create(removeId);
        await queryRunner.manager.save(Order, createOrders);
        await this.cartService.handleClearsCarts({ id: userID });
        await queryRunner.commitTransaction();
        return {
          ...generateMessage('Đơn hàng', 'updated', true),
          data,
        };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async handleGetMyOrders(account: Partial<Accounts>) {
    return await this.paymentsRepository.find({
      relations: {
        tempOrders: {
          product: true,
          size: true,
          color: true,
        },
      },
      where: {
        account: {
          id: account.id,
        },
      },
      select: {
        id: true,
        paymentMethod: true,
        paymentStatus: true,
        orderStatus: true,
        price: true,
        receiver: true,
        phone: true,
        address: true,
        note: true,
        tempOrders: {
          name: true,
          quantity: true,
          totalAmount: true,
          size: {
            type: true,
          },
          color: {
            name: true,
          },
          product: {
            name: true,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async handleGetMyDetailOrder(account: Partial<Accounts>, id: number) {
    return await this.paymentsRepository.findOne({
      relations: {
        tempOrders: {
          product: {
            images: true,
          },
          size: true,
          color: true,
        },
      },
      where: {
        id: id,
        account: {
          id: account.id,
        },
      },
      // select: {
      //   id: true,
      //   paymentMethod: true,
      //   paymentStatus: true,
      //   price: true,
      //   receiver: true,
      //   phone: true,
      //   address: true,
      //   note: true,
      //   tempOrders: {
      //     name: true,
      //     quantity: true,
      //     totalAmount: true,
      //     size: {
      //       type: true,
      //     },
      //     color: {
      //       name: true,
      //     },
      //     product: {
      //       name: true,
      //     },
      //   },
      // },
    });
  }

  async handleGetOrdersAdmin(filter: string) {
    const whereConditions: any = {};
    const orderBy: any = {
      createdAt: 'DESC',
    };
    if (filter == 'orders') {
      whereConditions.orderStatus = OrderPaymentStatus.UNPACKED;
      orderBy.createdAt = 'ASC';
    }
    // if (filter == 'history') {
    //   whereConditions.paymentStatus = OrderPaymentStatus.DELIVERED;
    // }
    return await this.paymentsRepository.find({
      relations: {
        tempOrders: {
          product: true,
          size: true,
          color: true,
        },
      },
      where: whereConditions,
      select: {
        id: true,
        paymentMethod: true,
        paymentStatus: true,
        orderStatus: true,
        price: true,
        receiver: true,
        phone: true,
        address: true,
        note: true,
        createdAt: true,
        tempOrders: {
          name: true,
          quantity: true,
          totalAmount: true,
          size: {
            type: true,
          },
          color: {
            name: true,
          },
          product: {
            name: true,
          },
        },
      },
      order: orderBy,
    });
  }

  async handleUpdatedOrdersAdmin(updatePaymentDto: UpdatePaymentDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findPaymentOrders = await this.paymentsRepository.findOne({
        relations: {
          tempOrders: {
            product: true,
            size: true,
            color: true,
            account: true,
            storeItem: true,
            payment: true,
          },
        },
        where: {
          id: updatePaymentDto.id,
        },
        select: {
          id: true,
          paymentMethod: true,
          price: true,
          receiver: true,
          phone: true,
          address: true,
          note: true,
          tempOrders: {
            id: true,
            name: true,
            quantity: true,
            totalAmount: true,
            storeItem: {
              id: true,
            },
            account: {
              id: true,
            },
            size: {
              id: true,
            },
            color: {
              id: true,
            },
            product: {
              id: true,
            },
          },
        },
      });
      if (!findPaymentOrders) {
        throw new NotFoundException();
      }
      const { tempOrders, ...props } = findPaymentOrders;
      const updated = await queryRunner.manager.save(Payment, {
        ...props,
        orderStatus: OrderPaymentStatus?.[updatePaymentDto.orderStatus],
      });
      if (updatePaymentDto.orderStatus == 'DELIVERED') {
        const removeId = await Promise.all(
          tempOrders.map((_) => {
            const { id, ...props } = _;
            return props;
          }),
        );
        const createOrders = this.orderRepository.create(removeId);
        const data = await queryRunner.manager.save(Order, createOrders);
        await queryRunner.commitTransaction();
        return {
          ...generateMessage('Đơn hàng', 'updated', true),
          data,
          updated,
        };
      } else {
        const findOrderRollback = await this.orderRepository.find({
          where: {
            payment: {
              id: findPaymentOrders.id,
            },
          },
        });
        await queryRunner.manager.remove(Order, findOrderRollback);
        await queryRunner.commitTransaction();
        return {
          ...generateMessage('Đơn hàng', 'updated', true),
          updated,
        };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

  async handleGetOrderBranch(id: number) {
    const data = await this.paymentsRepository.findOne({
      relations: {
        tempOrders: {
          product: true,
        },
      },
      where: {
        id,
      },
    });

    return data;
  }
}
