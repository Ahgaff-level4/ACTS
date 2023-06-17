import { Component, OnDestroy } from '@angular/core';
import { IChildEntity, IEvaluationEntity, IGoalEntity } from '../../../../../../interfaces';
import { Subscription, first } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from 'src/app/services/utility.service';
import { GoalService } from 'src/app/services/CRUD/goal.service';
import { AddEditGoalComponent } from '../../dialogs/add-edit/add-edit-goal/add-edit-goal.component';
import { AddEditEvaluationComponent } from '../../dialogs/add-edit/add-edit-evaluation/add-edit-evaluation.component';
import { ColDef, GridOptions, ICellRendererParams, ISetFilterParams, NewValueParams } from 'ag-grid-community';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { FieldService } from 'src/app/services/CRUD/field.service';
import { ProgramService } from 'src/app/services/CRUD/program.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';

@Component({
  selector: 'app-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.scss']
})
export class GoalComponent extends UnsubOnDestroy implements OnDestroy {
  public canAdd: boolean = this.ut.userHasAny('Admin', 'Teacher');
  public canEditDelete: boolean = this.ut.userHasAny('Admin', 'Teacher', 'HeadOfDepartment');
  public selectedItem?: IGoalEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;

  private onCellValueChange = async (e: NewValueParams<IGoalEntity>) => {
    try {
      await this.service.patch(e.data.id, { [e.colDef.field as keyof IGoalEntity]: e.newValue });
      this.ut.notify('Edited successfully', undefined, 'success')
    } catch (e) {
      if (this.service.childItsGoals$.value)
        await this.service.fetchChildItsGoals(this.service.childItsGoals$.value.id).catch(() => { });
      this.gridOptions?.api?.refreshCells();
    }
  }

  /**
* @see [ag-grid.service](./../../../services/ag-grid.service.ts) for more information of how to set the columnDef properties.
  */
  public columnDefs: (ColDef<IGoalEntity>)[] = [
    {
      field: 'activity.name',
      headerName: 'Goal',
      type: 'long',
    },
    {
      field: 'activity.program.name',
      headerName: 'Program',
      type: 'enum',//filterParams in init
      valueGetter: (v) => v.data?.activity?.program?.name ?? this.ut.translate('«Special activity»'),
    },
    {
      field: 'activity.field.name',
      headerName: 'Field',
      type: 'enum',//filterParams in init
    },
    {
      field: 'completed',//not property of Goal
      headerName: 'Completed',
      type: ['enum', 'madeUp'],
      filterParams: {
        values: ['Checked', 'Unchecked'],
        valueFormatter: v => this.ut.translate(v.value),
      } as ISetFilterParams<IGoalEntity, string>,
      cellRenderer: function (params: ICellRendererParams<IGoalEntity>) {
        if (params.data?.state == 'completed')
          return '<div class="d-flex justify-content-center mt-2"><mat-icon _ngcontent-xxc-c62="" role="img" class="mat-icon notranslate  material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">done</mat-icon></div>';
        return '';
      },
      valueGetter: v => v.data?.state == 'completed' ? 'Checked' : 'Unchecked',
      valueFormatter: v => this.ut.translate(v.value),
    },
    {
      field: 'continual',//not property of Goal
      headerName: 'Continual',
      type: ['enum', 'madeUp'],
      filterParams: {
        values: ['Checked', 'Unchecked'],
        valueFormatter: v => this.ut.translate(v.value),
      } as ISetFilterParams<IGoalEntity, string>,
      cellRenderer: function (params: ICellRendererParams<IGoalEntity>) {
        if (params.data?.state == 'continual')
          return '<div class="d-flex justify-content-center mt-2"><mat-icon _ngcontent-xxc-c62="" role="img" class="mat-icon notranslate  material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">done</mat-icon></div>';
        return '';
      },
      valueGetter: v => v.data?.state == 'continual' ? 'Checked' : 'Unchecked',
      valueFormatter: v => this.ut.translate(v.value),
      // cellRenderer: '<mat-icon _ngcontent-xxc-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">done</mat-icon>',
    },
    {
      field: 'state',//not property of Goal
      headerName: 'State',
      valueFormatter: v => this.ut.translate(v.value),
      type: 'enum',
      filterParams: {
        values: ['continual', 'completed'],
        valueFormatter: v => v.value == 'continual' ? this.ut.translate('Continual') : this.ut.translate('Completed'),
      } as ISetFilterParams<IGoalEntity, string>,
      hide: true,
    },
    {
      field: 'note',
      headerName: 'Note',
      type: 'long',
      onCellValueChanged: this.onCellValueChange,
    },
    {
      field: 'assignDatetime',
      headerName: 'Assign Date',
      type: 'fromNow',
    },
    {
      field: 'teacher.person.name',
      headerName: 'By Teacher',
      type: 'long',
    },
  ];

