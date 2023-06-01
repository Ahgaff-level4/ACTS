import { Module } from "@nestjs/common";
import { ProgramController } from './program.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProgramEntity } from "./program.entity";
import { NotificationGateway } from "src/websocket/notification.gateway";

@Module({
  imports:[TypeOrmModule.forFeature([ProgramEntity])],
  controllers: [ProgramController],
  providers:[NotificationGateway]
})
export class ProgramModule { }
