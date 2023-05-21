import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IActivityEntity, IFieldEntity } from '../../../../../../interfaces';
import { ActivityService } from 'src/app/services/activity.service';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddEditActivityComponent } from '../../dialogs/add-edit/add-edit-activity/add-edit-activity.component';
import { ColDef, GridOptions, NewValueParams } from 'ag-grid-community';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { FieldService } from 'src/app/services/field.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-special-activity',
  templateUrl: './special-activity.component.html',
  styleUrls: ['./special-activity.component.scss']
})
export class SpecialActivityComponent {
  public canEdit: boolean = this.ut.userHasAny('Admin', 'HeadOfDepartment');
  public selectedItem?: IActivityEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;
  public rowData: IActivityEntity[] | undefined;

  private onCellValueChange = async (e: NewValueParams<IActivityEntity>) => {
    try {
      await this.service.patchInSpecialActivities(e.data.id, { [e.colDef.field as keyof IActivityEntity]: e.newValue });
      this.ut.showSnackbar('Edited successfully')
    } catch (e) {
      this.service.specialActivities.pipe(first())
        .subscribe(v => {
          this.rowData = v.map(n => ({ ...n }));
          this.gridOptions?.api?.refreshCells();
        });
    }
  }

  /**
  * @see ag-grid.service.ts for more information of how to set the columnDef properties.
  */
  public columnDefs: (ColDef<IActivityEntity>)[] = [
    {
      field: 'goals.0.child.person.name',
      headerName: 'Child',//headerName will be translated
      type: 'long',
      tooltipValueGetter: v => v.data?.goals?.length == 0 ? 'This activity is not bind to any child! We strongly recommend deleting it' : v.data?.goals?.[0]?.child?.person?.name,
    },
    {
      field: 'name',
      headerName: 'Activity',
      type: 'long',
      onCellValueChanged: this.onCellValueChange,
    },
    {
      field: 'field.name',
      headerName: 'Field',
      type: 'enum',
      // filterParams: assigned on init
    },
    {
      field: 'createdDatetime',
      headerName: 'Created Date',
      type: 'fromNow',
      onCellValueChanged: this.onCellValueChange,
    },
  ];

  private menuItems: MyMenuItem<IActivityEntity>[] = [
    {
      name: 'Delete',
      icon: `<mat-icon _ngcontent-glk-c62="" color="warn" role="img" class="mat-icon notranslate mat-warn material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">delete</mat-icon>`,
      action: (v) => this.deleteDialog(v),
      tooltip: 'Delete the selected field',
      disabled: !this.canEdit,
    },
  ];

  constructor(public service: ActivityService, public ut: UtilityService,
    private dialog: MatDialog, public agGrid: AgGridService, private fieldService: FieldService) {
  }

  ngOnInit(): void {
    this.fieldService.fields.subscribe(v => {
      let col = this.gridOptions.api?.getColumnDef('field.name');
      if (col)
        col.filterParams = { values: v.map(n => n.name) }
    });
    this.service.specialActivities.subscribe(v => this.rowData = v.map(n => ({ ...n })));
    this.ut.user.subscribe(v => {
      this.canEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
    });
  }

  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }

  printTable = () => {//should be arrow function. Because it's called inside gridOption object
    let isAuto = this.gridOptions.paginationAutoPageSize;
    this.gridOptions.paginationAutoPageSize = false
    let size = this.gridOptions.paginationPageSize;
    this.gridOptions.paginationPageSize = 1000;
    this.isPrinting = true;
    this.gridOptions.api?.setDomLayout('print');
    this.gridOptions.api?.setSideBarVisible(false)
    this.gridOptions.api?.redrawRows();
    setTimeout(() => print(), 2000);
    setTimeout(() => {
      this.isPrinting = false;
      this.gridOptions.paginationAutoPageSize = isAuto;
      this.gridOptions.paginationPageSize = size;
      this.gridOptions.api?.setSideBarVisible(true)
      this.gridOptions.api?.refreshCells();
      this.gridOptions.api?.setDomLayout('autoHeight');
    }, 3000);
  }

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IActivityEntity> = {
    ...this.agGrid.commonGridOptions('fields table', this.columnDefs, this.canEdit,
      this.menuItems, this.printTable, (item) => { this.edit(item) },
      (e) => e.api.sizeColumnsToFit()
    ),
    onRowClicked: (v) => this.selectedItem = v.data,
  }

  /** `data` is Activity to be Edit. */
  edit(data?: IActivityEntity) {
    if (typeof data != 'object' && typeof data != 'number')
      this.ut.errorDefaultDialog(undefined);
    else
      this.dialog
        .open<AddEditActivityComponent, IActivityEntity | number, 'edited' | 'added' | null>(AddEditActivityComponent, { data })
  }

  deleteDialog(activity: IActivityEntity | undefined) {
    if (activity == null)
      this.ut.showSnackbar(undefined);
    else
      this.ut.showMsgDialog({
        content: this.ut.translate('You are about to delete the activity: \"') + activity.name + this.ut.translate("\" permanently. NOTE: You won't be able to delete the activity if there is a child with at least one goal that depends on this activity."),
        type: 'confirm',
        buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
      }).afterClosed().subscribe(async (v) => {
        if (v === 'Delete') {
          try {
            await this.service.deleteInSpecialActivities(activity.id, true);
            this.ut.showSnackbar('The activity has been deleted successfully.');
          } catch (e) { }
        }
      });
  }
}
