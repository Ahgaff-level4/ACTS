import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { AccountEntity, ChangePassword, CreateAccount, UpdateAccount } from './account.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PersonView } from '../person/person.entity';
import { RoleEntity } from './role/role.entity';
import { R } from 'src/utility.service';
@Injectable()
export class AccountService {

    constructor(@InjectDataSource() private dataSource: DataSource, @InjectRepository(AccountEntity) private repo: Repository<AccountEntity>) { }

    async create(createAccount: CreateAccount) {
        createAccount.password = await this.generateHashSalt(createAccount.password);
        const created = this.repo.create(createAccount);

        for (const role of createAccount.roles) {
            const roleEntity = await this.dataSource.getRepository(RoleEntity).findOneBy({ name: role });
            if (roleEntity == null)
                throw new BadRequestException({ message: R.string.invalidRole(role) });
            if (Array.isArray(created.rolesEntities))
                created.rolesEntities = [...created.rolesEntities, roleEntity]
            else created.rolesEntities = [roleEntity];
        }
        return this.shapeBaseOnRole(this.extractRoles(await this.repo.save(created)));
    }

    async findAll() {
        return (await this.repo
            .createQueryBuilder('account')
            .leftJoinAndMapOne('account.person', PersonView, 'person', 'account.personId=person.id')
            .leftJoinAndSelect('account.rolesEntities', 'roles')
            .getMany())
            .map(this.extractRoles)
            .map(this.deletePassword)
    }

    async findOne(id: number) {
        return (await this.repo
            .createQueryBuilder('account')
            .leftJoinAndMapOne('account.person', PersonView, 'person', 'account.personId=person.id')
            .leftJoinAndSelect('account.rolesEntities', 'roles')
            .leftJoinAndSelect('account.evaluations', 'evaluations')
            .leftJoinAndSelect('account.goals', 'goals')
            .leftJoinAndSelect('account.children', 'children')
            .leftJoinAndSelect('account.teaches', 'teaches')
            .where('account.id=:id', { id })
            .getMany())
            .map(this.extractRoles)
            .map(this.deletePassword);
    }

    /**
     * UpdateAccount needs oldPassword. And it will validate the old password with existed password, if invalid throw Unauthorized exception
     */
    async updateOldPassword(id: number, updateAccount: ChangePassword) {
        if (updateAccount.password)
            updateAccount.password = await this.generateHashSalt(updateAccount.password);

        const oldPassword = (await this.repo.findOneByOrFail({ id })).password;

        if (!(await bcrypt.compare(updateAccount.oldPassword, oldPassword)))
            throw new BadRequestException('Old password is invalid!');

        delete updateAccount.oldPassword;
        return this.repo.update(id, updateAccount);
    }

    /**
     * Same as update(...) BUT no need for oldPassword. Must be authorized only by admin
     */
    async update(id: number, updateAccount: UpdateAccount) {
        if (updateAccount.password)
            updateAccount.password = await this.generateHashSalt(updateAccount.password);
        if (Array.isArray(updateAccount.roles))
            for (const role of updateAccount.roles) {
                const roleEntity = await this.dataSource.getRepository(RoleEntity).findOneBy({ name: role });
                if (roleEntity == null)
                    throw new BadRequestException({ message: R.string.invalidRole(role) });
                if (Array.isArray(updateAccount.rolesEntities))
                    updateAccount.rolesEntities = [...updateAccount.rolesEntities, roleEntity];
                else updateAccount.rolesEntities = [roleEntity];
            }
        return this.repo.save({ ...updateAccount, id });
    }

    remove(id: number) {
        return this.repo.delete(id);
    }

    /**
     * @param password plain password
     * @returns hash & salt concatenated used to store in the DB
     */
    private async generateHashSalt(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }

    /**
     * 
     * @param v Account object
     * @returns same account object without password and with map property rolesEntities into roles
     * ex: {..., rolesEntities:[{id:4,name:"Teacher"}]} => {..., roles:["Teacher"]}
     */
    public extractRoles(v: AccountEntity): AccountEntity {
        const roles = v.rolesEntities.map(roleEntity => roleEntity.name);
        delete v.rolesEntities;
        return { ...v, roles };
    }

    public deletePassword(v: AccountEntity): AccountEntity {
        delete v.password;
        return v;
    }

    /**
     * 
     * @param v should be used after `extractRoles(...)`
     */
    public shapeBaseOnRole(v: AccountEntity): AccountEntity {
        if (!v.roles.includes('Parent')) {
            delete v.phone0;
            delete v.phone1;
            delete v.phone2;
            delete v.phone3;
            delete v.phone4;
            delete v.phone5;
            delete v.phone6;
            delete v.phone7;
            delete v.phone8;
            delete v.phone0;
            delete v.address;
            delete v.children;
        }
        if (!v.roles.includes('Teacher')) {
            delete v.evaluations;
            delete v.goals;
        }
        return v;
    }
}
