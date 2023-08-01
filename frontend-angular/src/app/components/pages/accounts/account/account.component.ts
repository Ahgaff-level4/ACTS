import { Component } from '@angular/core';
import { IAccountEntity } from '../../../../../../../interfaces';
import { AccountService } from 'src/app/services/CRUD/account.service';
import { DisplayService } from 'src/app/services/display.service';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { NotificationService } from 'src/app/services/notification.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { Router } from '@angular/router';
import { AccountRolesPipe } from 'src/app/pipes/account-roles.pipe';
import { CalcAgePipe } from 'src/app/pipes/date/calc-age.pipe';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  providers:[AccountRolesPipe,CalcAgePipe]
})
export class AccountComponent extends UnsubOnDestroy {
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
      valueGetter: (v) => this.calcAgePipe.transform(v.data?.person.birthDate),//set the under the hood value
      type: 'fromNowNoAgo',
      valueFormatter: (v) => this.display.fromNowPipe.transform(v.data?.person.birthDate, true),
      filter: 'agNumberColumnFilter',
      tooltipValueGetter: (v) => this.display.toDatePipe.transform(v.data?.person.birthDate),
    },
    {
      field: 'person.gender',
      headerName: 'Gender',
      type: 'enum',
      valueGetter: v => this.display.translate(v.data?.person?.gender),
      filterParams: { values: [this.display.translate('Male'), this.display.translate('Female')], },
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
      valueGetter: v => v.data?.roles ? this.accountRolesPipe.transform(v.data.roles) : '',
    },
    {
      field: 'person.createdDatetime',
      headerName: 'Registration date',
      type: 'fromNow',
    },
    {
      field: 'phones',
      headerName: 'Phone',
      type: 'long',
      valueGetter: v => v.data ? this.display.accountPhonesPipe.transform(v.data) : '',
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
      action: (v) => v ? this.router.navigateByUrl('/accounts/account/' + v.id) : '',
      tooltip: 'View all information',
    },
    {
      name: 'Delete',
      icon: `<mat-icon _ngcontent-glk-c62="" color="warn" role="img" class="mat-icon notranslate mat-warn material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">delete</mat-icon>`,
      action: (v) => this.selectedItem ? this.accountService.deleteAccount(this.selectedItem) : this.nt.notify(null),
      tooltip: 'Delete the selected account',
    },
  ];

  constructor(public accountService: AccountService, private display: DisplayService,
    public nt: NotificationService, public router:Router,
    public agGrid: AgGridService,private accountRolesPipe:AccountRolesPipe,
    private calcAgePipe:CalcAgePipe) {
    super()
  }

  ngOnInit(): void {
    this.accountService.fetch();
    this.sub.add(this.accountService.accounts$.subscribe(v => {
      if (v == undefined) return;
      this.rowData = JSON.parse(JSON.stringify(v));
      this.gridOptions?.api?.refreshCells()
      this.gridOptions?.api?.redrawRows()
    }));
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
      this.menuItems, { isPrintingNext: v => this.isPrinting = v }, (item) => { item ? this.router.navigate(['accounts','edit-account'], { state: { data: item } }): this.nt.notify(null) }),
    onSelectionChanged: (e) => this.selectedItem = e.api.getSelectedRows()[0] ?? undefined,
  }



  override ngOnDestroy() {
    this.accountService.isLoggerIn = false;
    super.ngOnDestroy();
  }
}
