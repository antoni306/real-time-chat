import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from 'src/message/message.entity';
import { MessageService } from 'src/message/message.service';
import { ParticipantService } from 'src/participant/participant.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly messageSerivce: MessageService,
    private readonly participantService: ParticipantService,
  ) {}

  async sendMessage(
    message: string,
    senderId: string,
    conversationId: string,
  ): Promise<Message> {
    return await this.messageSerivce.create(message, senderId, conversationId);
  }

  async joinConversation(
    clientd: string,
    conversationId: string,
  ): Promise<boolean> {
    const isParticipant = await this.participantService.isParticipant(
      clientd,
      conversationId,
    );
    if (!isParticipant) {
      throw new NotFoundException(
        `Client with id ${clientd} is not a member of conversation ${conversationId}`,
      );
    }
    return true;
  }
}
