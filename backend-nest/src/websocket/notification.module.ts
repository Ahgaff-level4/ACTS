import { Module } from "@nestjs/common";
import { NotificationGateway } from "src/websocket/notification.gateway";

@Module({
  providers:[NotificationGateway],
	exports:[NotificationGateway],
})
export class NotificationModule { }
