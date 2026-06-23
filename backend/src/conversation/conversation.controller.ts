import { Body, Controller, Post } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationType } from './conversation-type.enum';

@Controller('conversation')
export class ConversationController {

    constructor(private readonly conversationService:ConversationService){}

    @Post('create')
    async createConversation(@Body() body:{name:string,type:string}){
        return this.conversationService.create(body.name,body.type as ConversationType)
    }
}
