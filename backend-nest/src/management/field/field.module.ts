import { Module } from "@nestjs/common";
import { FieldController } from './field.controller';
import { DatabaseService } from "src/database.service";

@Module({
  controllers: [FieldController],
  providers: [DatabaseService]
})
export class FieldModule { }
