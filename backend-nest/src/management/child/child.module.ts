import { Module } from '@nestjs/common';
import { ChildService } from './child.service';
import { ChildController } from './child.controller';
import { UtilityService } from 'src/utility.service';
import { DatabaseService } from 'src/database.service';

@Module({
  controllers: [ChildController],
  providers: [ChildService,UtilityService,DatabaseService]
})
export class ChildModule {}
