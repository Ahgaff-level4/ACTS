import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreatePerformance, UpdatePerformance } from './performance.entity';
import { Roles } from 'src/auth/Role.guard';
@Roles('Admin', 'HeadOfDepartment')
@Controller('api/performance')
export class PerformanceController {
    constructor(private performanceService: PerformanceService) { }

    @Post()
    async create(@Body() createPerformance: CreatePerformance) {
        return this.performanceService.create(createPerformance)
    }

    @Get()
    @Roles('Admin', 'HeadOfDepartment', 'Teacher')
    async findAll(@Query('FK', ParseBoolPipe) fk: boolean) {
        return this.performanceService.findAll(fk);
    }

    @Get(':id')
    @Roles('Admin', 'HeadOfDepartment', 'Teacher')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.performanceService.findOne(+id);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: string, @Body() updatePerformance: UpdatePerformance) {
        return this.performanceService.update(+id, updatePerformance);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.performanceService.remove(+id);
    }
}
