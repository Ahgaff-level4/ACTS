import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IProgramEntity } from '../../../../../../interfaces';
import { ProgramService } from 'src/app/services/program.service';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddEditProgramComponent } from '../../dialogs/add-edit-program/add-edit-program.component';

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.scss']
})
export class ProgramComponent {
  public canAddEdit: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IProgramEntity>;
  public dataSource!: MatTableDataSource<IProgramEntity>;
  public columnsKeys: string[];
  public isLoading:boolean = true;
  constructor(private service: ProgramService, public ut: UtilityService, private dialog: MatDialog) {
    this.canAddEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
    this.columnsKeys = JSON.parse(sessionStorage.getItem('programs table') ?? 'null') ?? (this.canAddEdit?['name', 'activityCount', 'createdDatetime', 'control']:['name', 'activityCount', 'createdDatetime']);
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<IProgramEntity>();
    this.service.programs.subscribe(v => {
      this.dataSource.data = v;
      if (this.table)
        this.table.renderRows();
      this.isLoading = false;
    });
    this.service.fetch();
    this.isLoading = true;
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
    sessionStorage.setItem('programs table', JSON.stringify(this.columnsKeys));
  }

  /** if `data` param passed then it is Edit. Otherwise will be Add */
  addEdit(data?: IProgramEntity) {
    this.dialog
      .open<AddEditProgramComponent, IProgramEntity>(AddEditProgramComponent, { data });
  }

  deleteDialog(program: IProgramEntity) {
    this.ut.showMsgDialog({
      content: this.ut.translate('You are about to delete the program: '+program.name+" permanently. All its activities will be deleted! NOTE: You won't be able to delete the program if there is a child with at least one goal that depends on this program."),
      type: 'confirm',
      title: 'Are you sure?',
      buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type:'Delete' }]
    }).afterClosed().subscribe(async(v) => {
      if (v === 'Delete') {
        this.isLoading = true;
        await this.service.delete(program.id);
        this.isLoading = false;
        this.ut.showMsgDialog({ title: 'Deleted successfully!', type: 'success', content: 'The program has been deleted successfully.' })
      }
    })

  }
}
