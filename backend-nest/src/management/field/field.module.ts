import { Module } from "@nestjs/common";
import { FieldController } from './field.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { FieldEntity } from "./field.entity";

@Module({
  imports:[TypeOrmModule.forFeature([FieldEntity])],
  controllers: [FieldController],
})
export class FieldModule { }
