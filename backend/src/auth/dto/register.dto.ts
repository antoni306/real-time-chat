import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  constructor(username: string, email: string, password: string) {
    this.username = username;
    this.email = email;
    this.password = password;
  }

  @IsString()
  @MinLength(5, { message: 'username must be at least 5 characters' })
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10, { message: 'Password must be at least 10 characters' })
  password: string;
}
