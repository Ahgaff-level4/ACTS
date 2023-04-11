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
  public isLoading: boolean = true;
  public program = new BehaviorSubject<IProgramEntity | null>(null);

  async fetch(programId: number) {
    this.isLoading = true;
    this.program.next(await this.programService.fetchOne(programId ?? this.program.value?.id));
    this.isLoading = false;
  }

  constructor(private service: ActivityService, public ut: UtilityService, private dialog: MatDialog, private route: ActivatedRoute, private programService: ProgramService) {
    this.canAddEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
    this.columnsKeys = JSON.parse(sessionStorage.getItem('activities table') ?? 'null') ?? (this.canAddEdit ? ['name', 'activityCount', 'createdDatetime', 'control'] : ['name', 'activityCount', 'createdDatetime']);
    this.route.paramMap.subscribe({
      next: async params => {
        let programId = params.get('id');
        if (programId) {
          await this.fetch(+programId);
        } else this.ut.errorDefaultDialog(undefined, "Sorry, there was a problem navigating to activities page. Please try again later or check your connection.").afterClosed().subscribe(() => this.ut.router.navigate(['/main']));
        this.isLoading = false;
      }, error: () => this.isLoading = false
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

  /** if `data` param passed then it is Edit. Otherwise will be Add */
  addEdit(data?: IActivityEntity) {
    this.dialog
      .open<AddEditActivityComponent, IActivityEntity>(AddEditActivityComponent, { data });
  }

  deleteDialog(activity: IActivityEntity) {
    this.ut.showMsgDialog({
      content: this.ut.translate('You are about to delete the activity: \"' + activity.name + "\" permanently. NOTE: You won't be able to delete the activity if there is a child with at least one goal that depends on this activity."),
      type: 'confirm',
      title: 'Are you sure?',
      buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
    }).afterClosed().subscribe(async (v) => {
      if (v === 'Delete') {
        this.isLoading = true;
        await this.service.delete(activity.id);
        this.isLoading = false;
        this.ut.showMsgDialog({ title: 'Deleted successfully!', type: 'success', content: 'The program has been deleted successfully.' })
      }
    })

  }
}
