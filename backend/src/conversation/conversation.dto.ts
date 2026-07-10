import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString, IsUUID, ValidateIf } from "class-validator";
import { ConversationType } from "./conversation-type.enum";



export class CreateConversationDto{

    @IsEnum(ConversationType)
    type:ConversationType;

    @ValidateIf(o=>o.type === ConversationType.GROUP)
    @IsString()
    @IsNotEmpty()
    name?:string;


    @IsArray()
    @IsUUID('4',{each:true})
    @ArrayMinSize(1)
    participantsIds:string [];
}