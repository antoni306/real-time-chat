import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { ConversationType } from './conversation-type.enum';

@Injectable()
export class ConversationService {
    constructor(
        @InjectRepository(Conversation) private readonly conversationRepo:Repository<Conversation>,

    ){}

    async findById(id:string){
        const conversation = await this.conversationRepo.findOneBy({id});
        if(!conversation){
            throw new NotFoundException(`conversation with id ${id} not found`);
        }

        return conversation;
    }
    
    async create(name:string,type:ConversationType):Promise<Conversation> {
        const conversation = this.conversationRepo.create({name,type});
        return await this.conversationRepo.save(conversation);
    }
}
