import { Module } from "@nestjs/common";
import { ProgramController } from './program.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProgramEntity } from "./program.entity";
import { NotificationModule } from "src/notification/notification.module";

@Module({
  imports:[TypeOrmModule.forFeature([ProgramEntity]),NotificationModule],
  controllers: [ProgramController],
  providers:[]

})
export class ProgramModule { }
