import { Module } from '@nestjs/common';
import { HdService } from './hd.service';
import { HdController } from './hd.controller';
import { DatabaseService } from 'src/database.service';

@Module({
  controllers: [HdController],
  providers: [HdService,DatabaseService]
})
export class HdModule {}
