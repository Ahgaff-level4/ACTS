import { Module } from '@nestjs/common';
import { HdService } from './hd.service';
import { HdController } from './hd.controller';
import { DatabaseService } from 'src/database.service';
import { UtilityService } from 'src/utility.service';

@Module({
  controllers: [HdController],
  providers: [HdService,DatabaseService]
})
export class HdModule {}
