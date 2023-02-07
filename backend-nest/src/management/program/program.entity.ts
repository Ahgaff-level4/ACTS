import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateProgram{
    @IsNotEmpty()
    name:string;
    @IsDateString() @IsOptional()
    createdDatetime?:Date|string;
}

export class ProgramEntity extends CreateProgram{
    id:number;
}

export class UpdateProgram extends PartialType(CreateProgram){}