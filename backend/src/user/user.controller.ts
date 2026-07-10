import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findByUsername(@Query('username') username: string): Promise<{ id: string; username: string }> {
        const user = await this.userService.findByUsername(username);
        return { id: user.id, username: user.username };
    }

    @UseGuards(JwtAuthGuard)
    @Get('all')
    async getAllUsers(): Promise<{ id: string; username: string }[]> {
        const users = await this.userService.getAllUsers();
        return users.map((u) => ({ id: u.id, username: u.username }));
    }
}
