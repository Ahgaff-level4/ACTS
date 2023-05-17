import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ChildService } from 'src/app/services/child.service';
import { IChildEntity } from '../../../../../../../interfaces';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { ColDef, ColumnApi, Events, GridOptions, NewValueParams, } from 'ag-grid-enterprise';
import { Observable } from 'rxjs';
// import{RowClickedEvent} from 'ag-grid-enterprise/dist/lib/'
@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.scss'],
})
export class ChildrenComponent implements OnInit, AfterViewInit {
  public canAddEdit: boolean = this.ut.userHasAny('Admin', 'HeadOfDepartment');
  public selectedItem?: IChildEntity;
  public quickFilter: string = '';
  public onChildCellValueChanged = async (e: NewValueParams<IChildEntity>) => {
    try {
      await this.childService.patchChild(e.data.id, { [e.colDef.field as keyof IChildEntity]: e.newValue });
      this.ut.showSnackbar('Edited successfully')
    } catch (e) {
      this.gridOptions?.api?.refreshCells();
    }
  }
  // Each Column Definition results in one Column.
  //todo: filter archive.
  //todo: menu
  /**
   * - field is property name (accept nested. (e.g.,`person.name`).
   * - headerName will be translated.
   * - type `fromNow` and `fromNowNoAgo` will change `valueFormatter`, `tooltipValueGetter`, `chartDataType`, `width`, and `valueGetter`.
   * - type `long` will set `tooltipValueGetter` to the cell value.
   * - if field contains `date` (e.g., `createdDatetime`) AND no `filter`, it will set filter=`agDateColumnFilter`. Also, will set comparator function because our date is string.
   * - if `onCellValueChanged` exist and user `canEdit` then `editable=true`.
   * - if field is number then set `filter='agNumberColumnFilter'`. Default filter is for string.
   * - if field is enum then set `filter='agSetColumnFilter'` and set values as `filterParams:{values:['Male','Female']})`
   */
  public columnDefs: (ColDef<IChildEntity>)[] = [
    {
      field: 'person.name',
      headerName: 'Name',//headerName will be translated
      type: 'long',
    },
    {
      field: 'person.birthDate',
      headerName: 'Age',
      valueGetter: (v) => this.ut.calcAge(v.data?.person.birthDate),//set the under the hood value
      type: 'fromNowNoAgo',
      valueFormatter: (v) => this.ut.fromNow(v.data?.person.birthDate, true),
      tooltipValueGetter: (v) => v.data?.person.birthDate ? this.ut.translate('Birthdate') + ': ' + this.ut.toDate(v.data?.person.birthDate) : '',
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'person.gender',
      headerName: 'Gender',
      chartDataType: 'category',
      filter: 'agSetColumnFilter',
      filterParams: { values: ['Male', 'Female'] },
      width: 100
    },
    {
      field: 'person.createdDatetime',
      headerName: 'Register date',
      type: 'fromNow',
    },
    {
      field: 'diagnostic',
      headerName: 'Diagnostic',
      // icons:{'sort':'hello'},//todo how to add `edit` icon so user can know this column is editable
      onCellValueChanged: this.onChildCellValueChanged,
      type: 'long'//long will set a tooltip with same value. So, user can hover to see the 'long' value even though the cell has no space
    },
    {
      field: 'birthOrder',
      headerName: 'Order between siblings',
      valueFormatter: (v) => typeof v.data?.birthOrder == 'number' ? this.ut.translate(this.ut.ordinalNumbers[v.data.birthOrder-1]) : '',//todo check the birthOrder value because ordinalNumbers start with First
      onCellValueChanged: this.onChildCellValueChanged,
      hide: true,
    },
    {
      field: 'family',
      headerName: 'Order between siblings',
      valueGetter: (v) => {
        let ret = '';
        if (v.data?.birthOrder)
          ret += this.ut.translate(this.ut.ordinalNumbers[v.data.birthOrder - 1])
            + ' ' + this.ut.translate('of') + ' ';

        if (v.data?.maleFamilyMembers && v.data?.femaleFamilyMembers)
          ret += (v.data.maleFamilyMembers + v.data.femaleFamilyMembers + 1)
            + ' ' + this.ut.translate('siblings');
        if (typeof v.data?.maleFamilyMembers != 'number' && typeof v.data?.femaleFamilyMembers != 'number')
          return ret;
        ret += ' (';
        if (v.data?.femaleFamilyMembers)
          ret += (v.data.femaleFamilyMembers + (v.data.person?.gender == 'Female' ? 1 : 0))
            + ' ' + this.ut.translate('girls') + this.ut.translate(',') + ' ';
        if (v.data?.maleFamilyMembers)
          ret += (v.data.maleFamilyMembers + (v.data.person?.gender == 'Male' ? 1 : 0))
            + ' ' + this.ut.translate('boys');
        return ret + ')';
      }
    },
    {
      field: 'parentsKinship',
      headerName: 'Parent kinship',
      onCellValueChanged: this.onChildCellValueChanged,
      type: 'long',
      hide: true,
    },
    {
      field: 'diagnosticDate',
      headerName: 'Diagnostic date',
      type: 'fromNow',
      hide: true,
    },
    {
      field: 'pregnancyState',
      headerName: 'Pregnancy state',
      onCellValueChanged: this.onChildCellValueChanged,
      type: 'long',
      hide: true,
    },
    {
      field: 'birthState',
      headerName: 'Birth state',
      onCellValueChanged: this.onChildCellValueChanged,
      type: 'long',
      hide: true,
    },
    {
      field: 'growthState',
      headerName: 'Growth state',
      onCellValueChanged: this.onChildCellValueChanged,
      type: 'long',
      hide: true,
    },
    {
      field: 'medicine',
      headerName: 'Medicines',
      onCellValueChanged: this.onChildCellValueChanged,
      type: 'long',
      hide: true,
    },
    {
      field: 'behaviors',
      headerName: 'Behaviors',
      onCellValueChanged: this.onChildCellValueChanged,
      type: 'long',
      hide: true,
    },
    {
      field: 'prioritySkills',
      headerName: 'Priority skills',
      onCellValueChanged: this.onChildCellValueChanged,
      type: 'long',
    },
    {
      field: 'parent.person.name',
      headerName: 'Parent',
      tooltipValueGetter: (v) => v.data?.parent?.username ? this.ut.translate('Username') + ': ' + v.data.parent.username : '',
    },
    {
      field: 'teachers',
      headerName: 'Teachers',
      valueGetter: (v) => v.data?.teachers.map(v => v.person.name).join(this.ut.translate(', ')),
      tooltipValueGetter: (v) => v.data?.teachers ? this.ut.translate('Username') + ': ' + v.data.teachers.map(v => v.username).join(this.ut.translate(', ')) : '',
    }
  ];



