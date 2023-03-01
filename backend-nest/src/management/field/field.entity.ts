import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { IActivityEntity, ICreateField, IFieldEntity } from "../../../../interfaces";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from "typeorm";
import { ActivityEntity } from "../activity/activity.entity";
import { Type } from "class-transformer";

export class CreateField implements ICreateField {
    @IsString()  @MaxLength(50)
    @ViewColumn()
    @Column({ length:50, unique: true, type: 'nvarchar',nullable:false })
    public name: string;

    @Type(()=>Date) @IsDate() @IsOptional()
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


@ViewEntity({//todo check if view works
    expression: `
	SELECT field_table.id, field_table.name, field_table.createdDatetime,COUNT(activity_entity.fieldId) AS performanceCount 
    FROM field_table LEFT JOIN activity_entity ON activity_entity.fieldId=field_table.id GROUP BY field_table.id;`
})
export class FieldView extends FieldEntity implements IFieldEntity{
    @ViewColumn()
    activityCount: number;
}