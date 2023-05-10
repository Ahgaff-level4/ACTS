import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IActivityEntity } from '../../../../../../interfaces';
import { ActivityService } from 'src/app/services/activity.service';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddEditActivityComponent } from '../../dialogs/add-edit/add-edit-activity/add-edit-activity.component';

@Component({
  selector: 'app-special-activity',
  templateUrl: './special-activity.component.html',
  styleUrls: ['./special-activity.component.scss']
})
export class SpecialActivityComponent {
  public canEdit!: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IActivityEntity>;
  public dataSource!: MatTableDataSource<IActivityEntity>;
  public columnsKeys!: string[];

  constructor(public service: ActivityService, public ut: UtilityService, private dialog: MatDialog, private route: ActivatedRoute,) {

  }

  ngOnInit(): void {
    this.canEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
    this.columnsKeys = JSON.parse(sessionStorage.getItem('special activities table') ?? 'null') ?? (this.canEdit ? ['child', 'name', 'field', 'createdDatetime', 'control'] : ['child', 'name', 'field', 'createdDatetime']);
    this.dataSource = new MatTableDataSource<IActivityEntity>();
    this.service.programItsActivities.next(undefined);//prevent unnecessary loading when: (create,update,delete) activity
    if (this.service.specialActivities.value && this.service.specialActivities.value.length != 0) {
      this.dataSource.data = this.service.specialActivities.value as IActivityEntity[];
      if (this.table)
        this.table.renderRows();
    } else
      this.service.fetchSpecialActivities(true);


    this.service.specialActivities.subscribe((v) => {
      if (v == null)
        return;
      this.dataSource.data = v;
      if (this.table)
        this.table.renderRows();
    });
    this.ut.user.subscribe(v => {
      this.canEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
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
    sessionStorage.setItem('special activities table', JSON.stringify(this.columnsKeys));
  }


  /** `data` is Activity to be Edit. */
  edit(data?: IActivityEntity) {
    if (typeof data != 'object' && typeof data != 'number')
      this.ut.errorDefaultDialog(undefined);
    else
      this.dialog
        .open<AddEditActivityComponent, IActivityEntity | number, 'edited' | 'added' | null>(AddEditActivityComponent, { data })
  }

  deleteDialog(activity: IActivityEntity) {
    this.ut.showMsgDialog({
      content: this.ut.translate('You are about to delete the activity: \"' + activity.name + "\" permanently. NOTE: You won't be able to delete the activity if there is a child with at least one goal that depends on this activity."),
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
