import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { IAccountEntity, IRoleEntity, Role } from "../../../../../interfaces";
import { AccountEntity } from "../account.entity";

@Entity()
export class RoleEntity implements IRoleEntity {
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;
	
	@Column({ type: 'nvarchar', nullable: false, unique: true, length:16 })
	public name: Role;
	
	@ManyToMany(() => AccountEntity, (account) => account.rolesEntities)
	public accounts: IAccountEntity[];
}