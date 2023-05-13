import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { IStrengthEntity } from '../../../../../../interfaces';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ChildService } from 'src/app/services/child.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { StrengthService } from 'src/app/services/strength.service';
import { AddEditStrengthComponent } from '../../dialogs/add-edit/add-edit-strength/add-edit-strength.component';

@Component({
  selector: 'app-strength',
  templateUrl: './strength.component.html',
  styleUrls: ['./strength.component.scss']
})
export class StrengthComponent {
  public canAdd!: boolean;
  public canEditDelete!: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IStrengthEntity>;
  public dataSource!: MatTableDataSource<IStrengthEntity>;
  public columnsKeys!: string[];
  private sub: Subscription = new Subscription();

  constructor(public service: StrengthService, public ut: UtilityService, private dialog: MatDialog, private route: ActivatedRoute,) {
  }



  ngOnInit(): void {
    this.canAdd = this.ut.userHasAny('Admin', 'Teacher');
    this.canEditDelete = this.ut.userHasAny('Admin', 'Teacher', 'HeadOfDepartment');
    this.columnsKeys = JSON.parse(sessionStorage.getItem('strengths table') ?? 'null') ?? ['program', 'field', 'strength', 'assignDatetime', 'note', 'teacher', 'menu'];
    this.route.paramMap.subscribe({
      next: async params => {
        let childId = params.get('id');
        if (typeof childId === 'string')
          await this.service.fetchChildItsStrengths(+childId, true).catch(() => { });
        else this.ut.errorDefaultDialog("Sorry, there was a problem fetching the child's strengths. Please try again later or check your connection.")
      },
    });

    this.dataSource = new MatTableDataSource<IStrengthEntity>();
    this.sub.add(this.service.childItsStrengths.subscribe({
      next: (v) => {
        if (v == null)
          return;
        this.dataSource.data = v.strengths;
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
    sessionStorage.setItem('strengths table', JSON.stringify(this.columnsKeys));
  }

  /** @param strengthOrChildId is either a strength to be Edit. Or childId to be Add */
  addEdit(strengthOrChildId?: IStrengthEntity | number) {
    if (typeof strengthOrChildId != 'object' && typeof strengthOrChildId != 'number')
      this.ut.errorDefaultDialog(undefined);
    else
      this.dialog
        .open<AddEditStrengthComponent, IStrengthEntity | number, 'edited' | 'added' | null>(AddEditStrengthComponent, { data: strengthOrChildId })
  }

  deleteDialog(strength: IStrengthEntity) {
    this.ut.showMsgDialog({
      content: this.ut.translate('You are about to delete the strength: \"') + strength.activity.name + this.ut.translate("\" permanently."),
      type: 'confirm',
      buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
    }).afterClosed().subscribe(async (v) => {
      if (v === 'Delete') {
        try {
          await this.service.delete(strength.id, true);
          this.ut.showSnackbar('The strength has been deleted successfully.');
        } catch (e) { }
      }
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
