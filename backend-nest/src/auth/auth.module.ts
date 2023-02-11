import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/database.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  providers: [DatabaseService,AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
