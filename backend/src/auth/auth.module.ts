import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guard/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './guard/strategies/jwt-refresh.strategy';

@Module({
  imports:[TypeOrmModule.forFeature([User]),JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,JwtRefreshStrategy],
  exports:[AuthService]
})
export class AuthModule {}
