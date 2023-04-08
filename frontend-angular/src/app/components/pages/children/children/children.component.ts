import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ChildService } from 'src/app/services/child.service';
import { IChildEntity } from '../../../../../../../interfaces';
import { MatSort} from '@angular/material/sort';
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
  ngOnInit(): void {
    this.dataSource = new ChildrenDataSource();
    this.dataSource.setData(this.childService.children.value);
    this.childService.children.subscribe(v => {
      this.dataSource.setData(v);
      if (this.table)
        this.table.renderRows();
    });
    this.ut.user.subscribe(v=>{
      this.canAddEdit = this.ut.userHasAny('Admin','HeadOfDepartment');
    });
  }

  public canAddEdit:boolean;
  constructor(private childService: ChildService,public ut:UtilityService) {
    this.canAddEdit = this.ut.userHasAny('Admin','HeadOfDepartment');
  }
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<IChildEntity>;

  ngAfterViewInit(): void {
    // setInterval(()=>{
    //   this.childService.children
    //   .next([...this.childService.children.value, { ...this.childService.children.value[0] }])
    // },1000);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public dataSource!: ChildrenDataSource;
  public columnsKeys: string[] = JSON.parse(sessionStorage.getItem('children table')??'null')?? ['name', 'age', 'diagnostic', 'gender', 'createdDatetime', 'expand']
  public expandedItem?: IChildEntity;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator)
      this.dataSource.paginator.firstPage();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columnsKeys, event.previousIndex, event.currentIndex);
    sessionStorage.setItem('children table',JSON.stringify(this.columnsKeys));
  }

  add(){
//todo redirect add-child
  }

  edit(child:IChildEntity|undefined){
    if(child !=undefined){
      //todo see how to transfer child param to edit-child page :/

    }
  }
}


class ChildrenDataSource extends MatTableDataSource<IChildEntity>{
  setData(arr: IChildEntity[]) {
    this.data = arr.map(v => ({ ...v, ...v.person }));
  }
}
