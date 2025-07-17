import * as bodyParser from 'body-parser';

import {
  BadRequestException,
  ConflictException,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({
    origin: true,
    methods: ['*'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const handleFormatErrorChildren = (array: any) =>
          array.reduce((acc, err) => {
            if (err.constraints) {
              acc.push(Object.values(err.constraints)[0]); // Chỉ lấy lỗi đầu tiên nếu có
            }
            if (Array.isArray(err.children) && err.children?.length > 0) {
              acc.push(handleFormatErrorChildren(err.children));
            }
            return acc;
          }, []);
        const formattedErrors = errors.reduce(
          (acc, err) => {
            if (err.constraints) {
              acc[err.property] = Object.values(err.constraints)[0]; // Chỉ lấy lỗi đầu tiên nếu có
            }
            if (Array.isArray(err.children) && err.children?.length > 0) {
              acc[err.property] = handleFormatErrorChildren(err.children);
            }
            return acc;
          },
          {} as Record<string, string>,
        );

        return new ConflictException({
          validators: formattedErrors,
        });
      },
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Store Shoes API')
    .setDescription('API documentation for Store Shoes backend application')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Accounts', 'User account management endpoints')
    .addTag('Products', 'Product management endpoints')
    .addTag('Orders', 'Order management endpoints')
    .addTag('Carts', 'Shopping cart endpoints')
    .addTag('Categories', 'Product category management endpoints')
    .addTag('Brands', 'Product brand management endpoints')
    .addTag('Branches', 'Store branch management endpoints')
    .addTag('Warehouses', 'Warehouse and inventory management endpoints')
    .addTag('Payments', 'Payment processing endpoints')
    .addTag('Blogs', 'Blog management endpoints')
    .addTag('Comments', 'Comment management endpoints')
    .addTag('Likes', 'Like management endpoints')
    .addTag('Sliders', 'Slider management endpoints')
    .addTag('Stores', 'Store management endpoints')
    .addTag('Target Groups', 'Target group management endpoints')
    .addTag('Roles', 'Role management endpoints')
    .addTag('Files', 'File upload endpoints')
    .addTag('Verifications', 'Verification endpoints')
    .addTag('Data Verify', 'Data verification endpoints')
    .addTag('Replies', 'Reply management endpoints')
    .addTag('Product Colors', 'Product color management endpoints')
    .addTag('Product Sizes', 'Product size management endpoints')
    .addTag('Product Images', 'Product image management endpoints')
    .addTag('Store Items', 'Store item management endpoints')
    .addTag('Temp Orders', 'Temporary order management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(port, () => {
    Logger.log(`Listening on http://localhost:${port}`);
    Logger.log(
      `Swagger documentation available at http://localhost:${port}/api-docs`,
    );
  });
}
bootstrap();
