import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { MessageModule } from 'src/message/message.module';
import { ParticipantModule } from 'src/participant/participant.module';

@Module({
  imports:[UserModule,ConversationModule,MessageModule,ParticipantModule,JwtModule.register({})],
  providers: [ChatService, ChatGateway]
})
export class ChatModule {}