  // Data that gets displayed in the grid
  public rowData!: IChildEntity[] | undefined;
  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions = {
    ...this.ut.commonGridOptions('children table', this.columnDefs, this.canAddEdit, [{ icon: 'edit', title: 'Edit row' }, { icon: 'person_add', title: 'Register a child' }]),

    onRowClicked: (v)=>this.selectedItem=v.data
  }

  constructor(private childService: ChildService, public ut: UtilityService, private dialog: MatDialog) {
  }


  ngOnInit(): void {
    this.childService.children.subscribe(v => {
      this.rowData = v;
      this.gridOptions.api?.refreshCells();
    });
    // this.childService.fetchChildren().then(v => { this.rowData = v; console.log(v[0]) })

    this.ut.user.subscribe(v => {
      this.canAddEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
    });

  }

  ngAfterViewInit(): void {
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
  }


  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }

  edit(child: IChildEntity | undefined) {
    if (child != undefined) {
      this.ut.router.navigate(['edit-child'], { state: { data: child } });
    }
  }

  // filteredItems: IChildEntity[] = [];
  // showFilterDialog() {
  //   this.dialog
  //     .open<FilterChildrenComponent, FilterChildrenOptions, FilterChildrenOptions>
  //     (FilterChildrenComponent, { data: this.filter }).afterClosed()
  //     .subscribe((newFilter) => {
  //       if (typeof newFilter == 'object') {
  //         this.filter = newFilter;
  //         this.filteredItems = this.childService.children.value;
  //         if (newFilter.maxRegisterDate)
  //           this.filteredItems = this.filteredItems.filter((v) => {
  //             if (typeof v.person?.createdDatetime == 'string')
  //               return new Date(v.person.createdDatetime) <= (newFilter.maxRegisterDate as Date);
  //             else if (v.person?.createdDatetime instanceof Date)
  //               return v.person.createdDatetime <= (newFilter.maxRegisterDate as Date);
  //             return false;
  //           });
  //         if (newFilter.minRegisterDate)
  //           this.filteredItems = this.filteredItems.filter((v) => {
  //             if (typeof v.person?.createdDatetime == 'string')
  //               return new Date(v.person.createdDatetime) >= (newFilter.minRegisterDate as Date);
  //             else if (v.person?.createdDatetime instanceof Date)
  //               return v.person.createdDatetime >= (newFilter.minRegisterDate as Date);
  //             return false;
  //           });

  //         this.dataSource.setData(this.filteredItems);
  //         if (this.table)
  //           this.table.renderRows();
  //       }
  //     })
  // }

  // numOfFiltersApplied(): number {
  //   return Object.keys(this.filter).length;
  // }

  ngOnDestroy() {

  }
}
