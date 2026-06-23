import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from 'src/conversation/conversation.entity';
import { ConversationService } from 'src/conversation/conversation.service';
import { Message } from 'src/message/message.entity';
import { MessageService } from 'src/message/message.service';
import { Participant } from 'src/participant/participant.entity';
import { ParticipantService } from 'src/participant/participant.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
    
    constructor(
         private readonly  userService:UserService,
         private readonly  conversationService:ConversationService,
         private readonly  messageSerivce:MessageService,
         private readonly participantService:ParticipantService
    ){}


    async sendMessage(conversationId:string,message:string,senderId:string):Promise<void>{
        await this.messageSerivce.create(message,conversationId,senderId);
        
    }

    async joinConversation(clientd: string, conversationId: string):Promise<boolean> {
        return await this.participantService.isParticipant(clientd,conversationId);
    }


}
