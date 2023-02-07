import { Module } from '@nestjs/common';
import { ChildService } from './child.service';
import { ChildController } from './child.controller';
import { DatabaseService } from 'src/database.service';

@Module({
  controllers: [ChildController],
  providers: [ChildService,DatabaseService]
})
export class ChildModule {}
