import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async register(registerDto: RegisterDto): Promise<void> {
    const user = await this.userRepo.findOneBy({
      username: registerDto.username,
    });

    if (user) {
      throw new ConflictException('this username is already taken');
    }
    const saltRounds = parseInt(
      this.configService.get<string>('SALT_ROUNDS') as string,
    );

    const hash = await bcrypt.hash(registerDto.password, saltRounds);
    await this.userRepo.insert({
      username: registerDto.username,
      email: registerDto.email,
      passwordHash: hash,
    });
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findOneBy({ username: loginDto.username });
    if (user === null) {
      throw new UnauthorizedException('login or password invalid');
    }
    const result = bcrypt.compareSync(loginDto.password, user.passwordHash);
    if (!result) {
      throw new UnauthorizedException('login or password invalid');
    }

    const accessToken = this.jwtService.sign(
      { sub: user.id },
      { secret: this.configService.get('JWT_SECRET'), expiresIn: 3600 },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: 60 * 60 * 24 * 7,
      },
    );
    const signature = refreshToken.split('.').pop() as string;
    user.refreshTokenHash = await bcrypt.hash(
      signature,
      parseInt(this.configService.get<string>('SALT_ROUNDS') as string),
    );
    await this.userRepo.save(user);

    return { accessToken, refreshToken };
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`user with id ${userId} not found`);
    }

    user.refreshTokenHash = null;
    await this.userRepo.save(user);
  }
  async validRefreshToken(userId: string, signature: string): Promise<boolean> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`user with id ${userId} not found`);
    }
    if (!user.refreshTokenHash) {
      throw new UnauthorizedException(
        `user with id ${userId} doesn't have refresh token`,
      );
    }

    return bcrypt.compareSync(signature, user.refreshTokenHash);
  }
  async refreshTokens(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = (await this.userRepo.findOneBy({ id: userId })) as User;

    const newRefreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: 60 * 60 * 24 * 7,
      },
    );
    const signature = newRefreshToken.split('.').pop() as string;
    user.refreshTokenHash = await bcrypt.hash(
      signature,
      parseInt(this.configService.get<string>('SALT_ROUNDS') as string),
    );
    await this.userRepo.save(user);

    const accessToken = this.jwtService.sign(
      { sub: userId },
      { secret: this.configService.get('JWT_SECRET'), expiresIn: 3600 },
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
