import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { resolve } from "path";

@Controller()
export class AppController {
  @Get()
  angular(@Res() response: Response): void {
    // the homepage will load our index.html which contains angular logic
    response.sendFile(resolve('./dist-angular/index.html'));
  }
}