import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateField{
    @IsNotEmpty()
    name:string;
    @IsDateString() @IsOptional()
    createdDatetime:Date|string;
}

export class FieldEntity extends CreateField {
    id:number;
    performanceCount:number;
}

export class UpdateField extends PartialType(CreateField){}