import { Module } from "@nestjs/common";
import { ProgramController } from './program.controller';
import { DatabaseService } from "src/database.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProgramTable } from "./program.entity";

@Module({
  imports:[TypeOrmModule.forFeature([ProgramTable])],
  controllers: [ProgramController],
  providers:[DatabaseService]
})
export class ProgramModule { }
