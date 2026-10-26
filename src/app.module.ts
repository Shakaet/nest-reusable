import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module.js';
import { AdminModule } from './admin/admin.module.js';
import { AdminRoleModule } from './admin-role/admin-role.module.js';

@Module({
  imports: [
    // Environment configuration
    // ক. এনভায়রনমেন্ট ভ্যারিয়েবল লোড করা (dotenv এর বিকল্প)
    // isGlobal: true দেওয়ার কারণে অন্য কোনো মডিউলে বারবার ConfigModule ইম্পোর্ট করতে হবে না


    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI',
      'mongodb://neutrinobytepos:uHxVr1X5AKr2ZguC@cluster0-shard-00-00.bnqcs.mongodb.net:27017,cluster0-shard-00-01.bnqcs.mongodb.net:27017,cluster0-shard-00-02.bnqcs.mongodb.net:27017/neutrinoposdb?ssl=true&replicaSet=atlas-vi1kvm-shard-0&authSource=admin&appName=Cluster0'),
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        bufferCommands: false,  // কানেকশন ড্রপ করলে রিকোয়েস্ট আটকে না রেখে সরাসরি এরর দেবে
      }),
    }),

    // Rate limiting: 60 requests per 60 seconds
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    CloudinaryModule,
    AdminModule,
    AdminRoleModule,

  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
