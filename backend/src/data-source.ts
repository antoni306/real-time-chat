import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './user/user.entity';
import { Conversation } from './conversation/conversation.entity';
import { Message } from './message/message.entity';
import { Participant } from './participant/participant.entity';

dotenv.config({ path: '.env.local' });

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT as string),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  entities: [User, Conversation, Message, Participant],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
