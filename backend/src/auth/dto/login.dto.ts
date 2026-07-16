import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  @IsString()
  @MinLength(5, { message: 'username must be at least 5 characters' })
  username: string;

  @IsString()
  @MinLength(10, { message: 'Password must be at least 10 characters' })
  password: string;
}
