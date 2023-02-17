import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsNotEmpty, IsOptional } from "class-validator";
import { ICreateField, IFieldEntity } from "../../../../interfaces";

export class CreateField implements ICreateField{
    @IsNotEmpty()
    name:string;
    @IsDateString() @IsOptional()
    createdDatetime:Date|string;
}

export class FieldEntity extends CreateField implements IFieldEntity {
    id:number;
    performanceCount:number;
}

export class UpdateField extends PartialType(CreateField){}