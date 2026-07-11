import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user/user.entity';
import { Conversation } from './conversation/conversation.entity';
import { Message } from './message/message.entity';
import { Participant } from './participant/participant.entity';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (service: ConfigService) => ({
        type: 'postgres',
        host: service.get('POSTGRES_HOST'),
        port: service.get<number>('POSTGRES_PORT'),
        username: service.get('POSTGRES_USER'),
        password: service.get('POSTGRES_PASSWORD'),
        database: service.get('POSTGRES_DB'),
        synchronize: false,
        entities: [User, Conversation, Message, Participant],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
      }),
    }),
    AuthModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
