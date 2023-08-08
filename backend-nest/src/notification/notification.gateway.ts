import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { IAccountEntity, INotification, NotificationMessage, User } from "../../../interfaces";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { AccountEntity } from "src/management/account/account.entity";
import { GoalEntity } from "src/management/goal/goal.entity";
import { ChildEntity } from "src/management/child/child.entity";
import { EvaluationEntity } from "src/management/evaluation/evaluation.entity";
import { PersonEntity } from "src/management/person/person.entity";
interface MySocket extends Socket {
	data: { user: User, timestamp: Date };
}
@Injectable()
@WebSocketGateway({ namespace: '/notification', cors: { origin: '*', }, })//add cors origin if necessary
export class NotificationGateway {
	// @WebSocketServer()
	// private server:Server;
	private clients: MySocket[] = [];

	constructor(@InjectDataSource() private dataSource: DataSource) { }

	public async emitNewNotification(n: INotification) {
		console.log('user:', n.by.username, 'made', n, '. Remaining connecters:', this.clients.map(v => ({ socketId: v.id, user: v.data.user.username })));

		const clients = this.clients.filter(v => v.data.user.accountId != n.by.accountId);
		const admins = clients.filter(v => v.data.user.roles.includes('Admin'));//get all Admins
		let parents: MySocket[] = [];
		let interestedParents: IAccountEntity[] = [];//parents that notification was to their children's evaluation/goal
		if (n.method == 'POST' && (n.controller == 'evaluation' || n.controller == 'goal' || n.controller == 'strength')) {
			parents = clients.filter(v => v.data.user.roles.includes('Parent'));//all connected parents
			if (n.controller == 'goal')
				interestedParents = await this.dataSource.getRepository(AccountEntity).createQueryBuilder('account')
					.leftJoinAndMapMany('account.children', ChildEntity, 'child', 'account.id=child.parentId')
					.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'person.id=child.personId')
					.leftJoinAndMapMany('child.goals', GoalEntity, 'goal', 'child.id=goal.childId AND goal.state != :state', { state: 'strength' })
					.where('goal.id=:id', { id: n.payloadId })
					.getMany();
			else if (n.controller == 'strength')
				interestedParents = await this.dataSource.getRepository(AccountEntity).createQueryBuilder('account')
					.leftJoinAndMapMany('account.children', ChildEntity, 'child', 'account.id=child.parentId')
					.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'person.id=child.personId')
					.leftJoinAndMapMany('child.strengths', GoalEntity, 'goal', 'child.id=goal.childId AND goal.state = :state', { state: 'strength' })
					.where('goal.id=:id', { id: n.payloadId })
					.getMany();
			else if (n.controller == 'evaluation')
				interestedParents = await this.dataSource.getRepository(AccountEntity).createQueryBuilder('account')
					.leftJoinAndMapMany('account.children', ChildEntity, 'child', 'account.id=child.parentId')
					.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'person.id=child.personId')
					.leftJoinAndMapMany('child.goals', GoalEntity, 'goal', 'child.id=goal.childId AND goal.state != :state', { state: 'strength' })
					.leftJoinAndMapMany('goal.evaluations', EvaluationEntity, 'evaluation', 'goal.id=evaluation.goalId')
					.where('evaluation.id=:id', { id: n.payloadId })
					.getMany();

			parents = parents.filter(p => interestedParents.map(v => v.id).includes(p.data.user.accountId));//get the connected and interested parents which we will send to them the notification
		}

		for (const c of admins)
			c.emit('newNotification', n);

		for (const c of parents) {
			n.payload = interestedParents.filter(v => v.id == c.data.user.accountId)?.[0]?.children?.[0] ?? null;
			c.emit('newNotification', n);
		}
	}

	// public handleDisconnect(user:User)
	public handleDisconnect(client: MySocket) {//e.g. client closed his browser
		// console.log('NotificationGateway : handleDisconnect : client:', client);
		let indexOf: number
		if (client.data?.user)
			indexOf = this.clients.map(v => v.data?.user.accountId).indexOf(client.data.user.accountId);
		else indexOf = this.clients.map(v => v.id).indexOf(client.id);

		if (indexOf >= 0)//splice(-1,1) will splice last element! so we need to check if value exists
			this.clients.splice(indexOf, 1);

		this.emitOnlineAccounts();
		console.log('socketId:', client.id, 'username', client.data?.user?.username, ' disconnected. Remaining connectors:', this.clients.map(v => ({ socketId: v.id, user: v.data?.user?.username })));
	}

	@SubscribeMessage('registerUser')
	private registerUser(@MessageBody() user: User | null, @ConnectedSocket() clientSocket: Socket) {//when client emit newNotification this function called. Also, user is JSON so be careful with Date object.
		const clientUserIds = this.clients.map(v => v.data?.user.accountId);
		clientSocket.data = { user, timestamp: new Date() };//Now it is MySocket instead of Socket.
		const newClient: MySocket = clientSocket as MySocket;
		if (user)
			if (!clientUserIds.includes(user.accountId)) {//push the newClient to clients
				this.clients.push(newClient);
			} else {//if user exist update socket
				newClient.data.timestamp = this.clients[clientUserIds.indexOf(user.accountId)].data.timestamp;//persists old timestamp
				this.clients[clientUserIds.indexOf(user.accountId)] = newClient;
			}

		this.emitOnlineAccounts();
		console.log('socketId:', newClient.id, ' connected. Remaining connectors:', this.clients.map(v => ({ socketId: v.id, user: v.data.user.username })));
	}

	@SubscribeMessage('sendMessage')
	private sendMessage(@ConnectedSocket() client: MySocket,
		@MessageBody() message: NotificationMessage) {
		if (message && message.from && message.text) {
			if (message.to)
				this.clients.filter(v => v.data?.user.accountId == message.to.accountId).forEach(v => v.emit('message', message));
			else
				this.clients.filter(v => v.data?.user.accountId != client.data?.user.accountId).forEach(v => v.emit('message', message));
				
			return 'success';
		}
		return 'failed';
	}

	/**@returns all online accounts except the account with the param `accountId`, if provided otherwise all onlineAccounts */
	// private getOnlineAccounts = (accountId?: number) => {
	// 	if (accountId)
	// 		return this.clients.filter(v => v.user.accountId != accountId).map(v => ({ ...v.user, socketId: v.socket.id, timestamp: v.timestamp }));
	// 	return this.clients.map(v => ({ ...v.user, socketId: v.socket.id, timestamp: v.timestamp }));
	// }
	private getAdminClients = () => {
		return this.clients.filter(v => v.data?.user.roles.includes('Admin'));
	}

	/**Emit all online accounts (except the recipient) to all Admin accounts */
	private emitOnlineAccounts = () => {
		const adminAccounts = this.getAdminClients();
		for (const admin of adminAccounts)
			admin.emit('onlineAccounts', this.clients.filter(v => v.data?.user.accountId != admin.data?.user.accountId).map(v => ({ ...v.data?.user, timestamp: v.data?.timestamp })));
	}

}