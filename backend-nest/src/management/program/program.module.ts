import { Module } from "@nestjs/common";
import { ProgramController } from './program.controller';
import { DatabaseService } from "src/database.service";

@Module({
  controllers: [ProgramController],
  providers:[DatabaseService]
})
export class ProgramModule { }
