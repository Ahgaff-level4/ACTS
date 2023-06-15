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
      valueGetter: v => this.ut.translate(v.data?.person?.gender),
      filterParams: { values: [this.ut.translate('Male'), this.ut.translate('Female')], },
      width: 110
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
      type: 'long',//filterParams in init
      valueGetter: v => v.data?.roles ? this.ut.displayRoles(v.data.roles) : '',
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
      valueGetter: v => v.data ? this.ut.displayPhones(v.data) : '',
    },
    {
      field: 'address',
      headerName: 'Address',
      type: 'long',
    }
  ];

  private menuItems: MyMenuItem<IAccountEntity>[] = [
    {
      name: 'View',
      icon: `<mat-icon _ngcontent-tvg-c62="" color="primary" role="img" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">wysiwyg</mat-icon>`,
      action: (v) => v ? this.ut.router.navigateByUrl('/account/' + v.id) : '',
      tooltip: 'View all information',
    },
    {
      name: 'Delete',
      icon: `<mat-icon _ngcontent-glk-c62="" color="warn" role="img" class="mat-icon notranslate mat-warn material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">delete</mat-icon>`,
      action: (v) => this.selectedItem ? this.accountService.deleteAccount(this.selectedItem) : this.ut.notify(null),
      tooltip: 'Delete the selected account',
    },
  ];

  constructor(public accountService: AccountService, public ut: UtilityService, public agGrid: AgGridService) {
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
      this.menuItems, { isPrintingNext: v => this.isPrinting = v }, (item) => { item?this.accountService.edit(item):this.ut.notify(null) }),
    onRowClicked: (v) => this.selectedItem = v.data,
  }



  ngOnDestroy() {

    this.accountService.isLoggerIn = false;
  }
}
