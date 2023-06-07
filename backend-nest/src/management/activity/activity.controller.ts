import { Body, Controller, Delete, Get, Inject, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { Roles } from 'src/auth/Role.guard';
import { CreateActivity, UpdateActivity } from './activity.entity';
import { UserMust } from 'src/utility.service';
import { User } from '../../../../interfaces';
import { NotificationGateway } from 'src/websocket/notification.gateway';
@Roles('Admin', 'HeadOfDepartment')
@Controller('api/activity')
export class ActivityController {
    constructor(private activityService: ActivityService, private notify: NotificationGateway) { }

    @Post()
    @Roles('Admin', 'HeadOfDepartment')
    async create(@Body() createActivity: CreateActivity, @UserMust() user: User) {
        const ret = await this.activityService.create(createActivity)
        this.notify.emitNewNotification({
            by: user,
            controller: 'activity',
            datetime: new Date(),
            method: 'POST',
            payloadId: ret.id,
            payload: ret,
        });
        return ret;
    }

    @Get('/special')
    @Roles('Admin', 'HeadOfDepartment', 'Teacher')
    async findSpecialActivities() {
        return this.activityService.findSpecialActivities();
    }

    @Get(':id')
    @Roles('Admin', 'HeadOfDepartment', 'Teacher')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.activityService.findOne(+id);
    }

    @Patch(':id')
    @Roles('Admin', 'HeadOfDepartment')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateActivity: UpdateActivity, @UserMust() user: User) {
        const ret = await this.activityService.update(+id, updateActivity);
        this.notify.emitNewNotification({
            by: user,
            controller: 'activity',
            datetime: new Date(),
            method: 'PATCH',
            payloadId: +id,
            payload: updateActivity,
        });
        return ret;
    }

    @Delete(':id')
    @Roles('Admin', 'HeadOfDepartment')
    async remove(@Param('id', ParseIntPipe) id: string, @UserMust() user: User) {
        const ret = await this.activityService.remove(+id);
        this.notify.emitNewNotification({
            by: user,
            controller: 'activity',
            datetime: new Date(),
            method: 'DELETE',
            payloadId: +id,
            payload: ret,
        });
        return ret;
    }
}
