import { Module } from '@nestjs/common';
import { PersonController } from './person.controller';
import { DatabaseService } from 'src/database.service';

@Module({
  controllers: [PersonController],
  providers: [DatabaseService]
})
export class PersonModule {}