  private menuItems: MyMenuItem<IGoalEntity>[] = [
    {
      name: 'Evaluate',
      icon: `<mat-icon _ngcontent-tvg-c62="" color="primary" role="img" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">rate_review</mat-icon>`,
      action: (v) => this.evaluate(v?.id),
      tooltip: 'Evaluate the selected goal',
    },
    {
      name: 'Evaluations',
      icon: `<mat-icon _ngcontent-tvg-c62="" color="primary" role="img" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">reviews</mat-icon>`,
      action: (v) => v && this.service.childItsGoals$.value ? this.ut.router.navigateByUrl('/child/' + this.service.childItsGoals$.value.id + '/goal/' + v.id + '/evaluations') : '',
      tooltip: 'View evaluations of the selected goal',
    },
    {
      name: 'Delete',
      icon: `<mat-icon _ngcontent-glk-c62="" color="warn" role="img" class="mat-icon notranslate mat-warn material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">delete</mat-icon>`,
      action: (v) => this.deleteDialog(v),
      tooltip: 'Delete the selected goal',
      disabled: !this.canEditDelete,
    },
  ];


  constructor(public service: GoalService, public ut: UtilityService,
    private dialog: MatDialog, private route: ActivatedRoute, public agGrid: AgGridService,
    private fieldService: FieldService, private programService: ProgramService) {
    super();
  }



  async ngOnInit() {
    try {
      let childId = await this.ut.getRouteParamId(this.route);
      await this.service.fetchChildItsGoals(childId, true).catch(() => { });
    } catch (e) {
      this.ut.errorDefaultDialog(undefined, "Sorry, there was a problem fetching the child's goals. Please try again later or check your connection.")
    }

    this.sub.add(this.fieldService.fields$.subscribe(v => {
      let col = this.gridOptions.api?.getColumnDef('activity.field.name');
      if (col)
        col.filterParams = { values: v.map(n => n.name) }
    }));

    this.sub.add(this.programService.programs$.subscribe(v => {
      let col = this.gridOptions.api?.getColumnDef('activity.program.name');
      if (col)
        col.filterParams = { values: [...v.map(n => n.name), this.ut.translate('«Special activity»')] };
    }));

    this.sub.add(this.ut.user.subscribe(v => {
      this.canAdd = this.ut.userHasAny('Admin', 'Teacher');
      this.canEditDelete = this.ut.userHasAny('Admin', 'Teacher', 'HeadOfDepartment');
    }));
  }

  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }

  printTable() {
    this.agGrid.printTable(this.gridOptions, v => this.isPrinting = v);
  }

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IGoalEntity> = {
    ...this.agGrid.commonGridOptions('goals table', this.columnDefs, this.canEditDelete,
      this.menuItems, this.printTable, (item) => { this.addEdit(item) },
      (e) => {
        // e.api.getFilterInstance('state')?.setModel({ values: ['continual'] });
      }
    ),
    onRowClicked: (v) => this.selectedItem = v.data,
  }


  /** @param goalOrChildId is either a goal to be Edit. Or childId to be Add */
  addEdit(goalOrChildId?: IGoalEntity | number) {
    if (typeof goalOrChildId != 'object' && typeof goalOrChildId != 'number')
      this.ut.errorDefaultDialog(undefined);
    else
      this.dialog
        .open<AddEditGoalComponent, IGoalEntity | number, 'edited' | 'added' | null>(AddEditGoalComponent, { data: goalOrChildId, direction: this.ut.getDirection() })
        .afterClosed().subscribe(v => {
          // if (v === 'added' || v === 'edited')//has been
          // this.fetch(); we don't need fetch child's goals; goalService will fetch when added/edited
        });
  }

  deleteDialog(goal: IGoalEntity | undefined) {
    if (goal == null)
      this.ut.notify(undefined);
    else
      this.ut.showMsgDialog({
        content: this.ut.translate('You are about to delete the goal: \"') + goal.activity.name + this.ut.translate("\" permanently. If the child has finished the goal then edit the goal state as completed. NOTE: all evaluations of this goal will also be deleted permanently."),
        type: 'confirm',
        buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
      }).afterClosed().subscribe(async (v) => {
        if (v === 'Delete') {
          try {
            await this.service.delete(goal.id, true);
            this.ut.notify("Deleted successfully", 'The goal has been deleted successfully', 'success');
          } catch (e) { }
        }
      })
  }

  evaluate(goalId: number | undefined) {
    if (goalId == null)
      this.ut.notify(undefined);
    else
      this.dialog
        .open<AddEditEvaluationComponent, IEvaluationEntity | number, 'edited' | 'added' | null>(AddEditEvaluationComponent, { data: goalId, direction: this.ut.getDirection() });
  }

}
