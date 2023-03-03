import { Module } from '@nestjs/common';
import { PersonController } from './person.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonEntity, PersonView } from './person.entity';

@Module({
  imports:[TypeOrmModule.forFeature([PersonEntity,PersonView])],
  controllers: [PersonController],
})
export class PersonModule {}
