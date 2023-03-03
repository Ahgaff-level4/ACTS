import { Module } from "@nestjs/common";
import { FieldController } from './field.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { FieldEntity, FieldView } from "./field.entity";

@Module({
  imports:[TypeOrmModule.forFeature([FieldEntity,FieldView])],
  controllers: [FieldController],
})
export class FieldModule { }
