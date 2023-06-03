import { Module } from "@nestjs/common";
import { FieldController } from './field.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { FieldEntity } from "./field.entity";
import { NotificationGateway } from "src/websocket/notification.gateway";

@Module({
  imports:[TypeOrmModule.forFeature([FieldEntity])],
  controllers: [FieldController],
  providers:[{provide:'Notification',useClass:NotificationGateway}]

})
export class FieldModule { }
