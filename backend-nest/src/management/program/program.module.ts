import { Module } from "@nestjs/common";
import { ProgramController } from './program.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProgramEntity } from "./program.entity";

@Module({
  imports:[TypeOrmModule.forFeature([ProgramEntity])],
  controllers: [ProgramController],
})
export class ProgramModule { }
