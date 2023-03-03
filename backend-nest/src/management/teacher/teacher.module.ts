import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './Teacher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherEntity } from './teacher.entity';

@Module({
	imports:[TypeOrmModule.forFeature([TeacherEntity])],
	controllers:[TeacherController],
	providers:[TeacherService]
})
export class TeacherModule {}
