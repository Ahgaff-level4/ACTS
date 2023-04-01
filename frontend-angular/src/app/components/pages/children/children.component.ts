import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ChildrenService } from 'src/app/services/children.service';
import { IChildEntity } from '../../../../../../interfaces';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.scss']
})
export class ChildrenComponent implements OnInit, AfterViewInit {
  ngOnInit(): void {
    // this.childrenService.fetchChildren();
    this.childrenService.children.subscribe(v => {
      this.dataSource.data = v;
      if (this.table)
        this.table.renderRows();
      else console.log('table is not defined!');
      console.log('render')
    });
  }

  constructor(private childrenService: ChildrenService) { }
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table!: MatTable<IChildEntity>;

  ngAfterViewInit(): void {

    setInterval(() => { this.childrenService.children.next([...this.childrenService.children.value, { ...this.childrenService.children.value[0] }]) }, 1000)
    // setTimeout(() => { this.childrenService.children.next([]) }, 2000)
    // this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
  public dataSource = new MatTableDataSource<IChildEntity>();


}
