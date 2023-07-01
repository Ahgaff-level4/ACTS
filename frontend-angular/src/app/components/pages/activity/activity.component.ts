import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IActivityEntity, IFieldEntity, IProgramEntity } from '../../../../../../interfaces';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivityService } from 'src/app/services/CRUD/activity.service';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ProgramService } from 'src/app/services/CRUD/program.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddEditActivityComponent } from '../../dialogs/add-edit/add-edit-activity/add-edit-activity.component';
import { ColDef, GridOptions, NewValueParams } from 'ag-grid-community';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { FieldService } from 'src/app/services/CRUD/field.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TitleLink } from '../../static/title/title.component';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent extends UnsubOnDestroy implements OnDestroy {
  public selectedItem?: IActivityEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;
  /**don't use `rowData` 'cause Program has activities of `rowData`*/
  // public program: IProgramEntity | undefined;
  public rowData: IActivityEntity[] | undefined;
  /**Activities of either a program or field */
  public activitiesOf: 'field' | 'program' | undefined;

  private onCellValueChange = async (e: NewValueParams<IActivityEntity>) => {
    try {
      await this.service.patchInSpecialActivities(e.data.id, { [e.colDef.field as keyof IActivityEntity]: e.newValue });
      this.nt.notify('Edited successfully', undefined, 'success')
    } catch (e) {
      if (this.activitiesOf == 'program' && this.service.programItsActivities$.value)
        await this.service.fetchProgramItsActivities(this.service.programItsActivities$.value.id).catch(() => { });
      else if (this.activitiesOf == 'field' && this.service.fieldItsActivities$.value)
        await this.service.fetchFieldItsActivities(this.service.fieldItsActivities$.value.id).catch(() => { })
      else console.trace('unexpected reach here!');
      this.gridOptions?.api?.refreshCells()
      this.gridOptions?.api?.redrawRows();
    }
  }

  /**
* @see [ag-grid.service](./../../../services/ag-grid.service.ts) for more information of how to set the columnDef properties.
  */
  public columnDefs: (ColDef<IActivityEntity>)[] = [
    {
      field: 'name',
      headerName: 'Activity',
      type: 'long',
      onCellValueChanged: this.onCellValueChange,
    },
    {
      field: 'ageRange',
      headerName: 'Age Range',
      type: ['long', 'madeUp'],
      valueGetter: (v) => typeof v.data?.minAge == 'number' && typeof v.data?.maxAge == 'number' ? (v.data.minAge + '–' + v.data.maxAge) : '',
    },
    {
      field: 'minAge',
      headerName: 'Minimum age',
      type: 'number',
      onCellValueChanged: this.onCellValueChange,
      hide: true,
    },
    {
      field: 'maxAge',
      headerName: 'Maximum age',
      type: 'number',
      onCellValueChanged: this.onCellValueChange,
      hide: true,
    },
    {
      field: 'field.name',
      headerName: 'Field',
      type: 'enum',
      // filterParams: assigned on init
    },
    {
      field: 'program.name',
      headerName: 'Program',
      type: 'enum',
      valueGetter: (v) => v.data?.program?.name ?? this.ut.translate('«Special activity»'),
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
      tooltip: 'Delete the selected activity',
      disabled: !this.pr.canUser('deleteActivity'),
    },
  ];


  constructor(public service: ActivityService, public ut: UtilityService,
    private route: ActivatedRoute, private nt: NotificationService,
    private fieldService: FieldService, public agGrid: AgGridService,
    public pr: PrivilegeService, private programService: ProgramService,) {
    super();
  }



  ngOnInit(): void {
    this.ut.isLoading.next(true);
    this.route.paramMap.subscribe({
      next: async params => {
        let programOrField = params.get('programOrField');
        let id = params.get('id');
        if (typeof id == 'string' && (programOrField == 'field' || programOrField == 'program')) {
          this.activitiesOf = programOrField;
          this.columnDefs.splice(this.activitiesOf == 'program' ? this.columnDefs.map(v => v.field).indexOf('program.name') : this.columnDefs.map(v => v.field).indexOf('field.name'), 1);
          this.gridOptions.api?.setColumnDefs(this.columnDefs);
          if (this.activitiesOf == 'program')
            this.sub.add(this.service.programItsActivities$.subscribe(async v => {
              if (v && v.id == +(id as string)) {
                this.rowData = this.ut.deepClone(v.activities);
              }
              else await this.service.fetchProgramItsActivities(+(id as string), true).catch(() => { });
            }));
          else this.sub.add(this.service.fieldItsActivities$.subscribe(async v => {
            if (v && v.id == +(id as string))
              this.rowData = this.ut.deepClone(v.activities);
            else await this.service.fetchFieldItsActivities(+(id as string), true).catch(() => { })
          }));
        } else {
          this.nt.errorDefaultDialog("Sorry, there was a problem fetching the activities. Please try again later or check your connection.");
          this.ut.router.navigateByUrl('/404');
        }
        this.ut.isLoading.next(false);
      }, error: () => this.ut.isLoading.next(false)
    });

    this.sub.add(this.fieldService.fields$.subscribe(v => {
      let col = this.gridOptions.api?.getColumnDef('field.name');
      if (col)
        col.filterParams = { values: v.map(n => n.name) }
    }));
    this.sub.add(this.programService.programs$.subscribe(v => {
      let col = this.gridOptions.api?.getColumnDef('program.name');
      if (col)
        col.filterParams = { values: v.map(n => n.name) }
    }));
  }

  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }

  printTable() {
    this.agGrid.printTable(this.gridOptions, v => this.isPrinting = v);
  }

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IActivityEntity> = {
    ...this.agGrid.commonGridOptions('activities table', this.columnDefs, this.pr.canUser('editActivity'),
      this.menuItems, this.printTable, (item) => { this.addEdit(item) },
      (e) => {
        e.api.sizeColumnsToFit();
      }
    ),
    onSelectionChanged: (e) => this.selectedItem = e.api.getSelectedRows()[0] ?? undefined,
  }

  /** `data` is either Activity to be Edit. Or programId to be Add */
  addEdit(data?: IActivityEntity | number) {
    if (typeof data != 'object' && typeof data != 'number')
      this.nt.notify(undefined);
    else
      this.nt
        .openDialog<AddEditActivityComponent, IActivityEntity | number, 'edited' | 'added' | null>(AddEditActivityComponent, data);
  }

  deleteDialog(activity: IActivityEntity | undefined) {
    if (activity == null)
      this.nt.notify(undefined);
    else
      this.nt.showMsgDialog({
        content: this.ut.translate('You are about to delete the activity: \"') + activity.name + this.ut.translate("\" permanently. NOTE: You won't be able to delete the activity if there is a child with at least one goal that depends on this activity."),
        type: 'confirm',
        buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
      }).afterClosed().subscribe(async (v) => {
        if (v === 'Delete') {
          try {
            if (typeof activity.programId == 'number')
              await this.service.deleteInProgramItsActivities(activity.id, true);
            else
              await this.service.deleteInSpecialActivities(activity.id, true);
            this.nt.notify("Deleted successfully", 'The activity has been deleted successfully', 'success');
          } catch (e) { }
        }
      });
  }

}
