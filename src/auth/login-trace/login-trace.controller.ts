import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { LoginTraceService } from './login-trace.service';
import { CreateLoginTraceDto } from '../dto/create-login-trace.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class LoginTraceController {
  constructor(private readonly loginTraceService: LoginTraceService) { }

  @Post('login-trace')
  @UseGuards(JwtAuthGuard)
  async createLoginTrace(
    @Body() body: CreateLoginTraceDto,
    @Req() req: Request,
  ) {
    const saved = await this.loginTraceService.create(body, req);
    return {
      ok: true,
      id: saved._id,
    };
  }

  // ✅ NUEVO ENDPOINT
  @Get('login-trace')
  @UseGuards(JwtAuthGuard)
  async getTraces(
    @Query('username') username?: string,
    @Query('email') email?: string,
    @Query('group') group?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const data = await this.loginTraceService.findAll({
      username,
      email,
      group,
      startDate,
      endDate,
      limit: limit ? +limit : undefined,
      skip: skip ? +skip : undefined,
    });
    return { ok: true, ...data };
  }

  @Post('logout-trace')
  @UseGuards(JwtAuthGuard)
  async createLogoutTrace(@Body() body: CreateLoginTraceDto, @Req() req: Request) {
    const saved = await this.loginTraceService.create(
      { ...body, action: 'logout' },
      req,
    );
    return { ok: true, id: saved._id };
  }

}
