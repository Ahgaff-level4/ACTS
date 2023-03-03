import { Module } from '@nestjs/common';
import { ParentService } from './parent.service';
import { ParentController } from './parent.controller';
import { UtilityService } from 'src/utility.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentEntity } from './parent.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ParentEntity])],
  controllers: [ParentController],
  providers: [ParentService,UtilityService]
})
export class ParentModule {}
