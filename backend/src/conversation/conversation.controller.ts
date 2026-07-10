import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './conversation.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('conversation')
export class ConversationController {

    constructor(private readonly conversationService:ConversationService){}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createConversation(@Body() createConversationDto:CreateConversationDto, @CurrentUser() payload:{id:string}){
        return this.conversationService.create(createConversationDto,payload.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getConversations(@CurrentUser() payload:{id:string}){
        const conversations = await this.conversationService.findAll(payload.id);
        return conversations.map(conversation => ({
            id: conversation.id,
            type: conversation.type,
            name: conversation.name,
            participants: conversation.participants.map(p => ({id: p.user.id, username: p.user.username})),
        }));
    }
}
