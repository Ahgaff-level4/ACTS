import { Injectable } from '@nestjs/common';
import { CreateParent, ParentEntity, UpdateParent } from './parent.entity';
import { UtilityService } from 'src/utility.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountView } from '../account/account.entity';

@Injectable()
export class ParentService {
  constructor(@InjectRepository(ParentEntity) private repo:Repository<ParentEntity>) { }
  create(createParent: CreateParent) {
    return this.repo.save(this.repo.create(createParent))
  }

  async findAll(fk: boolean) {
    if (fk)
      return this.repo
      .createQueryBuilder('parent')
      .leftJoinAndMapOne('parent.account',AccountView,'account','parent.accountId=account.id')
      .getMany();
    return this.repo.find();
  }

  async findOne(id: number) {
    return this.repo
      .createQueryBuilder('parent')
      .leftJoinAndMapOne('parent.account',AccountView,'account','parent.accountId=account.id')
      .where('parent.id=:id',{id})
      .getMany();
  }

  update(id: number, updateParent: UpdateParent) {
    return this.repo.update(+id,updateParent);
  }

  remove(id: number) {
    return this.repo.delete(+id);
  }


}
