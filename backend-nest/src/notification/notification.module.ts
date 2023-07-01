import { Module } from "@nestjs/common";
import { NotificationGateway } from "src/notification/notification.gateway";

@Module({
  providers:[NotificationGateway],
	exports:[NotificationGateway],
})
export class NotificationModule { }
