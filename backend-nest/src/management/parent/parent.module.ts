import { Module } from '@nestjs/common';
import { ParentService } from './parent.service';
import { ParentController } from './parent.controller';
import { DatabaseService } from 'src/database.service';
import { UtilityService } from 'src/utility.service';

@Module({
  controllers: [ParentController],
  providers: [ParentService,DatabaseService,UtilityService]
})
export class ParentModule {}
