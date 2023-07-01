import { Module } from '@nestjs/common';
import { PersonController } from './person.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonEntity } from './person.entity';

@Module({
  imports:[TypeOrmModule.forFeature([PersonEntity])],
  controllers: [PersonController],
})
export class PersonModule {}
