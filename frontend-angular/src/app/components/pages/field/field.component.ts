import { Component } from '@angular/core';
import { IFieldEntity } from '../../../../../../interfaces';
import { FieldService } from 'src/app/services/CRUD/field.service';
import { DisplayService } from 'src/app/services/display.service';
import { AddEditFieldComponent } from '../../dialogs/add-edit/add-edit-field/add-edit-field.component';
import { ColDef, GridApi, GridOptions, NewValueParams } from 'ag-grid-community';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent extends UnsubOnDestroy {
  public selectedItem?: IFieldEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;
  public rowData = this.service.fields$;

  private onCellValueChange = async (e: NewValueParams<IFieldEntity>) => {
    try {
      await this.service.patch(e.data.id, { [e.colDef.field as keyof IFieldEntity]: e.newValue });
      this.nt.notify('Edited successfully', undefined, 'success')
    } catch (e) {
      this.service.fetch();
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
      disabled: !this.pr.canUser('deleteField'),
    },
  ];

  constructor(private service: FieldService, private display: DisplayService, private nt: NotificationService,
    public agGrid: AgGridService, public pr: PrivilegeService, private route:ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.service.fetch(true);
  }

  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }

  printTable() {
    this.agGrid.printTable(this.gridOptions, v => this.isPrinting = v);
  }

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IFieldEntity> = {
    ...this.agGrid.commonGridOptions('fields table', this.columnDefs, this.pr.canUser('editField'),
      this.menuItems, this.printTable, (item) => { this.addEdit(item) },
      (e) => {
        e.api.sizeColumnsToFit();
        this.agGrid.filterBaseOnURL(this.columnDefs, this.route.snapshot.queryParams, this.gridOptions.api as GridApi<any>)

      }
    ),
    onSelectionChanged: (e) => this.selectedItem = e.api.getSelectedRows()[0] ?? undefined,
  }

  /** if `data` param passed then it is Edit. Otherwise will be Add */
  addEdit(data?: IFieldEntity) {
    this.nt
      .openDialog(AddEditFieldComponent, data);
  }

  deleteDialog(field: IFieldEntity | undefined) {
    if (field == null)
      this.nt.notify(undefined);
    else
      this.nt.showMsgDialog({
        content: this.display.translate('You are about to delete the field: ') + field.name + this.display.translate(' permanently. Any existing activity that has this field will no longer have it, and will have empty field instead!'),
        type: 'confirm',
        buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
      }).afterClosed().subscribe(async (v) => {
        if (v === 'Delete') {
          try {
            await this.service.delete(field.id, true);
            this.nt.notify("Deleted successfully", 'The field has been deleted successfully', 'success');
          } catch (e) { }
        }
      });
  }
}
