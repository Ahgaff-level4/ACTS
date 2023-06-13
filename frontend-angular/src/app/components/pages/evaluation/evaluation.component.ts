import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IEvaluationEntity, IGoalEntity } from '../../../../../../interfaces';
import { Subscription } from 'rxjs';
import { EvaluationService } from 'src/app/services/evaluation.service';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddEditEvaluationComponent } from '../../dialogs/add-edit/add-edit-evaluation/add-edit-evaluation.component';
import { ColDef, GridOptions, ISetFilterParams, NewValueParams } from 'ag-grid-community';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent {
  public canAdd: boolean = this.ut.userHasAny('Admin', 'Teacher');
  public canEditDelete: boolean = this.ut.userHasAny('Admin', 'Teacher', 'HeadOfDepartment');
  public selectedItem?: IEvaluationEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;
  /**don't use `rowData` 'cause child has goals for `rowData`*/
  public goalItsEvaluations: IGoalEntity | undefined;
  private sub: Subscription = new Subscription();

  private onCellValueChange = async (e: NewValueParams<IEvaluationEntity>) => {
    try {
      await this.service.patch(e.data.id, { [e.colDef.field as keyof IEvaluationEntity]: e.newValue });
      this.ut.notify('Edited successfully', undefined, 'success')
    } catch (e) {
      if (this.goalItsEvaluations)
        await this.service.fetchGoalItsEvaluations(this.goalItsEvaluations.id).catch(() => { });
      this.gridOptions?.api?.refreshCells();
    }
  }

  /**
* @see [ag-grid.service](./../../../services/ag-grid.service.ts) for more information of how to set the columnDef properties.
*/
  public columnDefs: (ColDef<IEvaluationEntity>)[] = [
    {
      field: 'description',
      headerName: 'Description of how performed the goal',
      type: 'long',
      onCellValueChanged: this.onCellValueChange,
    },
    {
      field: 'rate',
      headerName: 'Rate',
      type: 'enum',
      filterParams: {
        values: ['continual', 'excellent'],
        valueFormatter: v => v.value == 'continual' ? this.ut.translate('Continual') : this.ut.translate('Excellent'),
      } as ISetFilterParams<IGoalEntity, string>,
      valueGetter: (v) => v.data?.rate == 'excellent' ? this.ut.translate('Excellent') : this.ut.translate('Continual'),
    },
    {
      field: 'mainstream',
      headerName: 'Mainstream',
      type: 'long',//filterParams in init
      onCellValueChanged: this.onCellValueChange,
    },
    {
      field: 'note',
      headerName: 'Note',
      type: 'long',
      onCellValueChanged: this.onCellValueChange,
    },
    {
      field: 'evaluationDatetime',
      headerName: 'Assign Date',
      type: 'fromNow',
    },
    {
      field: 'teacher.person.name',
      headerName: 'By Teacher',
      type: 'long',
    },
  ];

  private menuItems: MyMenuItem<IEvaluationEntity>[] = [
    {
      name: 'Delete',
      icon: `<mat-icon _ngcontent-glk-c62="" color="warn" role="img" class="mat-icon notranslate mat-warn material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">delete</mat-icon>`,
      action: (v) => this.deleteDialog(v),
      tooltip: 'Delete the selected evaluation',
      disabled: !this.canEditDelete,
    },
  ];



  constructor(public service: EvaluationService, public ut: UtilityService,
    private dialog: MatDialog, private route: ActivatedRoute,
    public agGrid: AgGridService) {
  }



  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: async params => {
        let goalId = params.get('id');
        if (typeof goalId === 'string')
          this.sub.add(this.service.goalItsEvaluations.subscribe(async v => {
            if (v && v.id == +(goalId as string))
              this.goalItsEvaluations = this.ut.deepClone(v);
            else await this.service.fetchGoalItsEvaluations(+(goalId as string));
          }));
        else this.ut.errorDefaultDialog(undefined, "Sorry, there was a problem fetching the goal's evaluations. Please try again later or check your connection.");
      },
    });

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
  public gridOptions: GridOptions<IEvaluationEntity> = {
    ...this.agGrid.commonGridOptions('evaluations table', this.columnDefs, this.canEditDelete,
      this.menuItems, this.printTable, (item) => { this.addEdit(item) },
    ),
    onRowClicked: (v) => this.selectedItem = v.data,
  }

  /** @param data is either a evaluation to be Edit. Or goalId to be Add */
  addEdit(data?: IEvaluationEntity | number) {
    if (typeof data != 'object' && typeof data != 'number')
      this.ut.errorDefaultDialog(undefined);
    else
      this.dialog
        .open<AddEditEvaluationComponent, IEvaluationEntity | number, 'edited' | 'added' | null>(AddEditEvaluationComponent, { data, direction: this.ut.getDirection() });
  }

  deleteDialog(evaluation?: IEvaluationEntity) {
    if (evaluation == null)
      this.ut.notify(undefined);
    else
      this.ut.showMsgDialog({
        content: this.ut.translate('You are about to delete the evaluation with description: \"') + evaluation.description + this.ut.translate("\" permanently."),
        type: 'confirm',
        buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
      }).afterClosed().subscribe(async (v) => {
        if (v === 'Delete') {
          try {
            await this.service.delete(evaluation.id, true);
            this.ut.notify("Deleted successfully", 'The evaluation has been deleted successfully', 'success');
          } catch (e) { }
        }
      })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
