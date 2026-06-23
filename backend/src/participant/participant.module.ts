import { Module } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participant } from './participant.entity';
import { ParticipantController } from './participant.controller';

@Module({
  imports:[TypeOrmModule.forFeature([Participant])],
  providers: [ParticipantService],
  exports:[ParticipantService],
  controllers: [ParticipantController]
})
export class ParticipantModule {}
