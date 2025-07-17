import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
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
import { RepliesService } from './replies.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { RequestWithUser } from 'src/common/types/request-with-user';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('Replies')
@Controller('replies')
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  @ApiOperation({
    summary: 'Create reply',
    description: 'Create a new reply to a comment',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Reply created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @UseGuards(AuthGuard)
  create(@Req() req: RequestWithUser, @Body() createReplyDto: CreateReplyDto) {
    const user = req.user;
    return this.repliesService.create(createReplyDto, user);
  }

  @Get()
  findAll() {
    return this.repliesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repliesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReplyDto: UpdateReplyDto) {
    return this.repliesService.update(+id, updateReplyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repliesService.remove(+id);
  }
}
