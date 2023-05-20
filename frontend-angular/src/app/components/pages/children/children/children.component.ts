import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ChildService } from 'src/app/services/child.service';
import { IChildEntity } from '../../../../../../../interfaces';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { ColDef, GridOptions, ISetFilterParams, MenuItemDef, NewValueParams, SetFilterParams, SetFilterValuesFuncParams, } from 'ag-grid-enterprise';
import { MatMenuTrigger } from '@angular/material/menu';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
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
  public isPrinting: boolean = false;

  public onChildCellValueChanged = async (e: NewValueParams<IChildEntity>) => {
    try {
      await this.childService.patchChild(e.data.id, { [e.colDef.field as keyof IChildEntity]: e.newValue });
      this.ut.showSnackbar('Edited successfully')
    } catch (e) {
      this.gridOptions?.api?.refreshCells();
    }
  }
  // Each Column Definition results in one Column.
  //todo: chart reports.
  //todo: delete MatTableModule
  /**
   * - field is property name (accept nested. (e.g.,`person.name`).
   * - headerName will be translated.
   * - type `fromNow` and `fromNowNoAgo` will change `valueFormatter`, `tooltipValueGetter`, `chartDataType`, `width`, and `valueGetter`.
   * - type `long` will set `tooltipValueGetter` to the cell value.
   * - if field contains `date` (e.g., `createdDatetime`) AND no `filter`, it will set filter=`agDateColumnFilter`. Also, will set comparator function because our date is string.
   * - if `onCellValueChanged` exist and user `canEdit` then `editable=true`.
   * - if field is number then set `filter='agNumberColumnFilter'`. Default filter is for string.
   * - if field is enum then set `filter='agSetColumnFilter'` and set values as `filterParams:{values:['Male','Female'], valueFormatter?:Func, })`
   */
  public columnDefs: (ColDef<IChildEntity>)[] = [
    {
      field: 'person.name',
      headerName: 'Name',//headerName will be translated
      type: 'long',
    },
    {
      colId: 'Age',//assigned `colId` because there are multiple columns with same field.
      field: 'person.birthDate',
      headerName: 'Age',
      valueGetter: (v) => this.ut.calcAge(v.data?.person.birthDate),//set the under the hood value
      type: 'fromNowNoAgo',
      valueFormatter: (v) => this.ut.fromNow(v.data?.person.birthDate, true),
      filter: 'agNumberColumnFilter'
    },
    {
      colId: 'birthDate',
      field: 'person.birthDate',
      headerName: 'Birthdate',
      type: 'toDate',
      hide: true,
    },
    {
      field: 'person.gender',
      headerName: 'Gender',
      chartDataType: 'category',
      filter: 'agSetColumnFilter',
      filterParams: { values: ['Male', 'Female'], },
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
      onCellValueChanged: this.onChildCellValueChanged,
      type: 'long'//long will set a tooltip with same value. So, user can hover to see the 'long' value even though the cell has no space
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

    ...this.canAddEdit ?//add isArchive column if user can add/edit. We are forced to duplicate teacher column for false closure unless we do a function and make it big deal.
      [{
        field: 'teachers',
        headerName: 'Teachers',
        valueGetter: (v) => v.data?.teachers.map(v => v.person.name).join(this.ut.translate(', ')),
        tooltipValueGetter: (v) => v.data?.teachers ? this.ut.translate('Username') + ': ' + v.data.teachers.map(v => v.username).join(this.ut.translate(', ')) : '',
      }, {
        field: 'isArchive',
        headerName: 'Archive',
        filter: 'agSetColumnFilter',
        filterParams: {
          values: [true, false],
          valueFormatter: v => v.value == true ? this.ut.translate('Archive') : this.ut.translate('Not Archive')
        } as ISetFilterParams<IChildEntity, boolean>,
        valueFormatter: v => v.value == true ? this.ut.translate('Archive') : this.ut.translate('Not Archive'),
        hide: true,
      }] as ColDef<IChildEntity>[] : [{
        field: 'teachers',
        headerName: 'Teachers',
        valueGetter: (v) => v.data?.teachers.map(v => v.person.name).join(this.ut.translate(', ')),
        tooltipValueGetter: (v) => v.data?.teachers ? this.ut.translate('Username') + ': ' + v.data.teachers.map(v => v.username).join(this.ut.translate(', ')) : '',
      }] as ColDef<IChildEntity>[],

  ];



  // Data that gets displayed in the grid
  public rowData!: IChildEntity[] | undefined;


  constructor(private childService: ChildService, public agGrid: AgGridService, public ut: UtilityService, private dialog: MatDialog) {
  }



  ngOnInit(): void {
    this.childService.children.subscribe(v => {
      if (this.canAddEdit)
        this.rowData = v;
      else this.rowData = v.filter(v => v.isArchive == false)//Parent with archived child can not be viewed
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

  printTable = () => {//should be arrow function. Because it's called inside gridOption object
    let isAuto = this.gridOptions.paginationAutoPageSize;
    this.gridOptions.paginationAutoPageSize = false
    let size = this.gridOptions.paginationPageSize;
    this.gridOptions.paginationPageSize = 1000;
    this.isPrinting = true;
    this.gridOptions.api?.setDomLayout('print');
    this.gridOptions.api?.setSideBarVisible(false)
    this.gridOptions.api?.redrawRows();
    setTimeout(() => print(), 2000);
    setTimeout(() => {
      this.isPrinting = false;
      this.gridOptions.paginationAutoPageSize = isAuto;
      this.gridOptions.paginationPageSize = size;
      this.gridOptions.api?.setSideBarVisible(true)
      this.gridOptions.api?.refreshCells();
      this.gridOptions.api?.setDomLayout('autoHeight');

    }, 3000);
  }

  private goalsStrengthsMenuItems: MyMenuItem<IChildEntity>[] = [
    {
      name: 'Goals',
      icon: `<mat-icon _ngcontent-tvg-c62="" color="primary" role="img" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">sports_score</mat-icon>`,
      action: (v) => v ? this.ut.router.navigateByUrl('/child/' + v.id + '/goals') : '',
      tooltip: 'View goals of the selected child',
    },
    {
      name: 'Strengths',
      icon: `<mat-icon _ngcontent-glk-c62="" color="primary" role="img" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">fitness_center</mat-icon>`,
      action: (v) => v ? this.ut.router.navigateByUrl('/child/' + v.id + '/strengths') : '',
      tooltip: 'View strengths of the selected child',
    },
  ];

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IChildEntity> = {
    ...this.agGrid.commonGridOptions('children table', this.columnDefs, this.canAddEdit,
      this.goalsStrengthsMenuItems, this.printTable, (item) => { this.edit(item) },
      (e) => {
        e.api.getFilterInstance('isArchive')?.setModel({values:['false']})
      }
    ),
    onRowClicked: (v) => this.selectedItem = v.data,
  }
}
