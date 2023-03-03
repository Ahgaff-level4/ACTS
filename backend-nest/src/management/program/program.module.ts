import { Module } from "@nestjs/common";
import { ProgramController } from './program.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProgramEntity, ProgramView } from "./program.entity";

@Module({
  imports:[TypeOrmModule.forFeature([ProgramEntity,ProgramView])],
  controllers: [ProgramController],
})
export class ProgramModule { }
