import { Component, ViewChild } from '@angular/core';
import { IAccountEntity } from '../../../../../../../interfaces';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AccountService } from 'src/app/services/account.service';
import { UtilityService } from 'src/app/services/utility.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AccountComponent{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IAccountEntity>;
  public dataSource!: AccountDataSource;
  public columnsKeys: string[] = JSON.parse(sessionStorage.getItem('accounts table') ?? 'null') ?? ['name','username', 'age', 'roles', 'createdDatetime', 'expand'];
  public expandedItem?: IAccountEntity;

  constructor(private accountService: AccountService, public ut: UtilityService) {
  }

  ngOnInit(): void {
    this.dataSource = new AccountDataSource();
    this.accountService.accounts.subscribe({
      next: v => {
        this.dataSource.setData(v);
        if(this.table)
          this.table.renderRows();
      }
    });
    this.accountService.fetch(true);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator)
      this.dataSource.paginator.firstPage();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columnsKeys, event.previousIndex, event.currentIndex);
    sessionStorage.setItem('accounts table', JSON.stringify(this.columnsKeys));
  }

  edit(account: IAccountEntity | undefined) {
    if (account != undefined)
      this.ut.router.navigate(['edit-account'], { state: { data: account } });
  }

  displayPhones(phones:string[]){
    return phones.filter(v=>!!v).join(', ');
  }

  deleteAccount(account?:IAccountEntity){
    if(account){
      this.ut.showMsgDialog({
        content: this.ut.translate('You are about to delete the account: ') + account.username + this.ut.translate(" permanently. If account has or had role Parent: any child has this account as parent will no longer has it. If account has or had role Teacher: any child has this account as teacher will no longer has it. You won't be able to delete the account if there is at least one goal or evaluation still exist and have been created by this account."),
        type: 'confirm',
        buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
      }).afterClosed().subscribe(async (v) => {
        if (v === 'Delete') {
          try {
            await this.accountService.delete(account.id, true);
            this.ut.showSnackbar('The program has been deleted successfully.');
          } catch (e) { }
        }
      })    }
  }

  ngOnDestroy(){
    this.accountService.isLoggerIn = false;
  }
}


class AccountDataSource extends MatTableDataSource<IAccountEntity>{
  setData(arr: IAccountEntity[]) {
    this.data = arr.map(v => ({ ...v.person, ...v, }));
  }
}
