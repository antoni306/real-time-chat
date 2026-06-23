import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message) private readonly messageRepo:Repository<Message>
    ){}

    async create(content:string, senderId:string,conversationId:string):Promise<Message>{
        const message = this.messageRepo.create({content,sender:{id:senderId},conversation:{id:conversationId}});
        return await this.messageRepo.save(message);
    }

    async findByConversation(conversationId:string):Promise<Message[]>{
        return await this.messageRepo.find({where:{conversation:{id:conversationId}}});
    }
}
