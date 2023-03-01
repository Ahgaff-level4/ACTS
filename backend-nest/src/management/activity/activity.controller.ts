import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { Roles } from 'src/auth/Role.guard';
import { CreateActivity, UpdateActivity } from './activity.entity';
@Roles('Admin', 'HeadOfDepartment')
@Controller('api/activity')
export class ActivityController {
    constructor(private activityService: ActivityService) { }

    @Post()
    async create(@Body() createActivity: CreateActivity) {
        return this.activityService.create(createActivity)
    }

    @Get()
    @Roles('Admin', 'HeadOfDepartment', 'Teacher')
    async findAll(@Query('FK', ParseBoolPipe) fk: boolean) {
        return this.activityService.findAll(fk);
    }

    @Get(':id')
    @Roles('Admin', 'HeadOfDepartment', 'Teacher')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.activityService.findOne(+id);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: string, @Body() updateActivity: UpdateActivity) {
        return this.activityService.update(+id, updateActivity);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.activityService.remove(+id);
    }
}
