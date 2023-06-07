import { Module } from "@nestjs/common";
import { FieldController } from './field.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { FieldEntity } from "./field.entity";
import { NotificationModule } from "src/websocket/notification.module";

@Module({
  imports:[TypeOrmModule.forFeature([FieldEntity]),NotificationModule],
  controllers: [FieldController],
})
export class FieldModule { }
