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
  Query,
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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RequestWithUser } from 'src/common/types/request-with-user';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({
    summary: 'Create comment',
    description: 'Create a new comment',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() req: RequestWithUser,
    @Body() createProductSizeDto: CreateCommentDto,
  ) {
    const user = req.user;
    return await this.commentsService.create(createProductSizeDto, user);
  }

  @ApiOperation({
    summary: 'Get comments',
    description: 'Get all comments or filter by criteria',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search comments by keyword',
  })
  @ApiQuery({
    name: 'productID',
    required: false,
    description: 'Get comments by product ID',
  })
  @ApiQuery({
    name: 'blogID',
    required: false,
    description: 'Get comments by blog ID',
  })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('productID') productID: string,
    @Query('blogID') blogID: string,
  ) {
    if (search) return await this.commentsService.searchByKeyword(search);
    if (productID)
      return await this.commentsService.searchByProductID(+productID);
    if (blogID) return await this.commentsService.searchByBlogID(+blogID);
    return await this.commentsService.findAll();
  }
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return await this.commentsService.update(+id, updateCommentDto);
  }

  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.commentsService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.commentsService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}
