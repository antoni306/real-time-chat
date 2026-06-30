import { NotFoundException, UseGuards } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtWebSocketGuard } from 'src/auth/guard/ws-jwt.guard';
import { ChatService } from './chat.service';

@WebSocketGateway(3001,{cors:{origin:'*'}})
export class ChatGateway implements OnGatewayConnection,OnGatewayDisconnect{


  constructor( private readonly chatService:ChatService){}
  @WebSocketServer()
  server:Server
  
  
  
  handleConnection(client: Socket, ...args: any[]) {
    console.log(client.data.userId);
  }
  handleDisconnect(client: Socket) {
    console.log(client.data.userId);
  }
  
  @SubscribeMessage('sendMessage')
  @UseGuards(JwtWebSocketGuard)
  async sendMessage(sender: Socket, payload:{conversationId:string,message:string}): Promise<void> {
    await this.chatService.sendMessage(payload.message,sender.data.userId,payload.conversationId);
    this.server.to(payload.conversationId).emit('newMessage',{message:payload.message, senderId:sender.data.userId});
  }

  @SubscribeMessage('joinConversation')
  @UseGuards(JwtWebSocketGuard)
  async joinConversation(client:Socket,payload:{conversationId:string}):Promise<void>{
    const clientd= client.data.userId;
    try{
      await this.chatService.joinConversation(clientd,payload.conversationId);
      client.join(payload.conversationId);
    }catch(error){
      console.error(error);
      client.emit('error',{message:(error as NotFoundException).message});
    }

  }
}
