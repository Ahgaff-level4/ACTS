import { Component } from '@angular/core';
import { IEvaluationEntity, IGoalEntity } from '../../../../../../interfaces';
import { EvaluationService } from 'src/app/services/CRUD/evaluation.service';
import { DisplayService } from 'src/app/services/display.service';
import { ActivatedRoute } from '@angular/router';
import { AddEditEvaluationComponent } from '../../dialogs/add-edit/add-edit-evaluation/add-edit-evaluation.component';
import { ColDef, GridOptions, ISetFilterParams, NewValueParams } from 'ag-grid-community';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent extends UnsubOnDestroy {
  public selectedItem?: IEvaluationEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;

  private onCellValueChange = async (e: NewValueParams<IEvaluationEntity>) => {
    try {
      await this.service.patch(e.data.id, { [e.colDef.field as keyof IEvaluationEntity]: e.newValue });
      this.nt.notify('Edited successfully', undefined, 'success')
    } catch (e) {
      if (this.service.goalItsEvaluations$.value)
        await this.service.fetchGoalItsEvaluations(this.service.goalItsEvaluations$.value.id).catch(() => { });
      this.gridOptions?.api?.refreshCells()
      this.gridOptions?.api?.redrawRows();
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
        valueFormatter: v => v.value == 'continual' ? this.display.translate('Continual') : this.display.translate('Excellent'),
      } as ISetFilterParams<IGoalEntity, string>,
      valueGetter: (v) => v.data?.rate == 'excellent' ? this.display.translate('Excellent') : this.display.translate('Continual'),
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
      disabled: !this.pr.canUser('deleteEvaluation'),
    },
  ];



  constructor(public service: EvaluationService, private display: DisplayService,
    private route: ActivatedRoute, private nt: NotificationService,
    public agGrid: AgGridService, public pr: PrivilegeService) {
    super();
  }



  async ngOnInit() {
    try {
      let goalId = await this.display.getRouteParamId(this.route);
      this.service.fetchGoalItsEvaluations(goalId);
    } catch (e) {
      this.nt.errorDefaultDialog(undefined, "Sorry, there was a problem fetching the goal's evaluations. Please try again later or check your connection.");
    }

  }

  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }

  printTable() {
    this.agGrid.printTable(this.gridOptions, v => this.isPrinting = v);
  }

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IEvaluationEntity> = {
    ...this.agGrid.commonGridOptions('evaluations table', this.columnDefs, this.pr.canUser('editEvaluation'),
      this.menuItems, this.printTable, (item) => { this.addEdit(item) },
    ),
    onSelectionChanged: (e) => this.selectedItem = e.api.getSelectedRows()[0] ?? undefined,
  }

  /** @param data is either a evaluation to be Edit. Or goalId to be Add */
  addEdit(data?: IEvaluationEntity | number) {
    if (typeof data != 'object' && typeof data != 'number')
      this.nt.notify(undefined);
    else
      this.nt
        .openDialog<AddEditEvaluationComponent, IEvaluationEntity | number, 'edited' | 'added' | null>(AddEditEvaluationComponent, data);
  }

  deleteDialog(evaluation?: IEvaluationEntity) {
    if (evaluation == null)
      this.nt.notify(undefined);
    else
      this.nt.showMsgDialog({
        content: this.display.translate('You are about to delete the evaluation with description: \"') + evaluation.description + this.display.translate("\" permanently."),
        type: 'confirm',
        buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
      }).afterClosed().subscribe(async (v) => {
        if (v === 'Delete') {
          try {
            await this.service.delete(evaluation.id, true);
            this.nt.notify("Deleted successfully", 'The evaluation has been deleted successfully', 'success');
          } catch (e) { }
        }
      })
  }
}
