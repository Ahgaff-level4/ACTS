import { Module } from '@nestjs/common';
import { HdService } from './hd.service';
import { HdController } from './hd.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HdEntity } from './hd.entity';

@Module({
  imports:[TypeOrmModule.forFeature([HdEntity])],
  controllers: [HdController],
  providers: [HdService]
})
export class HdModule {}
