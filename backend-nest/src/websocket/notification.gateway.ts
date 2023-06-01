import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Namespace, Server, Socket } from "socket.io";
import { INotification, User } from "../../../interfaces";

@WebSocketGateway({ namespace: '/notification', cors: { origin: '*', }, })//add cors origin if necessary
export class NotificationGateway {
	@WebSocketServer()
	private server: Server;
	private clients: Socket[] = [];
	//todo private clients: {user:User,socket:Socket}[] = [];


	public emitNewNotification(notification: INotification) {
		console.log('emitted new notification for all clients')
		for (const c of this.clients)
			c.emit('newNotification', notification);
	}

	private handleDisconnect(client: Socket) {//client close his browser this function called
		// console.log('NotificationGateway : handleDisconnect : client:', client);
		this.clients.splice(this.clients.map(v => v.id).indexOf(client.id), 1);
		console.log(this.clients.map(v=>v.id));
	}

	private handleConnection(client: Socket, user: User) {
		this.clients.push(client);
		console.log('NotificationGateway : handleConnection', client.id, ' : user:', user);
		console.log(this.clients.map(v=>v.id));
		// for(let id of this.clients)
		console.log(this.server.emit('newNotification',))
	}

	// private afterInit(server: Namespace) {//same as onInit when this class is ready this function will be called.
	// 	// console.log('NotificationGateway : afterInit : server:', server);

	// }

	// @SubscribeMessage('newNotification')
	// private newNotification(@MessageBody() data: any) {//when client emit newNotification this function called. Also, data is JSON so be careful with Date object.
	// 	console.log('NotificationGateway : findAll : data:', data);

	// 	// return 'Hello world!';
	// }

	// @SubscribeMessage('identity')
	// private async identity(@MessageBody() data: number): Promise<number> {
	// 	return data;
	// }
}