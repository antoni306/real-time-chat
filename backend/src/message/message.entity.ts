import { Conversation } from "../conversation/conversation.entity";
import { User } from "../user/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("messages")
export class Message {
    @PrimaryGeneratedColumn("uuid")
    id:string;

    @Column({type:"text"})
    content:string;

    @CreateDateColumn()
    createdAt:Date;


    @ManyToOne(()=>Conversation,(conversation)=>conversation.messages)
    conversation:Conversation;

    @ManyToOne(()=>User,(user)=>user.messages,{onDelete:'CASCADE'})
    sender:User;
}
