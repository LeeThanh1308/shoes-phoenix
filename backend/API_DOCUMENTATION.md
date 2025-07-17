# Store Shoes API Documentation

## Overview

This is the API documentation for the Store Shoes backend application built with NestJS. The application provides a comprehensive e-commerce platform for managing shoes, orders, users, and inventory.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (create a `.env` file):

   ```env
   PORT=3000
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USERNAME=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=store_shoes
   JWT_SECRET=your_jwt_secret
   JWT_AT_EXP_SECOND=3600
   JWT_RT_EXP_SECOND=86400
   ```

4. Run the application:

   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run start:prod
   ```

## API Documentation

### Swagger UI

Once the application is running, you can access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

The Swagger UI provides:

- Interactive API testing
- Request/response examples
- Authentication documentation
- Schema definitions

### Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication via Bearer token.

**Login Flow:**

1. POST `/accounts/login` - Get access token
2. Include `Authorization: Bearer <token>` in subsequent requests
3. Use POST `/accounts/refresh` to refresh expired tokens

## API Endpoints Overview

### Authentication & Accounts

- **POST** `/accounts/login` - User login
- **POST** `/accounts/signup` - User registration
- **POST** `/accounts/refresh` - Refresh access token
- **GET** `/accounts/user` - Get current user info
- **PATCH** `/accounts/user` - Update user profile
- **POST** `/accounts/uploads` - Upload avatar
- **GET** `/accounts/count` - Get total accounts count

### Products

- **GET** `/products` - Get all products (with search/filter options)
- **POST** `/products` - Create new product
- **PATCH** `/products/:id` - Update product
- **DELETE** `/products` - Delete products
- **GET** `/products/trendings` - Get trending products
- **GET** `/products/brands` - Get product brands
- **GET** `/products/count` - Get total products count
- **GET** `/products/solds` - Get sold products count

### Product Management

- **GET** `/product-colors` - Get all product colors
- **POST** `/product-colors` - Create product color
- **GET** `/product-sizes` - Get all product sizes
- **POST** `/product-sizes` - Create product size
- **GET** `/product-images` - Get all product images
- **POST** `/product-images` - Create product image

### Orders

- **POST** `/orders` - Create new order
- **PATCH** `/orders/:id` - Update order
- **DELETE** `/orders/:id` - Delete order
- **GET** `/orders/revenues` - Get revenue statistics
- **GET** `/orders/trendings` - Get product trends

### Shopping Cart

- **POST** `/carts` - Add item to cart
- **GET** `/carts/me` - Get user cart
- **PATCH** `/carts/:id` - Update cart item
- **DELETE** `/carts` - Remove items from cart

### Categories & Brands

- **GET** `/categories` - Get all categories
- **POST** `/categories` - Create category
- **GET** `/categories/count` - Get total categories count
- **GET** `/product-brands` - Get all brands
- **POST** `/product-brands` - Create brand

### Branches & Warehouses

- **GET** `/branches` - Get all branches
- **POST** `/branches` - Create branch
- **GET** `/branches/count` - Get total branches count
- **GET** `/warehouses` - Get all warehouses
- **POST** `/warehouses` - Create warehouse
- **POST** `/warehouses/receive` - Receive stock
- **POST** `/warehouses/transfer` - Transfer stock

### Payments

- **POST** `/payment` - Process payment
- **POST** `/payment/cashier` - Process cashier payment
- **GET** `/payment/orders` - Get user orders
- **GET** `/payment/admin/orders` - Get admin orders
- **PATCH** `/payment/admin/orders` - Update admin orders

### Blogs & Comments

- **GET** `/blogs` - Get all blogs
- **POST** `/blogs` - Create blog
- **GET** `/blogs/me/posts` - Get user blog posts
- **PATCH** `/blogs/me/posts/:id` - Update user blog post
- **DELETE** `/blogs/me/posts/:id` - Delete user blog post
- **GET** `/comments` - Get all comments
- **POST** `/comments` - Create comment

### Likes & Replies

- **POST** `/likes` - Create like
- **GET** `/likes/count` - Get like count
- **POST** `/replies` - Create reply
- **GET** `/replies` - Get all replies

### User Management

- **GET** `/roles` - Get all roles
- **POST** `/roles` - Create role
- **GET** `/roles/my-role-set` - Get user role set
- **GET** `/target-groups` - Get target groups
- **POST** `/target-groups` - Create target group

### Stores & Store Items

- **GET** `/stores` - Get all stores
- **POST** `/stores` - Create store
- **GET** `/store-items` - Get all store items
- **POST** `/store-items` - Create store item

### Content Management

- **GET** `/sliders` - Get all sliders
- **POST** `/sliders` - Create slider
- **GET** `/files/:folder/:name` - Get file

### Verification

- **POST** `/verifications/accounts/:id/:code` - Verify account
- **GET** `/verifications/refresh/:id` - Refresh verification code
- **GET** `/verifications/checkVerify/:id` - Check verification status

### Temporary Orders

- **GET** `/temp-orders` - Get all temporary orders
- **POST** `/temp-orders` - Create temporary order
- **PATCH** `/temp-orders/:id` - Update temporary order
- **DELETE** `/temp-orders/:id` - Delete temporary order

### Data Verification

- **GET** `/data-verify` - Get all data verification records
- **POST** `/data-verify` - Create data verification record
- **PATCH** `/data-verify/:id` - Update data verification record
- **DELETE** `/data-verify/:id` - Delete data verification record

## Data Models

### User Account

```typescript
{
  id: string;
  fullname: string;
  email: string;
  phone: string;
  gender: 'x' | 'y' | 'z';
  birthday: Date;
  avatar?: string;
  ban: boolean;
}
```

### Product

```typescript
{
  id: number;
  name: string;
  slug: string;
  barcode: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  discount: number;
  isActive: boolean;
  brandID: number;
  targetGroupID: number;
  categoryID: number;
  colors: ProductColor[];
  sizes: ProductSize[];
}
```

### Order

```typescript
{
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  createdAt: Date;
}
```

## Error Handling

The API returns standard HTTP status codes:

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **500** - Internal Server Error

Error responses include:

```json
{
  "message": "Error description",
  "validators": {
    "field": "validation error message"
  }
}
```

## File Upload

The API supports file uploads for:

- User avatars (`/accounts/uploads`)
- Product images (`/products`)

Files are stored in the `uploads/` directory and served statically.

## Pagination

Many list endpoints support pagination:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

## Search & Filtering

Products support various search and filter options:

- `search` - Keyword search
- `id` - Get by ID
- `slug` - Get by slug
- Filter by category, brand, price range, etc.

## Rate Limiting

The API implements rate limiting to prevent abuse. Please respect the limits and implement appropriate retry logic in your applications.

## WebSocket Support

The application also supports WebSocket connections for real-time features like:

- Live chat
- Order status updates
- Inventory notifications

## Development

### Running Tests

```bash
npm run test
npm run test:e2e
```

### Code Formatting

```bash
npm run format
npm run lint
```

## Support

For API support or questions, please refer to the Swagger documentation or contact the development team.

## Version History

- **v1.0** - Initial release with core e-commerce functionality
