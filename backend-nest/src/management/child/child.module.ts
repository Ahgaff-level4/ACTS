import { Module } from '@nestjs/common';
import { ChildService } from './child.service';
import { ChildController } from './child.controller';
import { DatabaseService } from 'src/database.service';
import { UtilityService } from 'src/utility.service';

@Module({
  controllers: [ChildController],
  providers: [ChildService,DatabaseService,UtilityService]
})
export class ChildModule {}
