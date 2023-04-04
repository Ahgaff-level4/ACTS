import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ChildrenService } from 'src/app/services/children.service';
import { IChildEntity } from '../../../../../../interfaces';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { animate, state, style, transition, trigger } from '@angular/animations';
import * as moment from 'moment';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { AddEditChildComponent } from '../../dialogs/add-edit-child/add-edit-child.component';
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
  ngOnInit(): void {
    this.dataSource = new ChildrenDataSource();
    this.dataSource.setData(this.childrenService.children.value);
    this.childrenService.children.subscribe(v => {
      this.dataSource.setData(v);
      if (this.table)
        this.table.renderRows();
    });
  }
  constructor(private childrenService: ChildrenService, private dialog:MatDialog) { }
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IChildEntity>;

  ngAfterViewInit(): void {
    // setInterval(()=>{
    //   this.childrenService.children
    //   .next([...this.childrenService.children.value, { ...this.childrenService.children.value[0] }])
    // },1000);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public dataSource!: ChildrenDataSource;
  public columnsKeys: string[] = ['name', 'age', 'diagnostic', 'gender', 'createdDatetime', 'expand']
  public expandedItem?: IChildEntity;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator)
      this.dataSource.paginator.firstPage();
  }

  public showEditDialog(item?:IChildEntity){
    this.dialog
      .open<AddEditChildComponent, IChildEntity>(AddEditChildComponent, { data:item });
  }
}


class ChildrenDataSource extends MatTableDataSource<IChildEntity>{
  setData(arr: IChildEntity[]) {
    this.data = arr.map(v => ({ ...v, ...v.person }));
  }
}
