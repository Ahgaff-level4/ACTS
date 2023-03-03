import { Module } from '@nestjs/common';
import { ChildService } from './child.service';
import { ChildController } from './child.controller';
import { UtilityService } from 'src/utility.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildEntity, ChildView } from './child.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ChildEntity,ChildView])],
  controllers: [ChildController],
  providers: [ChildService,UtilityService]
})
export class ChildModule {}
