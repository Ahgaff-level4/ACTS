import { Injectable } from '@nestjs/common';
import { CreateHd, HdEntity, UpdateHd } from './hd.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountView } from '../account/account.entity';

@Injectable()
export class HdService {
  constructor(@InjectRepository(HdEntity) private repo: Repository<HdEntity>) { }
  create(createHd: CreateHd) {
    return this.repo.save(this.repo.create(createHd))
  }

  async findAll(fk: boolean) {
    if (fk)
      return this.repo
        .createQueryBuilder('hd')
        .leftJoinAndMapOne('hd.account', AccountView, 'account', 'hd.accountId=account.id')
        .getMany();
    else return this.repo.find();
  }

  async findOne(id: number) {
    return this.repo
      .createQueryBuilder('hd')
      .leftJoinAndMapOne('hd.account', AccountView, 'account', 'hd.accountId=account.id')
      .where('hd.id=:id', { id })
      .getMany();
  }

  update(id: number, updateHd: UpdateHd) {
    return this.repo.update(+id, updateHd);
  }

  remove(id: number) {
    return this.repo.delete(+id);
  }
}
