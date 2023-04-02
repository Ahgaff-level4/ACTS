import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ChildrenService } from 'src/app/services/children.service';
import { IChildEntity } from '../../../../../../interfaces';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { DataSource } from '@angular/cdk/collections';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { of, range } from 'rxjs';

@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.scss'],

})
export class ChildrenComponent implements OnInit, AfterViewInit {
  ngOnInit(): void {
    this.dataSource = new ChildrenDataSource();
    this.dataSource.setData(this.childrenService.children.value);
  }
  constructor(private childrenService: ChildrenService) { }
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IChildEntity>;

  ngAfterViewInit(): void {
    // for (let i = 0; i < 10; i++) {
    //   this.childrenService.children
    //   .next([...this.childrenService.children.value, { ...this.childrenService.children.value[0] }])
    // }
    // setTimeout(() => { this.childrenService.children.next([]) }, 2000)
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.childrenService.children.subscribe(v => {
      this.dataSource.setData(v);
      if (this.table)
        this.table.renderRows();
    });
  }
  public dataSource!: ChildrenDataSource;
  public columnsKeys: string[] = ['name', 'age', 'diagnostic', 'gender', 'createdDatetime']
  public columnsTitles: string[] = ['Name', 'Age', 'Diagnostic', 'Gender', 'Created']
}

class ChildrenDataSource extends MatTableDataSource<IChildEntity>{
  setData(arr: IChildEntity[]) {
    this.data = arr.map(v => ({ ...v, ...v.person }));
  }
}
