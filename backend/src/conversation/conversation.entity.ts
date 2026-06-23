import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ConversationType } from "./conversation-type.enum";
import { Message } from "../message/message.entity";
import { Participant } from "../participant/participant.entity";
@Entity("conversations")
export class Conversation {
    @PrimaryGeneratedColumn("uuid")
    id:string;


    @Column({type:"enum",enum:ConversationType})
    type:ConversationType;

    @Column({nullable:true,type:"varchar"})
    name:string;

    @CreateDateColumn()
    createdAt:Date;


    @OneToMany(()=>Message,(message)=>message.conversation)
    messages:Message[];

    @OneToMany(()=>Participant,participant=>participant.conversation)
    participants:Participant[];
}
