import { Component, OnDestroy } from '@angular/core';
import { IActivityEntity } from '../../../../../../interfaces';
import { ActivityService } from 'src/app/services/CRUD/activity.service';
import { DisplayService } from 'src/app/services/display.service';
import { AddEditActivityComponent } from '../../dialogs/add-edit/add-edit-activity/add-edit-activity.component';
import { ColDef, GridOptions, NewValueParams } from 'ag-grid-community';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { FieldService } from 'src/app/services/CRUD/field.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-special-activity',
  templateUrl: './special-activity.component.html',
  styleUrls: ['./special-activity.component.scss']
})
export class SpecialActivityComponent extends UnsubOnDestroy implements OnDestroy {
  public selectedItem?: IActivityEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;
  public rowData: IActivityEntity[] | undefined;

  private onCellValueChange = async (e: NewValueParams<IActivityEntity>) => {
    try {
      await this.service.patchInSpecialActivities(e.data.id, { [e.colDef.field as keyof IActivityEntity]: e.newValue });
      this.nt.notify('Edited successfully', undefined, 'success')
    } catch (e) {
      await this.service.fetchSpecialActivities();
      this.gridOptions?.api?.refreshCells()
      this.gridOptions?.api?.redrawRows();
    }
  }

  /**
* @see [ag-grid.service](./../../../services/ag-grid.service.ts) for more information of how to set the columnDef properties.
  */
  public columnDefs: (ColDef<IActivityEntity>)[] = [
    {
      field: 'goals.0.child.person.name',
      headerName: "child's name",//headerName will be translated
      type: 'long',
      tooltipValueGetter: v => v.data?.goals?.length == 0 ? this.display.translate('This activity is not bind to any child! We strongly recommend deleting it') : v.data?.goals?.[0]?.child?.person?.name,
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
    },
  ];

  private menuItems: MyMenuItem<IActivityEntity>[] = [
    {
      name: 'Delete',
      icon: `<mat-icon _ngcontent-glk-c62="" color="warn" role="img" class="mat-icon notranslate mat-warn material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">delete</mat-icon>`,
      action: (v) => this.deleteDialog(v),
      tooltip: 'Delete the selected field',
      disabled: !this.pr.canUser('deleteActivity'),
    },
  ];

  constructor(public service: ActivityService, private display: DisplayService,
    public agGrid: AgGridService, private fieldService: FieldService,
    public pr: PrivilegeService, private nt: NotificationService,) {
    super();
  }

  ngOnInit(): void {
    this.sub.add(this.fieldService.fields$.subscribe(v => {
      let col = this.gridOptions.api?.getColumnDef('field.name');
      if (col)
        col.filterParams = { values: v.map(n => n.name) }
    }));
    this.service.fetchSpecialActivities(true);
    this.sub.add(this.service.specialActivities$.subscribe(v => {
      if (v)
        this.rowData =  JSON.parse(JSON.stringify(v));
    }))
  }

  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }

  printTable() {
    this.agGrid.printTable(this.gridOptions, v => this.isPrinting = v);
  }

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IActivityEntity> = {
    ...this.agGrid.commonGridOptions('special activities table', this.columnDefs, this.pr.canUser('editActivity'),
      this.menuItems, this.printTable, (item) => { this.edit(item) },
      (e) => e.api.sizeColumnsToFit()
    ),
    onSelectionChanged: (e) => this.selectedItem = e.api.getSelectedRows()[0] ?? undefined,
  }

  /** `data` is Activity to be Edit. */
  edit(data?: IActivityEntity) {
    if (typeof data != 'object' && typeof data != 'number')
      this.nt.notify(undefined);
    else
      this.nt
        .openDialog<AddEditActivityComponent, IActivityEntity | number, 'edited' | 'added' | null>(AddEditActivityComponent, data)
  }

  deleteDialog(activity: IActivityEntity | undefined) {
    if (activity == null)
      this.nt.notify(undefined);
    else
      this.nt.showMsgDialog({
        content: this.display.translate('You are about to delete the activity: \"') + activity.name + this.display.translate("\" permanently. NOTE: You won't be able to delete the activity if there is a child with at least one goal that depends on this activity."),
        type: 'confirm',
        buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
      }).afterClosed().subscribe(async (v) => {
        if (v === 'Delete') {
          try {
            await this.service.deleteInSpecialActivities(activity.id, true);
            this.nt.notify("Deleted successfully", 'The activity has been deleted successfully', 'success');
          } catch (e) { }
        }
      });
  }
}
