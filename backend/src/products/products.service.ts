import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import {
  Between,
  DataSource,
  In,
  IsNull,
  Like,
  Not,
  Repository,
} from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { ProductBrand } from 'src/product-brands/entities/product-brand.entity';
import { TargetGroup } from 'src/target-groups/entities/target-group.entity';
import { ProductColor } from 'src/product-colors/entities/product-color.entity';
import { convertTextToLike, convertTextToLikeVi } from 'utils';
import { FilesService } from 'src/files/files.service';
import { ProductImage } from 'src/product-images/entities/product-image.entity';
import { generateMessage } from 'src/common/messages/index.messages';
import { FiltersProductDto, SortOrder } from './dto/filters-product.dto';
import { Order } from 'src/orders/entities/order.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { CartsService } from 'src/carts/carts.service';
import { Accounts } from 'src/accounts/entities/account.entity';
import { randomBytes, randomInt } from 'crypto';
import { Roles } from 'src/roles/entities/role.entity';

@Injectable()
export class ProductsService {
  private branchesRepository: Repository<Branch>;
  private categoryRepository: Repository<Category>;
  private brandRepository: Repository<ProductBrand>;
  private targetGroupRepository: Repository<TargetGroup>;
  private colorsRepository: Repository<ProductColor>;
  private imagesRepository: Repository<ProductImage>;
  private ordersRepositoty: Repository<Order>;
  private accountRepository: Repository<Accounts>;
  private readonly folderPath = 'products';
  private readonly messageName = 'Products';
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly filesService: FilesService,
    private readonly dataSource: DataSource,
    private readonly cartsServices: CartsService,
  ) {
    this.categoryRepository = this.dataSource.getRepository(Category);
    this.brandRepository = this.dataSource.getRepository(ProductBrand);
    this.targetGroupRepository = this.dataSource.getRepository(TargetGroup);
    this.colorsRepository = this.dataSource.getRepository(ProductColor);
    this.imagesRepository = this.dataSource.getRepository(ProductImage);
    this.ordersRepositoty = this.dataSource.getRepository(Order);
    this.branchesRepository = this.dataSource.getRepository(Branch);
    this.accountRepository = this.dataSource.getRepository(Accounts);
  }
  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    let fileUrls: string[] = [];
    try {
      const validatorMessage = {};
      // this.filesService.uploadFiles(files, this.folderPath);
      const { brandID, targetGroupID, categoryID, colors, sizes, ...data } =
        createProductDto;
      const findCategoryExists = await this.categoryRepository.findOne({
        where: { id: categoryID },
      });
      const findBrandExists = await this.brandRepository.findOneBy({
        id: brandID,
      });
      const findTargetGroupExists = await this.targetGroupRepository.findOneBy({
        id: targetGroupID,
      });
      const findColorsExists = await this.colorsRepository.find({
        where: {
          id: In(colors.map((_) => _.id)),
        },
        select: ['id'],
      });
      if (!findCategoryExists) {
        validatorMessage['category'] = 'Category not found';
      }
      if (!findBrandExists) {
        validatorMessage['brand'] = 'Brand not found';
      }
      if (!findTargetGroupExists) {
        validatorMessage['targetGroup'] = 'Target group not found';
      }
      if (findColorsExists?.length == 0) {
        validatorMessage['colorIds'] = 'Color not found';
      }
      if (
        !findCategoryExists ||
        !findBrandExists ||
        findColorsExists?.length == 0
      )
        throw new ConflictException({
          validators: validatorMessage,
        });
      fileUrls = await this.filesService.uploadFiles(files, this.folderPath);
      const productImages: ProductImage[] = [];
      await Promise.all(
        colors.map(async (_, index) => {
          const { id, lengImage } = _;
          const result = await Promise.all(
            fileUrls.splice(0, lengImage).map((url) => {
              const productImage = new ProductImage();
              productImage.color = findColorsExists[index];
              productImage.src = url;
              productImages.push(productImage);
              return productImage;
            }),
          );
          return result;
        }),
      );
      const createProduct = this.productRepository.create({
        ...data,
        category: findCategoryExists,
        brand: findBrandExists,
        targetGroup: {
          id: targetGroupID,
        },
        colors: findColorsExists,
        sizes: sizes,
        images: productImages,
      });

      const result = await this.productRepository.save(createProduct);
      return {
        ...generateMessage(this.messageName, 'created', true),
      };
    } catch (error) {
      await this.filesService.deleteFiles(fileUrls);
      throw new HttpException(
        generateMessage(this.messageName, 'created', false),
        error.status || 404,
      );
    }
  }

  async searchByKeyword(keyword: string) {
    let whereID: any = {};
    if (Number(keyword)) {
      whereID.id = +keyword;
    }
    const keywordToLike = Like(convertTextToLike(keyword));
    const results = await this.productRepository.find({
      relations: {
        images: true,
        colors: true,
      },
      where: [
        {
          name: keywordToLike,
        },
        {
          slug: Like(convertTextToLikeVi(keyword)),
        },
        {
          barcode: keywordToLike,
        },
        whereID,
      ],
      take: 10,
    });
    return results.map((_) => {
      return {
        ..._,
        image: _?.images?.[0]?.src,
      };
    });
  }
  async findAll() {
    return await this.productRepository.find({
      relations: {
        images: {
          color: true,
        },
        sizes: true,
        colors: true,
        brand: true,
        targetGroup: true,
        category: true,
      },
    });
  }

  async findOne(id: number) {
    return await this.imagesRepository
      .find({
        select: ['src'],
      })
      .then((data) => data.map((_) => _.src));
  }

  async handleFindTotalSoldProducts() {
    return await this.cartsServices.handleFindTotalSold(28, 187);
  }

  async findProductBySlug(slug: string) {
    let branchWhere: any = {};
    const findProducts = await this.productRepository.findOne({
      relations: {
        images: true,
        colors: true,
        sizes: {
          items: {
            orders: true,
          },
        },
        targetGroup: true,
        brand: true,
        category: true,
      },
      where: {
        slug: Like(convertTextToLike(slug)),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        barcode: true,
        sellingPrice: true,
        discount: true,
        description: true,
        images: true,
        sizes: {
          id: true,
          sellingPrice: true,
          type: true,
          discount: true,
          isActive: true,
          items: {
            id: true,
            quantity: true,
            store: {
              id: true,
            },
            orders: true,
          },
        },
        category: {
          name: true,
        },
      },
    });

    if (findProducts?.items) {
      branchWhere.items = findProducts?.items;
    }

    const colors = await Promise.all(
      findProducts?.colors?.map(async (_) => {
        const findColorsByImage = await this.imagesRepository.find({
          where: {
            product: {
              id: findProducts.id,
            },
            color: {
              id: _?.id,
            },
          },
        });
        const sizes = await Promise.all(
          findProducts?.sizes?.map(async (size) => {
            const total = await this.cartsServices.handleFindTotalSold(
              _.id,
              size.id,
            );
            const findBranch = await this.branchesRepository.find({
              where: {
                stores: {
                  items: {
                    size: {
                      id: size?.id,
                    },
                    color: {
                      id: _?.id,
                    },
                  },
                },
              },
            });
            return {
              ...total,
              ...size,
              branches: findBranch,
            };
          }),
        );
        return {
          ..._,
          sizes,
          images: findColorsByImage,
        };
      }) ?? [],
    );
    const { sizes, ...args } = findProducts ?? {};
    return {
      ...args,
      colors: colors,
    };
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
  ) {
    const validatorMessage = {};
    let fileUrls: string[] = [];
    const productImages: ProductImage[] = [];
    try {
      const {
        brandID,
        targetGroupID,
        categoryID,
        colors = [],
        sizes = [],
        removes,
        ...dataProduct
      } = updateProductDto;
      const findCategoryExists = await this.categoryRepository.findOne({
        where: { id: categoryID },
      });
      const findBrandExists = await this.brandRepository.findOneBy({
        id: brandID,
      });
      const findTargetGroupExists = await this.targetGroupRepository.findOneBy({
        id: targetGroupID,
      });
      const findColorsExists = await this.colorsRepository.find({
        where: {
          id: In(colors.map((_) => _.id)),
        },
        select: ['id'],
      });
      if (!findCategoryExists) {
        validatorMessage['category'] = 'Category not found';
      }
      if (!findBrandExists) {
        validatorMessage['brand'] = 'Brand not found';
      }
      if (!findTargetGroupExists) {
        validatorMessage['targetGroup'] = 'Target group not found';
      }
      if (colors?.length > 0 && findColorsExists?.length == 0) {
        validatorMessage['colorIds'] = 'Color not found';
      }

      if (
        !findCategoryExists ||
        !findBrandExists ||
        (findColorsExists?.length == 0 && colors?.length > 0)
      )
        throw new ConflictException({
          validators: validatorMessage,
        });
      if (files)
        fileUrls = await this.filesService.uploadFiles(files, this.folderPath);

      const createProduct = this.productRepository.create({
        id: id,
        ...dataProduct,
        category: findCategoryExists,
        brand: findBrandExists,
        targetGroup: {
          id: targetGroupID,
        },
        colors: findColorsExists,
        sizes: sizes,
      });

      await Promise.all(
        colors.map(async (_, index) => {
          const { lengImage } = _;
          const result = await Promise.all(
            fileUrls?.splice(0, lengImage).map((url) => {
              const productImage = new ProductImage();
              productImage.color = findColorsExists[index];
              productImage.src = url;
              productImage.product = createProduct;
              productImages.push(productImage);
              return productImage;
            }),
          );
          return result;
        }),
      );
      if (Array.isArray(productImages) && productImages.length > 0) {
        const createProductImage = this.imagesRepository.create(productImages);
        await this.imagesRepository.save(createProductImage);
      }

      if (Array.isArray(removes?.images) && removes?.images?.length > 0) {
        const findImages = await this.imagesRepository.find({
          where: {
            id: In(removes.images),
          },
        });
        await this.imagesRepository.remove(findImages);
        await this.filesService.deleteFiles(findImages.map((_) => _.src));
      }

      return await this.productRepository.save(createProduct);
    } catch (error) {
      await this.filesService.deleteFiles(fileUrls);
      throw new HttpException(
        {
          ...generateMessage(this.messageName, 'updated', false),
          ...error?.response,
        },
        error.status || 404,
      );
    }
  }

  async removeOne(id: number) {
    const findBrand = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: {
        images: true,
      },
      select: ['id'],
    });
    if (!findBrand?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    if (findBrand?.images)
      await this.filesService.deleteFiles(findBrand?.images.map((_) => _.src));
    const result = await this.productRepository.delete({
      id: findBrand?.id,
    });
    return generateMessage(this.messageName, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const products = await this.productRepository.find({
        where: { id: In(ids) },
        relations: {
          images: true,
        },
      });

      if (!products.length)
        return generateMessage(this.messageName, 'deleted', false);

      const imageSrcs = products.flatMap((product) =>
        product.images.map((image) => image?.src),
      );

      await this.filesService.deleteFiles(imageSrcs);

      // Optional: Nếu bạn dùng cascade delete trên image thì không cần xóa images riêng

      // Nếu cần xóa image trước:
      await this.imagesRepository.delete({
        product: In(products.map((p) => p.id)),
      });

      const result = await this.productRepository.delete(ids);

      return generateMessage(this.messageName, 'deleted', !!result.affected);
    } catch (error: any) {
      console.error('RemoveMany Error:', error);
      throw new Error(error?.message || 'Unknown error');
    }
  }

  async searchFilter({
    useFilters,
    sortOrder,
    keyword,
    page = 1,
    limit = 10,
  }: FiltersProductDto) {
    try {
      const whereConditions: any = {
        isActive: true,
        sizes: { isActive: true },
      };
      const whereConditionAND: any = {};
      const keywordToLike = Like(convertTextToLike(keyword ?? ''));
      const {
        colors,
        brands,
        objects,
        categories,
        priceRange,
        object,
        brand,
        category,
      } = useFilters ?? {};
      if (object) {
        whereConditionAND.targetGroup = {
          name: object,
        };
      }
      if (brand) {
        whereConditionAND.brand = {
          name: brand,
        };
      }
      if (category) {
        whereConditionAND.category = {
          name: category,
        };
      }
      // Thêm các điều kiện tùy chọn vào `whereConditions`
      if (priceRange) {
        whereConditions.sellingPrice = Between(priceRange.min, priceRange.max);
      }
      if (brands) {
        whereConditions.brand = { name: In(brands) };
      }
      if (colors) {
        whereConditions.colors = { name: In(colors) };
      }
      if (objects) {
        whereConditions.targetGroup = { name: In(objects) };
      }

      if (Array.isArray(categories) && categories?.length > 0) {
        whereConditions.category = {
          name: In(categories),
        };
      }
      let orderCondition: any = {};
      switch (sortOrder) {
        case SortOrder.NEWEST:
          orderCondition = { createdAt: 'DESC' }; // Giả sử bạn có trường `createdAt`
          break;
        case SortOrder.OLDEST:
          orderCondition = { createdAt: 'ASC' };
          break;
        case SortOrder.PRICE_ASC:
          orderCondition = { sellingPrice: 'ASC' }; // Giả sử bạn có trường `sellingPrice`
          break;
        case SortOrder.PRICE_DESC:
          orderCondition = { sellingPrice: 'DESC' };
          break;
        default:
          orderCondition = {}; // Mặc định sắp xếp theo một trường cụ thể nếu cần
          break;
      }
      const findProducts = await this.productRepository.find({
        relations: {
          brand: true,
          sizes: true,
        },
        where: keyword
          ? [
              { ...whereConditions, name: keywordToLike }, // Tìm theo tên
              { ...whereConditions, slug: Like(convertTextToLikeVi(keyword)) }, // Tìm theo slug
              { ...whereConditions, barcode: keywordToLike }, // Tìm theo barcode
              { ...whereConditions, id: Number(keyword) ? Number(keyword) : 0 }, // Tìm theo id
            ]
          : {
              ...whereConditionAND,
              ...whereConditions,
            },
        select: {
          id: true,
          name: true,
          slug: true,
          barcode: true,
          sellingPrice: true,
          discount: true,
          createdAt: true,
          updatedAt: true,
          sizes: {
            id: true,
            sellingPrice: true,
            type: true,
            discount: true,
          },
          brand: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        skip: (+page - 1) * +limit,
        take: +limit,
        order: orderCondition,
      });
      // return findProducts;
      const findImageColors = await Promise.all(
        findProducts.map(async (_) => {
          const findProductColors = await this.colorsRepository.find({
            relations: {
              images: true,
            },
            where: {
              images: {
                product: {
                  id: _.id,
                },
              },
              products: {
                id: _.id,
              },
            },
            select: {
              id: true,
              name: true,
              hexCode: true,
              images: true,
            },
          });
          return {
            ..._,
            colors: findProductColors,
          };
        }),
      );
      const productIDs = await Promise.all(findProducts.map((_) => _?.id));
      const findColors = await this.colorsRepository.find({
        where: {
          products: {
            id: In(productIDs),
          },
        },
        order: {
          id: 'ASC',
        },
      });

      const findCategories = await this.categoryRepository.find({
        where: {
          products: {
            id: In(productIDs),
          },
        },
      });

      const findObjects = await this.targetGroupRepository.find({
        where: {
          products: {
            id: In(productIDs),
          },
        },
        order: {
          id: 'ASC',
        },
      });

      const findBrands = await this.brandRepository.find({
        where: {
          products: {
            id: In(productIDs),
          },
        },
        order: {
          id: 'ASC',
        },
      });
      const countProduct = await this.productRepository.count({
        where: keyword
          ? [
              { ...whereConditions, name: keywordToLike }, // Tìm theo tên
              { ...whereConditions, slug: Like(convertTextToLikeVi(keyword)) }, // Tìm theo slug
              { ...whereConditions, barcode: keywordToLike }, // Tìm theo barcode
              { ...whereConditions, id: Number(keyword) ? Number(keyword) : 0 }, // Tìm theo id
            ]
          : {
              ...whereConditionAND,
              ...whereConditions,
            },
      });

      return {
        products: findImageColors,
        totalPage: Math.ceil(countProduct / +limit),
        limit: +limit,
        filters: {
          colors: findColors,
          objects: findObjects,
          brands: findBrands,
          categories: findCategories,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async handleGetTrendings(
    page: number | string = 1,
    limit: number | string = 10,
  ) {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.orders', 'order')
      // .leftJoin('product.sizes', 'sizes')
      .leftJoin('product.brand', 'brand')
      // .leftJoin('product.colors', 'colors')
      .leftJoin('product.images', 'images')
      .select([
        'product.id',
        'product.name',
        'product.slug',
        'product.barcode',
        'product.sellingPrice',
        'product.discount',
        // 'sizes.id',
        // 'sizes.sellingPrice',
        // 'sizes.type',
        // 'sizes.discount',
        // 'sizes.isActive',
        'brand.id',
        'brand.name',
        'brand.slug',
        // 'colors.id',
        // 'colors.name',
        // 'colors.hexCode',
        // 'images.id',
        'images.src',
      ])
      .addSelect('SUM(order.quantity)', 'total_quantity')
      .groupBy('product.id')
      // .addGroupBy('sizes.id')
      // .addGroupBy('colors.id')
      // .addGroupBy('images.id')
      .addGroupBy('images.src')
      .orderBy('total_quantity', 'DESC')
      .skip((+page - 1) * +limit)
      .take(+limit)
      .getManyAndCount();
    return {
      products: result?.[0],
      totalPage: Math.ceil(result?.[1] / +limit),
    };
  }

  async handleGetProductBrands() {
    const findBrands = await this.brandRepository.find({
      where: {
        products: {
          id: Not(IsNull()),
        },
      },
    });

    return await Promise.all(
      findBrands.map(async (_) => {
        const products = await this.productRepository
          .createQueryBuilder('product')
          .leftJoin('product.orders', 'order')
          .leftJoin('product.items', 'items')
          .leftJoin('product.images', 'images')
          .select([
            'product.id as id',
            'product.name as name',
            'product.slug as slug',
            'product.barcode as barcode',
            'product.sellingPrice as sellingPrice',
            'product.discount as discount',
            'MIN(images.src) as src',
            'COALESCE(SUM(items.quantity), 0) AS itemQuantity',
            'COALESCE(SUM(order.quantity), 0) AS orderQuantity',
          ])
          .where('product.brandId = :brandId', { brandId: _.id })
          .groupBy('product.id')
          .having('orderQuantity < itemQuantity')
          .orderBy('orderQuantity', 'DESC')
          .take(10)
          .getRawMany();

        return {
          ..._,
          products,
        };
      }),
    );
  }

  async handleSearchProductByCashiers(
    keyword: string,
    user: Partial<Accounts> | any,
  ) {
    const whereConditions: any = {
      isActive: true,
      sizes: { isActive: true },
    };
    const findAccount = await this.accountRepository.findOne({
      relations: {
        manage: true,
        staff: true,
      },
      where: {
        id: user.id,
      },
    });
    if (
      user?.rating > 1 &&
      !findAccount?.manage?.id &&
      !findAccount?.staff?.id
    ) {
      throw new ForbiddenException();
    }
    const keywordToLike = Like(convertTextToLike(keyword ?? ''));
    const findProducts = await this.productRepository.find({
      relations: {
        brand: true,
        sizes: true,
        colors: true,
      },
      where: [
        { ...whereConditions, name: keywordToLike }, // Tìm theo tên
        { ...whereConditions, slug: Like(convertTextToLikeVi(keyword)) }, // Tìm theo slug
        { ...whereConditions, barcode: keywordToLike }, // Tìm theo barcode
        { ...whereConditions, id: Number(keyword) ? Number(keyword) : 0 }, // Tìm theo id
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        barcode: true,
        sellingPrice: true,
        discount: true,
        sizes: {
          id: true,
          sellingPrice: true,
          type: true,
          discount: true,
        },
        brand: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
      take: 10,
    });
    return await Promise.all(
      findProducts.map(async (product) => {
        const colors = await Promise.all(
          product?.colors?.map(async (_) => {
            const sizes = await Promise.all(
              product?.sizes?.map(async (size) => {
                const total = await this.cartsServices.handleFindTotalSold(
                  _.id,
                  size.id,
                  findAccount?.manage?.id
                    ? findAccount?.manage?.id
                    : findAccount?.staff?.id,
                );
                return {
                  ...total,
                  ...size,
                };
              }),
            );
            return {
              ..._,
              sizes,
            };
          }) ?? [],
        );

        return {
          ...product,
          colors,
        };
      }),
    );
  }

  async handleGetInventory(
    colorID: number,
    sizeID: number,
    user: Partial<Accounts>,
  ) {
    return await this.cartsServices.handleFindTotalSold(
      colorID,
      sizeID,
      user?.manage?.id ?? user?.staff?.id,
    );
  }

  async handleCountTotalProducts() {
    return await this.productRepository.count();
  }

  async handleCreateDefaultData() {
    const data = new Array(40).fill('');
    return await Promise.all(
      data.map(async (_, index) => {
        const ramdom = randomInt(3);
        const createProduct = this.productRepository.create({
          name: `Rèm vải Nhật Bản mã Plane ${index}-${ramdom}`,
          slug: `rem-vai-nhat-ban-ma-plane-${index}-${ramdom}`,
          barcode: 'plane-256',
          description:
            '<h2 class="ql-align-center"><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">RÈM VẢI NHẬT BẢN MÃ PLANE</strong></h2><table><tbody><tr><td data-row="1"><span style="background-color: rgb(255, 255, 255); color: rgb(102, 102, 102);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/plane.gif" height="750" width="750"></span></td><td data-row="1"><span style="background-color: rgb(255, 255, 255); color: rgb(102, 102, 102);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/plane2.gif" height="750" width="750"></span></td></tr></tbody></table><p><span style="background-color: rgb(255, 255, 255); color: rgb(10, 10, 10);"> </span></p><blockquote class="ql-align-justify"><em style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Với tiêu chí </em><strong style="background-color: rgb(255, 255, 255); color: rgb(216, 49, 49);"><em>MINH BẠCH GIÁ CẢ – UY TÍN – TẬN TÂM</em></strong><em style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">, các sản phẩm trên website của RÈM BẢO TÍN đều đúng với thực tế bán hàng từ mẫu mã, giá cả. Chúng tôi luôn nỗ lực để cung cấp cho khách hàng các thông tin đầy đủ nhất về sản phẩm. Cảm ơn hơn 20.000 khách hàng đã tin tưởng và ủng hộ RÈM BẢO TÍN  suốt nhiều năm qua.</em></blockquote><p class="ql-align-justify"><span style="background-color: rgb(255, 255, 255); color: rgb(10, 10, 10);"><img src="https://remcuaphuckhang.com/wp-content/uploads/2023/11/phu-kien-rem-vai-cao-cap.jpg" height="730" width="917"></span></p><h2><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">KIỂU CÁCH MAY RÈM VẢI</strong></h2><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Quý khách hàng có thể lựa chọn 1 trong 2 kiểu may là may ore hoặc may chiết ly. Sản phẩm thông thường chúng tôi sẽ mặc định may ore cho lớp vải chống nắng, may chiết ly cho lớp vải voan. </span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(10, 10, 10);"><img src="https://remcuaphuckhang.com/wp-content/uploads/2023/05/cach-may-rem-chiet-ly.jpg" height="720" width="1280"></span></p><p><em style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Cách may rèm ô rê giúp bộ rèm đều sóng, đẹp. Đặc biệt cách may này khiến cho việc tháo ra, lắp vào rèm dễ dàng trong quá trình vệ sinh. Đây là cách may phổ biến, áp dụng cho lớp vải</em></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(10, 10, 10);"><img src="https://remcuaphuckhang.com/wp-content/uploads/2023/05/cach-may-rem-chiet-ly-1.jpg" height="720" width="1280"></span></p><p><em style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Cách may rèm chiết ly khiến bộ rèm trông nhẹ nhàng. Đây là cách lắp phổ biến áp dụng cho lớp vải voan</em></p><h2><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">QUY CHUẨN MAY ĐỐI VỚI DÒNG RÈM VẢI CAO CẤP</strong></h2><table><tbody><tr><td data-row="1" class="ql-align-center"><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">RÈM VÉN: ĐỊNH HÌNH</strong></td><td data-row="1" class="ql-align-center"><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">RÈM VÉN: XẾP LY</strong></td><td data-row="1" class="ql-align-center"><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">RÈM VÉN: ORE</strong></td><td data-row="1" class="ql-align-center"><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">RÈM ROMAN</strong></td></tr></tbody></table><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Cổ rèm: 10cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Chân rèm:8cm gập 3cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ống rèm: 23-29 cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Biên rèm: 3cm gập 3cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Đường can, vắt sổ: 1cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Cổ rèm: 10cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kiểu may: ly đôi</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Chân rèm:8cm gập 3cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ống rèm: 23-29 cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Biên rèm: 3cm gập 3cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Đường can, vắt sổ: 1cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Cổ rèm: 10cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Chân rèm:8cm gập 3cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ống rèm: 23-29 cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Biên rèm: 3cm gập 3cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Đường can, vắt sổ: 1cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kích cỡ Ore: ø 7.5 cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">(vải khoét: ø 5.5 cm)</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kiểu may: 1 lớp</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Khoảng chia: 20cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tính vải: trên, dưới + 15cm</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Trái, phải + 12cm</span></li><li data-list="bullet" class="ql-align-justify"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Chiều ngang tối đa: 158cm</span></li></ol><h2 class="ql-align-center"><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">QUY TRÌNH MAY ĐỐI VỚI DÒNG RÈM CỬA CAO CẤP</strong></h2><p><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">SỬ DỤNG 100% MÁY JUKI THƯƠNG HIỆU MÁY MAY HÀNG ĐẦU NHẬT BẢN</strong></p><h3><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"> </strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Bước 1: Cắt vải</span></h3><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Trải vải ra bàn cắt;</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kiểm tra vải;</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Đưa vải vào máy cắt vải.</span></li></ol><h3><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Bước 2: Nối khổ vải</span></h3><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Sử dụng máy may công nghệ cao vắt sổ kiêm nối khổ vải.</span></li></ol><h3><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Bước 3: May biên và gấu rèm</span></h3><h3><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Bước 4: Là vải</span></h3><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Dùng bàn làm phẳng vải, chống vết nhăn, nếp gấp.</span></li></ol><h3><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Bước 5: Hấp vải</span></h3><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Trải vải lên khuôn định hình sóng rèm rồi đưa vào lồng hấp nằm, trong thời gian theo quy chuẩn kỹ thuật khoảng 1 tiếng đến 1h30 phút;</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tạo sóng toàn tấm bằng máy hấp công nghiệp cao;</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Sóng rèm vải sau khi hấp sẽ đều, giữ nếp.</span></li></ol><h3><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Bước 6: Cắt lại chiều cao</span></h3><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Công nghệ cắt treo đứng;</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Rèm vải sau khi được hấp định hình sóng sẽ được đưa vào máy cắt đứng. Xác định lại chiều cao sau khi vải đã được co giãn, máy sẽ tự động cắt để đạt được chiều cao chính xác nhất.</span></li></ol><h3><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Bước 7: May đỉnh rèm (Định hình, chiết ly, Ore)</span></h3><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Dùng máy may 2 kim;</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">May cổ rèm theo loại rèm yêu cầu trong đơn hàng.</span></li></ol><h3><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Bước 8: Kiểm tra hàng trước khi xuất kho</span></h3><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kiểm tra rèm thành phẩm trước khi đóng gói, xuất xưởng.</span></p><h2 class="ql-align-center"><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">ẢNH THỰC TẾ RÈM VẢI ĐẸP GIÁ RẺ</strong></h2><p class="ql-align-justify"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Dưới đây là 1 số ảnh rèm vải thực tế để quý khách cân nhắc chọn màu. Việc chọn màu vải phụ thuộc vào nhiều yếu tố như nội thất tổng thể của căn nhà, sở thích, phong thủy ..v..v. </span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><em>Để chọn được mẫu rèm phù hợp xin quý khách vui lòng liên hệ với chúng tôi, chúng tôi sẽ mang mẫu cataloge vải thực tế cho quý khách xem cụ thể, so sánh với màu nội thất tổng thể và tư vấn để quý khách chọn được mẫu rèm ưng ý. </em></strong></p><h3><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Rèm vải đẹp cho phòng khách</strong></h3><table><tbody><tr><td data-row="1"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/Untitled-24-1.gif" height="750" width="750"></span></td><td data-row="1"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/Untitled-17-2.gif" height="750" width="750"></span></td></tr><tr><td data-row="2"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/Untitled-19-1.gif" height="750" width="750"></span></td><td data-row="2"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/Untitled-20-2.gif" height="750" width="750"></span></td></tr><tr><td data-row="3"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/Untitled-4-5.gif" height="750" width="750"></span></td><td data-row="3"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/Untitled-3-2.gif" height="750" width="750"></span></td></tr></tbody></table><h3><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Rèm vải cản nắng cho phòng ngủ</strong></h3><table><tbody><tr><td data-row="1"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/Untitled-8-2.gif" height="750" width="750"></span></td><td data-row="1"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/Untitled-7-1.gif" height="750" width="750"></span></td></tr><tr><td data-row="2"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/Untitled-10-1.gif" height="750" width="750"></span></td><td data-row="2"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/Untitled-16-1.gif" height="750" width="750"></span></td></tr><tr><td data-row="3"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/Untitled-13-3.gif" height="750" width="750"></span></td><td data-row="3"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/09/Untitled-12-1.gif" height="750" width="750"></span></td></tr></tbody></table><h2 class="ql-align-center"><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">CÁC BƯỚC ĐẶT MUA RÈM CỬA VẢI </strong></h2><p class="ql-align-justify"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Với các mẫu rèm vải, chúng tôi thường mang mẫu để quý khách xem trực tiếp đồng thời tư vấn để quý khách chọn được mẫu mã phù hợp với kích thước cửa và nội thất nhà. Việc mang mẫu tư vấn tại nhà là hoàn toàn miễn phí. </span></p><p class="ql-align-justify"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/10/QUY-TRINH-DAT-REM-BAO-TIN.gif" height="670" width="1200"></span></p><h3 class="ql-align-center"><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><em>Xin vui lòng liên hệ với chúng tôi để được phục vụ tốt nhất. </em></strong></h3><p class="ql-align-justify"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/10/hotline-baotin-1.gif" height="300" width="850"></span></p><p class="ql-align-center"><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Mua rèm của chúng tôi bạn có được gì?</strong></p><p class="ql-align-justify"><br></p><h2><span style="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);">Lựa chọn đơn vị uy tín, trung thực là cách tốt nhất để mua được sản phẩm chất lượng với giá cả hợp lý</span></h2><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Bất cứ một sản phẩm nào trong quá trình sử dụng cũng có thể có lỗi. Nếu quý khách mua hàng tại Bảo Tín thì quý khách luôn yên tâm rằng, sản phẩm do Bảo Tín bán ra đều là các sản phẩm của các hãng sản xuất rèm cửa có tiếng trên thị trường và đã được kiểm tra rất kỹ về chất lượng sản phẩm trước khi xuất xưởng, nếu trong quá trình sử dụng có vấn đề gì, quý khách hãy cứ liên hệ với số Hotline của công ty, Bảo Tín sẽ sắp xếp việc sửa chữa, bảo hành trong thời gian sớm nhất.</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><em>Và một điều quang trọng Bảo Tín muốn nhấn mạnh, Bảo Tín là công ty, có mã số thuế, có trách nhiệm trước pháp luật chứ không phải một cửa hàng hay một thợ lắp đặt tay ngang làm thêm nay có thể chỗ này, mai chỗ khác, hay mè nheo từ chối, phủi trách nhiệm bảo hành.</em></strong></p><p><em style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Chúng tôi không chỉ bảo hành sản phẩm cho quý khách đúng theo thời gian quy định của hãng mà trong suốt quá trình sử dụng nếu sản phẩm có bất cứ vấn đề gì, quý khách vui lòng liên hệ với chúng tôi. Chúng tôi luôn sẵn lòng bảo trì sản phẩm của mình trong suốt quá trình sử dụng. Đây là </em><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><em>NGUYÊN TẮC LÀM VIỆC</em></strong><em style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"> của Bảo Tín kể từ ngày thành lập đến giờ. Và chúng tôi </em><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><em>TỰ HÀO</em></strong><em style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"> rằng chúng tôi luôn được </em><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><em>KHÁCH HÀNG YÊU QUÝ, TIN TƯỞNG </em></strong><em style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">giới thiệu bạn bè, người thân đến mua rèm tại Bảo Tín</em></p><p class="ql-align-justify"><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);"><img src="https://remcuabaotin.com/wp-content/uploads/2024/10/hotline-baotin-1.gif" height="300" width="850"></span></p><p><br></p>',
          costPrice: 800000,
          sellingPrice: 881000,
          discount: 0,
          isActive: true,
          sizes: [
            {
              type: 'm2(Rộng 1m, Cao 1m)',
              discount: 0,
              costPrice: 800000,
              sellingPrice: 881000,
              isActive: true,
            },
          ],
          images: [
            {
              src: 'ce4220ff-57a4-42b8-bfb9-bb11913798db',
              color: {
                id: 20,
                createdAt: '2025-06-08T16:06:30.957Z',
                updatedAt: '2025-06-08T16:06:30.957Z',
                name: 'Kem',
                hexCode: '#FFFDD0',
              },
            },
            {
              src: 'a84e374b-52c3-4465-b852-636c1740a3aa',
              color: {
                id: 20,
                createdAt: '2025-06-08T16:06:30.957Z',
                updatedAt: '2025-06-08T16:06:30.957Z',
                name: 'Kem',
                hexCode: '#FFFDD0',
              },
            },
            {
              src: '3cc6a3db-8c08-4a8b-979e-9ebb24d4c362',
              color: {
                id: 20,
                createdAt: '2025-06-08T16:06:30.957Z',
                updatedAt: '2025-06-08T16:06:30.957Z',
                name: 'Kem',
                hexCode: '#FFFDD0',
              },
            },
            {
              src: '07b79787-b8c1-4341-8fd9-9db6e2124f2e',
              color: {
                id: 20,
                createdAt: '2025-06-08T16:06:30.957Z',
                updatedAt: '2025-06-08T16:06:30.957Z',
                name: 'Kem',
                hexCode: '#FFFDD0',
              },
            },
            {
              src: '7c13399d-1425-48bb-af06-9f74a47459b5',
              color: {
                id: 20,
                createdAt: '2025-06-08T16:06:30.957Z',
                updatedAt: '2025-06-08T16:06:30.957Z',
                name: 'Kem',
                hexCode: '#FFFDD0',
              },
            },
          ],
          targetGroup: {
            id: 5,
            createdAt: '2025-06-08T16:22:30.824Z',
            updatedAt: '2025-06-08T16:22:30.824Z',
            name: 'Gia đình',
          },
          category: {
            id: 2,
          },
          colors: [
            {
              id: 20,
              createdAt: '2025-06-08T16:06:30.957Z',
              updatedAt: '2025-06-08T16:06:30.957Z',
              name: 'Kem',
              hexCode: '#FFFDD0',
            },
          ],
        });
        return await this.productRepository.save(createProduct);
      }),
    );
  }
}
