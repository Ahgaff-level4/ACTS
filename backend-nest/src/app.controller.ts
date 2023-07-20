import { Controller, Get, Res } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { Response } from "express";
import { resolve } from "path";
import { DataSource } from "typeorm";
import { generateFakeData } from "./faker";

@Controller()
export class AppController {
  constructor(@InjectDataSource() private dataSource: DataSource,) {
    generateFakeData(dataSource);
  }
  @Get()
  angular(@Res() response: Response): void {
    // the homepage will load our index.html which contains angular logic
    response.sendFile(resolve('./dist-angular/index.html'));
  }
}