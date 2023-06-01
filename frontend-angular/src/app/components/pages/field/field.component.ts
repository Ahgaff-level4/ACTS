import { Component, OnDestroy, OnInit } from '@angular/core';
import { IFieldEntity } from '../../../../../../interfaces';
import { FieldService } from 'src/app/services/field.service';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { AddEditFieldComponent } from '../../dialogs/add-edit/add-edit-field/add-edit-field.component';
import { ColDef, GridOptions, NewValueParams } from 'ag-grid-community';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { Subscription, first } from 'rxjs';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent implements OnInit, OnDestroy {
  public canAddEdit: boolean = this.ut.userHasAny('Admin', 'HeadOfDepartment');
  public selectedItem?: IFieldEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;
  public rowData: IFieldEntity[] | undefined;
  public sub: Subscription = new Subscription();

  private onCellValueChange = async (e: NewValueParams<IFieldEntity>) => {
    try {
      await this.service.patch(e.data.id, { [e.colDef.field as keyof IFieldEntity]: e.newValue });
      this.ut.notify('Edited successfully',undefined,'success')
    } catch (e) {
      this.sub.add(this.service.fields.subscribe(v => {
        this.rowData = this.ut.deepClone(v);
        this.gridOptions.api?.setRowData(this.rowData);
      }));
    }
  }

  /**
* @see [ag-grid.service](./../../../services/ag-grid.service.ts) for more information of how to set the columnDef properties.
  */
  public columnDefs: (ColDef<IFieldEntity>)[] = [
    {
      field: 'name',
      headerName: 'Field name',//headerName will be translated
      type: 'long',
      onCellValueChanged: this.onCellValueChange,
    },
    {
      field: 'activityCount',
      headerName: 'Number of Activities',
      type: 'number',
    },
    {
      field: 'createdDatetime',
      headerName: 'Created Date',
      type: 'fromNow',
    },
  ];

  private menuItems: MyMenuItem<IFieldEntity>[] = [
    {
      name: 'Delete',
      icon: `<mat-icon _ngcontent-glk-c62="" color="warn" role="img" class="mat-icon notranslate mat-warn material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">delete</mat-icon>`,
      action: (v) => this.deleteDialog(v),
      tooltip: 'Delete the selected field',
      disabled: !this.canAddEdit,
    },
  ];

  constructor(private service: FieldService, public ut: UtilityService,
    private dialog: MatDialog, public agGrid: AgGridService) {
  }

  ngOnInit(): void {
    this.service.fetch();
    this.sub.add(this.service.fields.subscribe({ next: v => this.rowData = this.ut.deepClone(v) }));

    this.sub.add(this.ut.user.subscribe(v => {
      this.canAddEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
    }));
  }

  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }

  printTable() {
    this.agGrid.printTable(this.gridOptions, v => this.isPrinting = v);
  }

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IFieldEntity> = {
    ...this.agGrid.commonGridOptions('fields table', this.columnDefs, this.canAddEdit,
      this.menuItems, this.printTable, (item) => { this.addEdit(item) },
      (e) => e.api.sizeColumnsToFit()
    ),
    onRowClicked: (v) => this.selectedItem = v.data,
  }

  /** if `data` param passed then it is Edit. Otherwise will be Add */
  addEdit(data?: IFieldEntity) {
    this.dialog
      .open<AddEditFieldComponent, IFieldEntity>(AddEditFieldComponent, { data });
  }

  deleteDialog(field: IFieldEntity | undefined) {
    if (field == null)
      this.ut.notify(undefined);
    else
      this.ut.showMsgDialog({
        content: this.ut.translate('You are about to delete the field: ') + field.name + this.ut.translate(' permanently. Any existing activity that has this field will no longer have it, and will have empty field instead!'),
        type: 'confirm',
        buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
      }).afterClosed().subscribe(async (v) => {
        if (v === 'Delete') {
          try {
            await this.service.delete(field.id, true);
            this.ut.notify("Deleted successfully",'The field has been deleted successfully','success');
          } catch (e) { }
        }
      });
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
