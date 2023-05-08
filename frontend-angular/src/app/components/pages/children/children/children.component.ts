import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ChildService } from 'src/app/services/child.service';
import { IChildEntity } from '../../../../../../../interfaces';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UtilityService } from 'src/app/services/utility.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ChildrenComponent implements OnInit, AfterViewInit {
  public canAddEdit!: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IChildEntity>;
  public dataSource!: ChildrenDataSource;
  public columnsKeys: string[] = JSON.parse(sessionStorage.getItem('children table') ?? 'null') ?? ['name', 'age', 'diagnostic', 'gender', 'createdDatetime', 'expand']
  public expandedItem?: IChildEntity;

  constructor(private childService: ChildService, public ut: UtilityService) {
  }

  ngOnInit(): void {
    this.canAddEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');

    this.dataSource = new ChildrenDataSource();
    this.ut.isLoading.next(true);
    this.childService.children.subscribe({
      next: v => {
        this.dataSource.setData(v);
        if (this.table)
          this.table.renderRows();
        this.ut.isLoading.next(false);
      }, error: () => this.ut.isLoading.next(false)
    });
    this.childService.fetchChildren();
    this.ut.user.subscribe(v => {
      this.canAddEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
    });

    //!Not working! shows nothing record! Show a record with empty fields what ever search bar typed on!
    // this.dataSource.filterPredicate = (item: IChildEntity, filter: string) => {
    //   for (let k in item) {
    //     if (typeof (item as any)[k] == 'object') {
    //       for (let k2 in (item as any)[k])
    //         if (((item as any)[k] as any)[k2]?.toString().toLowerCase().indexOf(filter.toLowerCase()) != -1)
    //           return true;
    //     } else if ((item as any)[k]?.toString().toLowerCase().indexOf(filter.toLocaleLowerCase()) != -1)
    //       return true;
    //   }
    //   return false;
    // }
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
    sessionStorage.setItem('children table', JSON.stringify(this.columnsKeys));
  }


  edit(child: IChildEntity | undefined) {
    if (child != undefined) {
      this.ut.router.navigate(['edit-child'], { state: { data: child } });
    }
  }
}


class ChildrenDataSource extends MatTableDataSource<IChildEntity>{
  setData(arr: IChildEntity[]) {
    this.data = arr.map(v => ({ ...v.person, ...v, }));
  }


}
