import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IChildEntity, IEvaluationEntity, IGoalEntity } from '../../../../../../interfaces';
import { Subscription, first } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from 'src/app/services/utility.service';
import { GoalService } from 'src/app/services/goal.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddEditGoalComponent } from '../../dialogs/add-edit/add-edit-goal/add-edit-goal.component';
import { AddEditEvaluationComponent } from '../../dialogs/add-edit/add-edit-evaluation/add-edit-evaluation.component';
import { ColDef, GridOptions, ISetFilterParams, NewValueParams } from 'ag-grid-community';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { FieldService } from 'src/app/services/field.service';
import { ProgramService } from 'src/app/services/program.service';

@Component({
  selector: 'app-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.scss']
})
export class GoalComponent implements OnDestroy {
  public canAdd: boolean = this.ut.userHasAny('Admin', 'Teacher');
  public canEditDelete: boolean = this.ut.userHasAny('Admin', 'Teacher', 'HeadOfDepartment');
  public selectedItem?: IGoalEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;
  /**don't use `rowData` 'cause child has goals for `rowData`*/
  public childItsGoals: IChildEntity | undefined;
  public sub: Subscription = new Subscription();

  private onCellValueChange = async (e: NewValueParams<IGoalEntity>) => {
    try {
      await this.service.patch(e.data.id, { [e.colDef.field as keyof IGoalEntity]: e.newValue });
      this.ut.showSnackbar('Edited successfully')
    } catch (e) {
      if (this.childItsGoals)
        await this.service.fetchChildItsGoals(this.childItsGoals.id).catch(() => { });
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
      type: ['long', 'madeUp'],

      // valueFormatter: 'asdf',//todo: set <mat-icon> as continual in the cell base on state property
    },
    {
      field: 'continual',//not property of Goal
      headerName: 'Continual',
      type: ['long', 'madeUp'],
      // cellRenderer: '<mat-icon _ngcontent-xxc-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">done</mat-icon>',
    },
    {
      field: 'state',//not property of Goal
      headerName: 'State',
      valueFormatter: v => v.value == 'continual' ? this.ut.translate('Continual') : this.ut.translate('Completed'),
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
      onCellValueChanged: this.onCellValueChange,
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
      action: (v) => v ? this.ut.router.navigate(['goal', v.id, 'evaluations']) : '',
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
  }



  ngOnInit(): void {
    this.route.paramMap.pipe(first()).subscribe({
      next: async params => {
        let childId = params.get('id');
        console.log('childId', childId);
        if (typeof childId == 'string')
          this.sub.add(this.service.childItsGoals.subscribe(async v => {
            if (v && v.id == +(childId as string))
              this.childItsGoals = v;
            else await this.service.fetchChildItsGoals(+(childId as string), true).catch(() => { });
          }));
        else this.ut.errorDefaultDialog("Sorry, there was a problem fetching the child's goals. Please try again later or check your connection.")
      },
    });
    this.fieldService.fields.subscribe(v => {
      let col = this.gridOptions.api?.getColumnDef('activity.field.name');
      if (col)
        col.filterParams = { values: v.map(n => n.name) }
    });
    this.programService.programs.subscribe(v => {
      let col = this.gridOptions.api?.getColumnDef('activity.program.name');
      if (col)
        col.filterParams = { values: [...v.map(n => n.name), this.ut.translate('«Special activity»')] };
    });

    this.ut.user.subscribe(v => {
      this.canAdd = this.ut.userHasAny('Admin', 'Teacher');
      this.canEditDelete = this.ut.userHasAny('Admin', 'Teacher', 'HeadOfDepartment');
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
  public gridOptions: GridOptions<IGoalEntity> = {
    ...this.agGrid.commonGridOptions('fields table', this.columnDefs, this.canEditDelete,
      this.menuItems, this.printTable, (item) => { this.addEdit(item) },
      // (e) => e.api.sizeColumnsToFit()
    ),
    onRowClicked: (v) => this.selectedItem = v.data,
  }


  /** @param goalOrChildId is either a goal to be Edit. Or childId to be Add */
  addEdit(goalOrChildId?: IGoalEntity | number) {
    if (typeof goalOrChildId != 'object' && typeof goalOrChildId != 'number')
      this.ut.errorDefaultDialog(undefined);
    else
      this.dialog
        .open<AddEditGoalComponent, IGoalEntity | number, 'edited' | 'added' | null>(AddEditGoalComponent, { data: goalOrChildId })
        .afterClosed().subscribe(v => {
          // if (v === 'added' || v === 'edited')//has been
          // this.fetch(); we don't need fetch child's goals; goalService will fetch when added/edited
        });
  }

  deleteDialog(goal: IGoalEntity | undefined) {
    if (goal == null)
      this.ut.showSnackbar(undefined);
    else
      this.ut.showMsgDialog({
        content: this.ut.translate('You are about to delete the goal: \"') + goal.activity.name + this.ut.translate("\" permanently. If the child has finished the goal then edit the goal state as competed. NOTE: all evaluations of this goal will also be deleted permanently."),
        type: 'confirm',
        buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
      }).afterClosed().subscribe(async (v) => {
        if (v === 'Delete') {
          try {
            await this.service.delete(goal.id, true);
            this.ut.showSnackbar('The goal has been deleted successfully.');
          } catch (e) { }
        }
      })
  }

  evaluate(goalId: number | undefined) {
    if (goalId == null)
      this.ut.showSnackbar(undefined);
    else
      this.dialog
        .open<AddEditEvaluationComponent, IEvaluationEntity | number, 'edited' | 'added' | null>(AddEditEvaluationComponent, { data: goalId });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
