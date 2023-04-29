import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IFieldEntity } from '../../../../../../interfaces';
import { FieldService } from 'src/app/services/field.service';
import { UtilityService } from 'src/app/services/utility.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { AddEditFieldComponent } from '../../dialogs/add-edit-field/add-edit-field.component';
import { MessageDialogComponent, MessageDialogData } from '../../dialogs/message/message.component';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent implements OnInit {
  public canAddEdit!: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IFieldEntity>;
  public dataSource!: MatTableDataSource<IFieldEntity>;
  public columnsKeys!: string[];
  public isLoading: boolean = true;

  constructor(private service: FieldService, public ut: UtilityService, private dialog: MatDialog) {
      }

  ngOnInit(): void {
    this.canAddEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
    this.columnsKeys = JSON.parse(sessionStorage.getItem('fields table') ?? 'null') ?? (this.canAddEdit ? ['name', 'activityCount', 'createdDatetime', 'control'] : ['name', 'activityCount', 'createdDatetime']);

    this.dataSource = new MatTableDataSource<IFieldEntity>();
    this.service.fields.subscribe({
      next: v => {
        this.dataSource.data = v;
        if (this.table)
          this.table.renderRows();
      }
    });
    this.service.fetch(true);
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
    sessionStorage.setItem('fields table', JSON.stringify(this.columnsKeys));
  }

  /** if `data` param passed then it is Edit. Otherwise will be Add */
  addEdit(data?: IFieldEntity) {
    this.dialog
      .open<AddEditFieldComponent, IFieldEntity>(AddEditFieldComponent, { data });
  }

  deleteDialog(field: IFieldEntity) {
    this.ut.showMsgDialog({
      content: this.ut.translate('You are about to delete the field: ' + field.name + ' permanently. Any existing activity that has this field will no longer have it, and will have empty field instead!'),
      type: 'confirm',
      buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
    }).afterClosed().subscribe(async (v) => {
      if (v === 'Delete') {
        this.ut.isLoading.next(true);
        await this.service.delete(field.id);
        this.ut.isLoading.next(false);
        this.ut.showSnackbar('The field has been deleted successfully.');
      }
    })

  }
}
