import { Component, ViewChild } from '@angular/core';
import { IAccountEntity } from '../../../../../../../interfaces';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AccountService } from 'src/app/services/account.service';
import { UtilityService } from 'src/app/services/utility.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { ColDef, GridOptions, SetFilterParams } from 'ag-grid-community';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  public selectedItem?: IAccountEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;
  /**don't use `rowData` 'cause child has goals for `rowData`*/
  public rowData: IAccountEntity[] | undefined;

  /**
* @see [ag-grid.service](./../../../services/ag-grid.service.ts) for more information of how to set the columnDef properties.
  */
  public columnDefs: (ColDef<IAccountEntity>)[] = [
    {
      field: 'person.name',
      headerName: 'Name',
      type: 'long',
    },
    {
      colId: 'Age',//assigned `colId` because there are multiple columns with same field.
      field: 'person.birthDate',
      headerName: 'Age',
      valueGetter: (v) => this.ut.calcAge(v.data?.person.birthDate),//set the under the hood value
      type: 'fromNowNoAgo',
      valueFormatter: (v) => this.ut.fromNow(v.data?.person.birthDate, true),
      filter: 'agNumberColumnFilter',
      tooltipValueGetter: (v) => this.ut.toDate(v.data?.person.birthDate),
    },
    {
      field: 'person.gender',
      headerName: 'Gender',
      type: 'enum',
      filterParams: { values: ['Male', 'Female'], },
      width: 100
    },
    {
      colId: 'birthDate',
      field: 'person.birthDate',
      headerName: 'Birthdate',
      type: 'toDate',
      hide: true,
    },
    {
      field: 'username',
      headerName: 'Username',
      type: 'long',
    },
    {
      field: 'roles',
      headerName: 'Roles',
      type: 'enum',//filterParams in init
      valueGetter: v => v.data?.roles ? this.ut.displayRoles(v.data.roles) : '',
      filterParams: {
        values: [this.ut.translate('Admin'), this.ut.translate('Head of Department'), this.ut.translate('Teacher'), this.ut.translate('Parent')],
        comparator: function (a: string, b: string) {
          // return a.includes(b) ? 1 : (b.includes(a) ? -1 : 0);
          console.log('a', a, 'b', b);

          return 1;//todo fix filtering for multi-role. `comparator` used for sort :/
        }
      } as SetFilterParams
    },
    {
      field: 'person.createdDatetime',
      headerName: 'Register date',
      type: 'fromNow',
    },
    {
      field: 'phones',
      headerName: 'Phone',
      type: 'long',
      valueGetter: v => v.data ? this.displayPhones(v.data) : '',
    },
    {
      field: 'address',
      headerName: 'Address',
      type: 'long',
    }
  ];

  private menuItems: MyMenuItem<IAccountEntity>[] = [
    {
      name: 'Delete',
      icon: `<mat-icon _ngcontent-glk-c62="" color="warn" role="img" class="mat-icon notranslate mat-warn material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">delete</mat-icon>`,
      action: (v) => this.deleteAccount(v),
      tooltip: 'Delete the selected account',
    },
  ];

  constructor(private accountService: AccountService, public ut: UtilityService, public agGrid: AgGridService) {
  }

  ngOnInit(): void {
    this.accountService.fetch();
    this.accountService.accounts.subscribe(v => {
      this.rowData = this.ut.deepClone(v);
      this.gridOptions?.api?.refreshCells()
    });
  }

  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }

  printTable() {
    this.agGrid.printTable(this.gridOptions, v => this.isPrinting = v);
  }

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IAccountEntity> = {
    ...this.agGrid.commonGridOptions('accounts table', this.columnDefs, true,
      this.menuItems, { isPrintingNext: v => this.isPrinting = v }, (item) => { this.edit(item) }),
    onRowClicked: (v) => this.selectedItem = v.data,
  }

  edit(account: IAccountEntity | undefined) {
    if (account != undefined)
      this.ut.router.navigate(['edit-account'], { state: { data: account } });
  }

  displayPhones(account: IAccountEntity) {
    const phones = [];
    for (let i = 0; i < 10; i++)
      phones.push(account['phone' + i]);
    return phones.filter(v => !!v).join(this.ut.translate(', '));
  }

  deleteAccount(account?: IAccountEntity) {
    if (account) {
      this.ut.showMsgDialog({
        content: this.ut.translate('You are about to delete the account: ') + account.username + this.ut.translate(" permanently. If account has or had role Parent: any child has this account as parent will no longer has it. If account has or had role Teacher: any child has this account as teacher will no longer has it. You won't be able to delete the account if there is at least one goal or evaluation still exist and have been created by this account."),
        type: 'confirm',
        buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
      }).afterClosed().subscribe(async (v) => {
        if (v === 'Delete') {
          try {
            await this.accountService.delete(account.id, true);
            this.ut.notify("Deleted successfully",'The account has been deleted successfully','success');
          } catch (e) { }
        }
      })
    } else this.ut.notify(null);
  }

  ngOnDestroy() {
    this.accountService.isLoggerIn = false;
  }
}
