import { Component, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IActivityEntity, IProgramEntity } from '../../../../../../interfaces';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivityService } from 'src/app/services/activity.service';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ProgramService } from 'src/app/services/program.service';
import { BehaviorSubject } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddEditActivityComponent } from '../../dialogs/add-edit/add-edit-activity/add-edit-activity.component';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent {
  public canAddEdit!: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IActivityEntity>;
  public dataSource!: MatTableDataSource<IActivityEntity>;
  public columnsKeys!: string[];

  constructor(public service: ActivityService, public ut: UtilityService, private dialog: MatDialog, private route: ActivatedRoute,) {

  }



  ngOnInit(): void {
    this.canAddEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
    this.columnsKeys = JSON.parse(sessionStorage.getItem('activities table') ?? 'null') ?? (this.canAddEdit ? ['name', 'ageRange', 'field', 'createdDatetime', 'control'] : ['name', 'ageRange', 'field', 'createdDatetime']);
    this.ut.isLoading.next(true);
    this.route.paramMap.subscribe({
      next: async params => {
        let programId = params.get('id');
        if (typeof programId == 'string')
          await this.service.fetchProgramItsActivities(+programId, true).catch(() => { });
        else this.ut.errorDefaultDialog("Sorry, there was a problem fetching the program's activities. Please try again later or check your connection.");
        this.ut.isLoading.next(false);
      }, error: () => this.ut.isLoading.next(false)
    });
    this.dataSource = new MatTableDataSource<IActivityEntity>();
    this.service.specialActivities.next(undefined);//prevent unnecessary loading when: (create,update,delete) activity
    this.service.programItsActivities.subscribe((v) => {
      if (v == null)
        return;
      this.dataSource.data = v.activities;
      if (this.table)
        this.table.renderRows();
    });
    this.ut.user.subscribe(v => {
      this.canAddEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
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
    sessionStorage.setItem('activities table', JSON.stringify(this.columnsKeys));
  }

  /** `data` is either Activity to be Edit. Or programId to be Add */
  addEdit(data?: IActivityEntity | number) {
    if (typeof data != 'object' && typeof data != 'number')
      this.ut.errorDefaultDialog(undefined);
    else
      this.dialog
        .open<AddEditActivityComponent, IActivityEntity | number, 'edited' | 'added' | null>(AddEditActivityComponent, { data })
    // .afterClosed().subscribe(v => { service will fetch when add/edit/delete
    //   if (v === 'added' || v === 'edited')
    //     this.fetch();
    // });
  }

  deleteDialog(activity: IActivityEntity) {
    this.ut.showMsgDialog({
      content: this.ut.translate('You are about to delete the activity: \"') + activity.name + this.ut.translate("\" permanently. NOTE: You won't be able to delete the activity if there is a child with at least one goal that depends on this activity."),
      type: 'confirm',
      buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
    }).afterClosed().subscribe(async (v) => {
      if (v === 'Delete') {
        try {
          await this.service.delete(activity.id, true);
          this.ut.showSnackbar('The activity has been deleted successfully.');
        } catch (e) { }
      }
    });
  }
}
