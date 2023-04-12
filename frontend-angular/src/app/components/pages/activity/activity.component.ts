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
import { AddEditActivityComponent } from '../../dialogs/add-edit-activity/add-edit-activity.component';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent {
  public canAddEdit: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IActivityEntity>;
  public dataSource!: MatTableDataSource<IActivityEntity>;
  public columnsKeys: string[];
  public program = new BehaviorSubject<IProgramEntity | null>(null);

  /**
   * - First use when init the class. The programId will be passed by URL param as (string|null).
   * - Second when `Add`, `Edit`, or `Delete` an activity. So that it will emit the new data. So, that the table will be refresh. The programId will be undefined.
   */
  async fetch(programId?: number|string|null) {
    this.ut.isLoading = true;
    if(typeof programId === 'string')
      programId = +programId;
    if (programId || this.program.value?.id)// if First and Second cases. Else like if program.value is null and programId is null then there is something went wrong!
      this.program.next(await this.programService.fetchOne(programId ?? this.program.value?.id as number));
    else this.ut.errorDefaultDialog(undefined, "Sorry, there was a problem navigating to activities page. Please try again later or check your connection.").afterClosed().subscribe(() => this.ut.router.navigate(['/main']));
    this.ut.isLoading = false;
  }

  constructor(private service: ActivityService, public ut: UtilityService, private dialog: MatDialog, private route: ActivatedRoute, private programService: ProgramService) {
    this.canAddEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
    this.columnsKeys = JSON.parse(sessionStorage.getItem('activities table') ?? 'null') ?? (this.canAddEdit ? ['name', 'ageRange', 'field', 'createdDatetime', 'control'] : ['name', 'ageRange', 'field', 'createdDatetime']);
    this.route.paramMap.subscribe({
      next: async params => {
        let programId = params.get('id');

        await this.fetch(programId);

        this.ut.isLoading = false;
      }, error: () => this.ut.isLoading = false
    });
  }



  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<IActivityEntity>();
    this.program.subscribe((v) => {
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
    this.dialog
      .open<AddEditActivityComponent, IActivityEntity | number, 'edited' | 'added' | null>(AddEditActivityComponent, { data })
      .afterClosed().subscribe(v => {
        if (v === 'added' || v === 'edited')
          this.fetch();
      });
  }

  deleteDialog(activity: IActivityEntity) {
    this.ut.showMsgDialog({
      content: this.ut.translate('You are about to delete the activity: \"' + activity.name + "\" permanently. NOTE: You won't be able to delete the activity if there is a child with at least one goal that depends on this activity."),
      type: 'confirm',
      title: 'Are you sure?',
      buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
    }).afterClosed().subscribe(async (v) => {
      if (v === 'Delete') {
        this.ut.isLoading = true;
        await this.service.delete(activity.id);
        this.fetch();
        this.ut.isLoading = false;
        this.ut.showSnackbar('The activity has been deleted successfully.');
      }
    })

  }
}
