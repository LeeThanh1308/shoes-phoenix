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
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RequestWithUser } from 'src/common/types/request-with-user';
import { AuthOptionalGuard } from 'src/guards/auth-optional.guard';

@ApiTags('Likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @ApiOperation({ summary: 'Create like', description: 'Create a new like' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Like created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() req: RequestWithUser,
    @Body() createLikeDto: CreateLikeDto,
  ) {
    const user = req.user;
    return await this.likesService.create(createLikeDto, user);
  }

  @ApiOperation({
    summary: 'Get like count',
    description: 'Get like count for blog, comment, or reply',
  })
  @ApiQuery({
    name: 'blogID',
    required: false,
    description: 'Get likes for blog ID',
  })
  @ApiQuery({
    name: 'commentID',
    required: false,
    description: 'Get likes for comment ID',
  })
  @ApiQuery({
    name: 'replyID',
    required: false,
    description: 'Get likes for reply ID',
  })
  @ApiResponse({ status: 200, description: 'Like count retrieved' })
  @Get('count')
  @UseGuards(AuthOptionalGuard)
  async findCountLikeAuthAndOptions(
    @Req() req: RequestWithUser,
    @Query('blogID') blogID: string,
    @Query('commentID') commentID: string,
    @Query('replyID') replyID: string,
  ) {
    const user = req.user;
    if (blogID)
      return await this.likesService.handleCountLikeBlog(+blogID, user);
    if (commentID)
      return await this.likesService.handleCountLikeComment(+commentID, user);
    if (replyID)
      return await this.likesService.handleCountLikeReply(+replyID, user);
    return this.likesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.likesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto) {
    return this.likesService.update(+id, updateLikeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.likesService.remove(+id);
  }
}
