import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IEvaluationEntity } from '../../../../../../interfaces';
import { Subscription } from 'rxjs';
import { EvaluationService } from 'src/app/services/evaluation.service';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddEditEvaluationComponent } from '../../dialogs/add-edit-evaluation/add-edit-evaluation.component';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent {
  public canAdd!: boolean;
  public canEditDelete!: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IEvaluationEntity>;
  public dataSource!: MatTableDataSource<IEvaluationEntity>;
  public columnsKeys!: string[];
  private sub: Subscription = new Subscription();

  constructor(public service: EvaluationService, public ut: UtilityService, private dialog: MatDialog, private route: ActivatedRoute) {
  }



  ngOnInit(): void {
    this.canAdd = this.ut.userHasAny('Admin', 'Teacher');
    this.canEditDelete = this.ut.userHasAny('Admin', 'Teacher', 'HeadOfDepartment');
    this.columnsKeys = JSON.parse(sessionStorage.getItem('evaluations table') ?? 'null') ?? ['description', 'rate', 'mainstream', 'evaluationDatetime', 'note', 'teacher', 'menu'];
    this.route.paramMap.subscribe({
      next: async params => {
        let goalId = params.get('id');
        if (typeof goalId === 'string')
          await this.service.fetchGoalItsEvaluations(+goalId, true).catch(() => { });
        else this.ut.errorDefaultDialog(undefined, "Sorry, there was a problem fetching the goal's evaluations. Please try again later or check your connection.");
      },
    });

    this.dataSource = new MatTableDataSource<IEvaluationEntity>();
    this.sub.add(this.service.goalItsEvaluations.subscribe({
      next: (v) => {
        if (v == null)
          return;
        this.dataSource.data = v.evaluations;
        if (this.table)
          this.table.renderRows();
      }
    }));

    this.sub.add(this.ut.user.subscribe(v => {
      this.canAdd = this.ut.userHasAny('Admin', 'Teacher');
      this.canEditDelete = this.ut.userHasAny('Admin', 'Teacher', 'HeadOfDepartment');
    }));
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator)
      this.dataSource.paginator.firstPage();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columnsKeys, event.previousIndex, event.currentIndex);
    sessionStorage.setItem('evaluations table', JSON.stringify(this.columnsKeys));
  }

  /** @param data is either a evaluation to be Edit. Or goalId to be Add */
  addEdit(data?: IEvaluationEntity | number) {
    if (typeof data != 'object' && typeof data != 'number')
      this.ut.errorDefaultDialog(undefined);
    else
      this.dialog
        .open<AddEditEvaluationComponent, IEvaluationEntity | number, 'edited' | 'added' | null>(AddEditEvaluationComponent, { data })
        .afterClosed().subscribe(v => {
          // if (v === 'added' || v === 'edited')//has been
          //    this.fetch(); we don't need fetch goal's evaluations; evaluationService will fetch when added/edited, and we've subscribed to it
        });
  }

  deleteDialog(evaluation: IEvaluationEntity) {
    this.ut.showMsgDialog({
      content: this.ut.translate('You are about to delete the evaluation with description: \"' + + "\" permanently."),
      type: 'confirm',
      buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
    }).afterClosed().subscribe(async (v) => {
      if (v === 'Delete') {
        try {
          await this.service.delete(evaluation.id, true);
          this.ut.showSnackbar('The evaluation has been deleted successfully.');
        } catch (e) { }
      }
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
