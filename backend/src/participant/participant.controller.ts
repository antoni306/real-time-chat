import { Body, Controller, Post } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { Participant } from './participant.entity';

@Controller('participant')
export class ParticipantController {

    constructor(private readonly participantService: ParticipantService){}

    @Post('create')
    async create(@Body() body:{userId:string,conversationId:string}):Promise<Participant>{
        return this.participantService.create(body.userId,body.conversationId);
    }
    
}
