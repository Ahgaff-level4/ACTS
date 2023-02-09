import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './Teacher.service';
import { DatabaseService } from 'src/database.service';

@Module({
	controllers:[TeacherController],
	providers:[TeacherService,DatabaseService]
})
export class TeacherModule {}
