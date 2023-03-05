import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { IAccountEntity, Role } from "../../../../../interfaces";
import { AccountEntity } from "../account.entity";

@Entity()
export class RoleEntity {
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;

	@Column({ type: 'enum', nullable: false, unique: true, enum: ['Admin', 'HeadOfDepartment', 'Teacher', 'Parent'] })
	public name: Role;

	@ManyToMany(() => AccountEntity, (account) => account.roles)
	public accounts: IAccountEntity
}