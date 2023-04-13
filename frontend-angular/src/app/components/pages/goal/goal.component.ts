import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IChildEntity, IGoalEntity } from '../../../../../../interfaces';
import { BehaviorSubject } from 'rxjs';
import { ChildService } from 'src/app/services/child.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from 'src/app/services/utility.service';
import { GoalService } from 'src/app/services/goal.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddEditGoalComponent } from '../../dialogs/add-edit-goal/add-edit-goal.component';

@Component({
  selector: 'app-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.scss']
})
export class GoalComponent {
  public canAdd: boolean;
  public canEditDelete: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IGoalEntity>;
  public dataSource!: MatTableDataSource<IGoalEntity>;
  public columnsKeys: string[];
  public child = new BehaviorSubject<IChildEntity | null>(null);

  /**
   * - First use when init the class. The param will be passed by URL param as (string|null).
   * - Second when `Add`, `Edit`, or `Delete`. So that it will emit the new data. So, that the table will be refresh. The param will be undefined.
   */
  async fetch(childId?: number | string | null) {
    this.ut.isLoading.next(true);
    if (typeof childId === 'string')
      childId = +childId;
    if (childId || this.child.value?.id)// if First and Second cases. Else like if child.value is null and childId is null then there is something went wrong!
      this.child.next(await this.childService.fetchOne(childId ?? this.child.value?.id as number));
    else this.ut.errorDefaultDialog(undefined, "Sorry, there was a problem navigating to activities page. Please try again later or check your connection.").afterClosed().subscribe(() => this.ut.router.navigate(['/main']));
    this.ut.isLoading.next(false);
  }

  constructor(private service: GoalService, public ut: UtilityService, private dialog: MatDialog, private route: ActivatedRoute, private childService: ChildService) {
    this.canAdd = this.ut.userHasAny('Admin', 'Teacher');
    this.canEditDelete = this.ut.userHasAny('Admin', 'Teacher', 'HeadOfDepartment');
    this.columnsKeys = JSON.parse(sessionStorage.getItem('goals table') ?? 'null') ?? ['field', 'goal', 'completed', 'continual', 'assignDatetime', 'note', 'control'];
    this.ut.isLoading.next(true);
    this.route.paramMap.subscribe({
      next: async params => {
        let childId = params.get('id');
        await this.fetch(childId);
        this.ut.isLoading.next(false);
      }, error: () => this.ut.isLoading.next(false)
    });
  }



  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<IGoalEntity>();
    this.child.subscribe((v) => {
      if (v == null)
        return;
      this.dataSource.data = v.goals;
      if (this.table)
        this.table.renderRows();
    });
    this.ut.user.subscribe(v => {
      this.canAdd = this.ut.userHasAny('Admin', 'Teacher');
      this.canEditDelete = this.ut.userHasAny('Admin', 'Teacher', 'HeadOfDepartment');
    });
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
    sessionStorage.setItem('goals table', JSON.stringify(this.columnsKeys));
  }

  /** @param data is either a goal to be Edit. Or childId to be Add */
  addEdit(data?: IGoalEntity | number) {
    this.dialog
      .open<AddEditGoalComponent, IGoalEntity | number, 'edited' | 'added' | null>(AddEditGoalComponent, { data })
      .afterClosed().subscribe(v => {
        if (v === 'added' || v === 'edited')//has been
          this.fetch();
      });
  }

  deleteDialog(goal: IGoalEntity) {
    this.ut.showMsgDialog({
      content: this.ut.translate('You are about to delete the goal: \"' + goal.activity.name + "\" permanently. If the child has finished the goal then edit the goal state as competed. NOTE: all evaluations of this goal will also be deleted permanently."),
      type: 'confirm',
      title: 'Are you sure?',
      buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
    }).afterClosed().subscribe(async (v) => {
      if (v === 'Delete') {
        this.ut.isLoading.next(true);
        await this.service.delete(goal.id);
        this.fetch();
        this.ut.showSnackbar('The goal has been deleted successfully.');
        this.ut.isLoading.next(false);
      }
    })
  }

  evaluate(goal: IGoalEntity) {
    //todo evaluate dialog
  }

  showEvaluations(goal: IGoalEntity) {

  }
}
