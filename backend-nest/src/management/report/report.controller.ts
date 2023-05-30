import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IChildReport } from '../../../../interfaces';
import { ChildEntity } from '../child/child.entity';
import { PersonEntity } from '../person/person.entity';
import { AccountEntity } from '../account/account.entity';
import { Roles } from 'src/auth/Role.guard';


@Controller('api/report')
export class ReportController {
	constructor(@InjectDataSource() private dataSource: DataSource) { }

	
	@Get('child/:id')
	@Roles('Admin', 'HeadOfDepartment')
	async getChildReport(@Param('id', ParseIntPipe) id: number): Promise<IChildReport> {
		const child = (await this.dataSource.getRepository(ChildEntity)
			.createQueryBuilder('child')
			.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
			.leftJoinAndSelect('child.teachers', 'teacher')
			.leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', 'teacher.personId=teacherPerson.id')
			.leftJoinAndMapOne('child.parent', AccountEntity, 'parentAccount', 'child.parentId=parentAccount.id')
			.leftJoinAndMapOne('parentAccount.person', PersonEntity, 'parentPerson', 'parentAccount.personId=parentPerson.id')
			.where('child.id=:id', { id })
			.getMany())[0];
			
		return { child };
	}
}
