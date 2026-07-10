import { Controller, ForbiddenException, Get, Param, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { ParticipantService } from 'src/participant/participant.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('conversation/:conversationId/messages')
export class MessageController {

    constructor(
        private readonly messageService: MessageService,
        private readonly participantService: ParticipantService,
    ){}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findByConversation(@Param('conversationId') conversationId: string, @CurrentUser() payload:{id:string}){
        const isParticipant = await this.participantService.isParticipant(payload.id, conversationId);
        if(!isParticipant){
            throw new ForbiddenException(`user with id ${payload.id} is not a member of conversation ${conversationId}`);
        }
        return this.messageService.findByConversation(conversationId);
    }
}
