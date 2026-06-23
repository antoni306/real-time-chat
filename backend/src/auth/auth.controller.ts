import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}


    @Post('register')
    async register(@Body() registerDto:RegisterDto): Promise<void>{
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto:LoginDto):Promise<{accessToken: string;refreshToken: string;}>{
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@CurrentUser() payload:{id:string}){
        return this.authService.logout(payload.id);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('refreshTokens')
    async refreshTokens(@CurrentUser() payload:{id:string,refreshToken:string}){
        return this.authService.refreshTokens(payload.id,payload.refreshToken);
    }

}
