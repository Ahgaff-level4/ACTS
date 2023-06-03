import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { IAccountEntity, INotification, User } from "../../../interfaces";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { AccountEntity } from "src/management/account/account.entity";
import { GoalEntity } from "src/management/goal/Goal.entity";
import { ChildEntity } from "src/management/child/child.entity";
import { EvaluationEntity } from "src/management/evaluation/evaluation.entity";
import { PersonEntity } from "src/management/person/person.entity";

@Injectable()
@WebSocketGateway({ namespace: '/notification', cors: { origin: '*', }, })//add cors origin if necessary
export class NotificationGateway {
	// @WebSocketServer()
	// private server: Server;
	private clients: { socket: Socket, user: User }[] = [];

	constructor(@InjectDataSource() private dataSource: DataSource) { }

	public async emitNewNotification(n: INotification) {
		console.log('emitNewNotification', this.clients.map(v => ({ socketId: v.socket.id, user: v.user })));

		const clients = this.clients.filter(v => v.user.accountId != n.by.accountId);
		const admins = clients.filter(v => v.user.roles.includes('Admin'));//get all Admins
		let parents: { socket: Socket, user: User }[] = [];
		let interestedParents: IAccountEntity[] = [];//parents that notification was to their children's evaluation/goal
		if (n.method == 'POST' && (n.controller == 'evaluation' || n.controller == 'goal' || n.controller == 'strength')) {
			parents = clients.filter(v => v.user.roles.includes('Parent'));//all connected parents
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

			parents = parents.filter(p => interestedParents.map(v => v.id).includes(p.user.accountId));//get the connected and interested parents which we will send to them the notification
		}


		for (const c of admins)
			c.socket.emit('newNotification', n);
		for (const c of parents) {
			n.payload = interestedParents.filter(v => v.id == c.user.accountId)?.[0]?.children?.[0] ?? null;
			c.socket.emit('newNotification', n);
		}
	}

	private handleDisconnect(client: Socket) {//client close his browser this function called
		// console.log('NotificationGateway : handleDisconnect : client:', client);
		const indexOf = this.clients.map(v => v.socket.id).indexOf(client.id);
		if (indexOf >= 0)//splice(-1,1) will splice last element! so we need to check if value exists
			this.clients.splice(indexOf, 1);
		console.log('handleDisconnect', this.clients.map(v => ({ socketId: v.socket.id, user: v.user })));
	}

	@SubscribeMessage('registerUser')
	private registerUser(@MessageBody() user: User | null, @ConnectedSocket() client: Socket) {//when client emit newNotification this function called. Also, user is JSON so be careful with Date object.
		const clientIds = this.clients.map(v => v.socket.id);
		if (user && Number.isInteger(user?.accountId) && typeof client.id == 'string' && !clientIds.includes(client.id))
			this.clients.push({ user, socket: client });
		else if (user == null && clientIds.includes(client.id))
			this.clients.splice(clientIds.indexOf(client.id), 1);
		console.log('registerUser', this.clients.map(v => ({ socketId: v.socket.id, user: v.user })));
	}
}