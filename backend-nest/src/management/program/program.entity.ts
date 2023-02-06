import { PartialType } from "@nestjs/mapped-types";

export class CreateProgram{
    name:string
}

export class ProgramEntity extends CreateProgram{
    id:number;
    createdDatetime:Date;
}

export class UpdateProgram extends PartialType(CreateProgram){}