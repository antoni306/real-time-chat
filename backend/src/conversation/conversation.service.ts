import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { ConversationType } from './conversation-type.enum';
import { CreateConversationDto } from './conversation.dto';
import { ParticipantService } from 'src/participant/participant.service';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    private readonly participantService: ParticipantService,
  ) {}

  async findById(id: string) {
    const conversation = await this.conversationRepo.findOneBy({ id });
    if (!conversation) {
      throw new NotFoundException(`conversation with id ${id} not found`);
    }

    return conversation;
  }

  async create(
    createConversationDto: CreateConversationDto,
    creator: string,
  ): Promise<Conversation> {
    const allIds = new Set([creator, ...createConversationDto.participantsIds]);
    if (createConversationDto.type === ConversationType.DIRECT) {
      if (allIds.size !== 2) {
        throw new BadRequestException('wrong number of participants');
      }
      const existsConversation = await this.conversationRepo
        .createQueryBuilder('conv')
        .leftJoin('conv.participants', 'p')
        .leftJoin('p.user', 'u')
        .where('conv.type = :convType')
        .andWhere('u.id IN (:...ids)')
        .groupBy('conv.id')
        .having('COUNT(p.id) = :count')
        .setParameter('ids', [...allIds])
        .setParameter('convType', ConversationType.DIRECT)
        .setParameter('count', 2)
        .getOne();
      if (existsConversation) {
        throw new ConflictException(
          'DIRECT conversation for those participants already exists',
        );
      }
    }

    const participants = [];
    for (const id of allIds) {
      participants.push(this.participantService.buildParticipant(id));
    }

    const conversation = this.conversationRepo.create({
      type: createConversationDto.type,
      name: createConversationDto.name,
      participants: participants,
    });
    return await this.conversationRepo.save(conversation);
  }
  async findAll(userId: string): Promise<Conversation[]> {
    return await this.conversationRepo
      .createQueryBuilder('conv')
      .innerJoin('conv.participants', 'me', 'me.userId = :userId', { userId })
      .leftJoinAndSelect('conv.participants', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .getMany();
  }
}
