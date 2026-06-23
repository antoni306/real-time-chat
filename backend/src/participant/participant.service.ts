import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Participant } from './participant.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ParticipantService {
    constructor(
        @InjectRepository(Participant) private readonly participantRepo:Repository<Participant>
    ){}

    async create(userId:string,conversationId:string):Promise<Participant>{
        const participant = this.participantRepo.create({user:{id:userId},conversation:{id:conversationId}});
        return await this.participantRepo.save(participant);
    }

    async findByConversation(conversationId:string):Promise<Participant[]>{
        const participants = await this.participantRepo.find({where:{conversation:{id:conversationId}}});
        return participants;
    }
    async isParticipant(userId:string,conversationId:string):Promise<boolean>{
        const participant = await this.participantRepo.findOneBy({user:{id:userId},conversation:{id:conversationId}});
        return participant !== null;

    }
}
