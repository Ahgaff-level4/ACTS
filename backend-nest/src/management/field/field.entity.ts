import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsOptional, IsString, MaxLength } from "class-validator";
import { IActivityEntity, ICreateField } from "../../../../interfaces";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from "typeorm";
import { ActivityEntity } from "../activity/activity.entity";
import { Type } from "class-transformer";

export class CreateField implements ICreateField {
    @IsString() @MaxLength(50)
    @ViewColumn()
    @Column({ length: 50, unique: true, type: 'nvarchar', nullable: false })
    public name: string;

    @Type(() => Date) @IsDate() @IsOptional()
    @ViewColumn()
    @CreateDateColumn({ type: 'datetime' })
    public createdDatetime: Date;
}


@Entity()
export class FieldEntity extends CreateField {
    @ViewColumn()
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    @OneToMany(() => ActivityEntity, (activity) => activity.field)
    activities: IActivityEntity[];
}

export class UpdateField extends PartialType(CreateField) { }
