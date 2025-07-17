import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Res,
  NotFoundException,
  Req,
  HttpCode,
  UseGuards,
  ForbiddenException,
  Ip,
  Logger,
  Delete,
  Patch,
  UnauthorizedException,
  HttpException,
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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { LoginAccountDto } from './dto/login-account.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response, response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserRoles } from 'src/guards/roles.decorator';
import { EnumRoles } from 'src/guards/user-role.enum';
import { unlink } from 'fs';
import { ForgetAccountDto } from './dto/forget-account.dto';
import { UploadImageValidationPipe } from 'src/common/validators/upload-image.validator';
import { UpdateMyAccountDto } from './dto/update-my-account.dto';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  private readonly JWT_RT_EXP_SECOND: number;
  constructor(private readonly accountsService: AccountsService) {
    this.JWT_RT_EXP_SECOND = Number(process.env.JWT_RT_EXP_SECOND);
  }

  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email/phone and password',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 404, description: 'Invalid credentials' })
  @Post('login')
  @HttpCode(200)
  async onLoginAccount(
    @Res() res: Response,
    @Body() loginAccountDto: LoginAccountDto,
  ) {
    try {
      const data =
        await this.accountsService.handleLoginAccount(loginAccountDto);
      const { RT, user, role, ...args } = data;
      res.cookie('RT', RT, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: this.JWT_RT_EXP_SECOND * 1000,
      });
      return res.json({
        token: {
          exp: args.expAt,
          token: args.AT,
        },
        role: role?.description,
        user,
        // exp: this.JWT_RT_EXP_SECOND,
      });
    } catch (e) {
      throw e;
    }
  }

  @ApiOperation({
    summary: 'Refresh token',
    description: 'Refresh access token using refresh token from cookies',
  })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @Post('refresh')
  async onRefreshToken(@Req() request: Request, @Res() res: Response) {
    const cookieHeader = await request.headers?.cookie;
    const refreshToken =
      cookieHeader
        ?.split(';')
        .map((data) => {
          if (data.split('RT=')) {
            return data.split('RT=')[1];
          }
        })
        .join('') ?? '';
    const data: { RT: string; AT: string; exp: number } =
      await this.accountsService.handleRefreshToken(refreshToken);
    return res
      .cookie('RT', data.RT, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: data.exp * 1000,
      })
      .status(200)
      .json({
        message: 'Refresh token successfully!',
        accessToken: data.AT,
        exp: process.env.JWT_AT_EXP_SECOND,
      });
  }

  @ApiOperation({
    summary: 'User registration',
    description: 'Register a new user account',
  })
  @ApiResponse({ status: 200, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('signup')
  @HttpCode(200)
  async onSignUpAccount(@Body() createAccountDto: CreateAccountDto) {
    try {
      const { fullname, password, birthday, gender, phone, email } =
        createAccountDto;
      return await this.accountsService.handleCreateVerify({
        fullname,
        password,
        birthday,
        gender,
        phone,
        email,
      });
    } catch (err) {
      console.log(err);
      return new BadRequestException({
        message: 'Có lỗi sảy ra xin vui lòng thử lại sau.',
      });
    }
  }

  @ApiOperation({
    summary: 'Upload avatar',
    description: 'Upload user avatar image',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @UseInterceptors(FileInterceptor('avatar'))
  @Post('uploads')
  onUploadFile(
    @Req() request,
    @UploadedFile()
    avatar?: Express.Multer.File,
  ) {
    try {
      const data = {
        file: avatar?.filename,
        message: 'Upload avatar successfully!',
      };
      return data;
    } catch (e) {
      throw new BadRequestException(
        request.fileValidator || 'File uploaded without image',
      );
    }
  }

  //Get image
  @ApiOperation({
    summary: 'Get user avatar',
    description: 'Get user avatar image by filename',
  })
  @ApiParam({ name: 'pathname', description: 'Avatar image filename' })
  @ApiResponse({ status: 200, description: 'Avatar image file' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  @Get('profile/:pathname')
  getImage(@Res() res: Response, @Param('pathname') pathname: string) {
    Logger.log('Get file image');
    res.sendFile(pathname, { root: './public/avatars' }, (err) => {
      if (err) {
        res.sendFile('avatar.jpg', { root: './public/avatars' });
      }
    });
  }

  @ApiOperation({
    summary: 'Get current user',
    description: 'Get current authenticated user information',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User information retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  @UseGuards(AuthGuard)
  async onFindOne(@Req() req) {
    // await this.accountsService.handleFindAll();
    return req.user;
  }

  @ApiOperation({
    summary: 'Check user permissions',
    description: 'Check if user has access to specific permissions',
  })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: { access: { type: 'array', items: { type: 'string' } } },
    },
  })
  @ApiResponse({ status: 200, description: 'Permission check passed' })
  @ApiResponse({ status: 404, description: 'No permission' })
  @Post('permissions')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async onPermissions(@Body('access') access: any[], @Req() req) {
    try {
      const { id, ...args } = req.user;
      if (access.length === 0 && args) {
        return;
      } else {
        if (access && access.includes(args.roles)) {
          return;
        } else {
          throw new Error();
        }
      }
    } catch (e) {
      throw new NotFoundException({
        message: 'Bạn không có quyền truy cầp vào trang này!',
      });
    }
  }

  @ApiOperation({
    summary: 'Get user info (simplified)',
    description: 'Get simplified user information',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User info retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('user')
  @UseGuards(AuthGuard)
  async onGetInfoUser(@Req() req: any) {
    try {
      const { id, roles, description, ...args } = req.user;
      return { ...args, roles: description };
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @ApiOperation({
    summary: 'Get current user info (detailed)',
    description: 'Get current authenticated user detailed information',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User info retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('info')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async onGetThisInfoUser(@Req() req) {
    try {
      const { fullname, gender, phone, birthday, email, avatar, usid } =
        req.user;
      console.log(avatar);
      return { fullname, gender, phone, birthday, email, avatar, usid };
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  @ApiOperation({
    summary: 'Update current user info',
    description: 'Update current authenticated user information and avatar',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullname: { type: 'string', example: 'John Doe' },
        birthday: { type: 'string', example: '1990-01-01' },
        gender: { type: 'string', example: 'x' },
        phone: { type: 'string', example: '+84123456789' },
        email: { type: 'string', example: 'john.doe@example.com' },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User info updated' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @Post('info')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async onUpdateThisInfoUser(
    @Req() req,
    @Body()
    updateAccountDto: UpdateMyAccountDto,
    @UploadedFile(new UploadImageValidationPipe()) avatar: Express.Multer.File,
  ) {
    const user = req.user;
    return await this.accountsService.handleUpdateThisInfoUser(
      user.id,
      updateAccountDto,
      avatar,
    );
  }

  @ApiOperation({
    summary: 'Get all users',
    description: 'Get all users (admin/manager only)',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Get('users')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  @HttpCode(200)
  async onGetAllUsers(@Req() req) {
    try {
      const user = req.user;
      const data = await this.accountsService.handleFindAll(
        user.id,
        user.rating,
      );
      const count = await this.accountsService.handleFindAndCountUsers();
      const roleSet = await this.accountsService.handleGetRoleSet(user.rating);
      return { data, count, roleSet };
    } catch (e) {
      // console.log(e);
      throw new NotFoundException(e);
    }
  }

  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete a user by ID (admin/manager only)',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  async onDeleteOneUser(@Req() req, @Param('id') id: any) {
    try {
      const user = req.user;
      if (id == user.id) {
        throw new Error();
      }
      await this.accountsService.handleDelOneUser(id, user.rating);
      return { message: 'Xoá tài khoản thành công!' };
    } catch (e) {
      throw new NotFoundException({
        message: 'Xóa tài khoản thất bại!',
      });
    }
  }

  @ApiOperation({
    summary: 'Logout',
    description: 'Logout current user',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 400, description: 'Logout failed' })
  @Get('logout')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async onLogout(@Req() request: any, @Res() response: Response) {
    try {
      const user = request.user;
      const result = await this.accountsService.handleLogout(user.id);
      return response.status(200).json(result);
    } catch (e) {
      throw new BadRequestException({
        message: 'Đăng xuất tài khoản thất bại!',
      });
    }
  }

  @ApiOperation({
    summary: 'Ban/unban user',
    description: 'Ban or unban a user by ID (admin/manager only)',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { ban: { type: 'boolean', example: true } },
    },
  })
  @ApiResponse({ status: 200, description: 'Ban/unban successful' })
  @ApiResponse({ status: 400, description: 'Ban/unban failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Patch('ban/:id')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  async onBanAccount(
    @Req() request,
    @Body() updateAccountDto: UpdateAccountDto,
    @Param('id') id: any,
  ) {
    try {
      const user = request.user;
      await this.accountsService.handleBanAccount(
        id,
        updateAccountDto.ban ?? true,
        user.roles.rating,
      );
      return {
        message: updateAccountDto.ban
          ? 'Khóa tài khoản thành công!'
          : 'Mở khóa tài khoản thành công!',
      };
    } catch (e) {
      throw new BadRequestException({
        message: updateAccountDto.ban
          ? 'Khóa tài khoản thất bại!'
          : 'Mở khóa tài khoản thất bại!',
      });
    }
  }

  @ApiOperation({
    summary: 'Update user info (admin/manager)',
    description: 'Update user info by admin/manager',
  })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({ status: 200, description: 'User info updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch('edit')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  async onUpdateInfoUser(
    @Req() request,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    try {
      const user = request.user;
      const { fullname, birthday, phone, email, gender, id, password } =
        updateAccountDto;
      if (!id) {
        throw new Error();
      }
      return await this.accountsService.handleUpdateInfoUser(
        id,
        { fullname, birthday, phone, email, gender, password },
        user.roles.rating,
      );
    } catch (e) {
      // console.log(e);
      throw new NotFoundException();
    }
  }

  @ApiOperation({
    summary: 'Create account (admin/manager)',
    description: 'Create a new account by admin/manager',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({ status: 200, description: 'Account created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  async onCreateAccount(@Body() createAccountDto: CreateAccountDto) {
    try {
      return await this.accountsService.handleCreateAccount(
        createAccountDto,
        true,
      );
    } catch (err) {
      throw new BadRequestException({
        message: 'Có lỗi xảy ra xin vui lòng thử lại sau.',
      });
    }
  }
  @ApiOperation({
    summary: 'Test endpoint',
    description: 'Test endpoint for health check',
  })
  @ApiResponse({ status: 200, description: 'Hello world' })
  @Get('test')
  async onGetAll() {
    return { message: 'Hello world' };
  }

  @ApiOperation({
    summary: 'Request password reset',
    description: 'Request password reset (forget password)',
  })
  @ApiBody({ type: ForgetAccountDto })
  @ApiResponse({ status: 200, description: 'Password reset requested' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('forget')
  @HttpCode(200)
  async onCreateVerifyForgetPass(@Body() forgetAccountDto: ForgetAccountDto) {
    try {
      const result =
        await this.accountsService.handleCreateVerifyForgetPass(
          forgetAccountDto,
        );
      return result;
    } catch (err) {
      throw new HttpException(
        err?.message || 'Có lỗi xảy ra xin vui lòng thử lại sau.',
        err?.status || 404,
      );
    }
  }

  @ApiOperation({
    summary: 'Change password',
    description: 'Change password for current user',
  })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: { pass: { type: 'string', example: 'old</>+new' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Password changed' })
  @ApiResponse({ status: 400, description: 'Invalid password' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('change-password')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async onChangePass(@Req() req, @Body() data: { pass: string }) {
    try {
      const user = req.user;
      const password = data.pass.split('</>+');
      const prevPass = password[0];
      const newPass = password[1];
      if (!prevPass || !newPass) {
        throw new Error();
      }
      return await this.accountsService.handleChangePass({
        id: user.id,
        prevPass,
        newPass,
      });
    } catch (e) {
      throw e;
    }
  }

  @ApiOperation({
    summary: 'Count total accounts',
    description: 'Get total number of accounts',
  })
  @ApiResponse({ status: 200, description: 'Total accounts count' })
  @Get('count')
  async onCountTotalAccounts() {
    return await this.accountsService.handleCountTotalAccounts();
  }
}
