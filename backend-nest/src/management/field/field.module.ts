import { Module } from "@nestjs/common";
import { FieldController } from './field.controller';
import { DatabaseService } from "src/database.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FieldEntity } from "./field.entity";

@Module({
  imports:[TypeOrmModule.forFeature([FieldEntity])],
  controllers: [FieldController],
  providers:[DatabaseService]
})
export class FieldModule { }
