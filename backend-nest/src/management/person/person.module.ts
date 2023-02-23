import { Module } from '@nestjs/common';
import { PersonController } from './person.controller';
import { DatabaseService } from 'src/database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonEntity, PersonView } from './person.entity';

@Module({
  imports:[TypeOrmModule.forFeature([PersonEntity,PersonView])],
  controllers: [PersonController],
  providers:[DatabaseService]
})
export class PersonModule {}
