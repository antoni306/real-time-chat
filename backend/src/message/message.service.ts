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

    async findByConversation(conversationId:string):Promise<{id:string,content:string,createdAt:Date,senderId:string}[]>{
        const messages = await this.messageRepo.find({
            where:{conversation:{id:conversationId}},
            relations:{sender:true},
            order:{createdAt:'ASC'},
        });
        return messages.map(m=>({id:m.id,content:m.content,createdAt:m.createdAt,senderId:m.sender.id}));
    }
}
