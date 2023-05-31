import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChildService } from 'src/app/services/child.service';
import { IChildEntity } from '../../../../../../../interfaces';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { ColDef, GridOptions, ISetFilterParams, MenuItemDef, NewValueParams, SetFilterParams, SetFilterValuesFuncParams, } from 'ag-grid-enterprise';
import { MatMenuTrigger } from '@angular/material/menu';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { Observable, Subscription, finalize, first, map, tap } from 'rxjs';
// import{RowClickedEvent} from 'ag-grid-enterprise/dist/lib/'
@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.scss'],
})
export class ChildrenComponent implements OnInit, OnDestroy {
  public canAddEdit: boolean = this.ut.userHasAny('Admin', 'HeadOfDepartment');
  public selectedItem?: IChildEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;
  public sub: Subscription = new Subscription();

  public onChildCellValueChanged = async (e: NewValueParams<IChildEntity>) => {
    try {
      await this.childService.patchChild(e.data.id, { [e.colDef.field as keyof IChildEntity]: e.newValue });
      this.ut.showSnackbar('Edited successfully')
    } catch (e) {
      this.childService.fetchChildren();
    }
  }

  /**
* @see [ag-grid.service](../../../../services/ag-grid.service.ts) for more information of how to set the columnDef properties.
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
      filter: 'agNumberColumnFilter',
      tooltipValueGetter: (v) => this.ut.toDate(v.data?.person.birthDate),
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
      type: 'enum',
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
      headerName: 'Family information',
      valueGetter: (v) => v.data ? this.ut.familyInformation(v.data) : '',
      type: ['long', 'madeUp'],
    },
    {
      field: 'femaleFamilyMembers',
      headerName: 'Number of sisters',
      onCellValueChanged: this.onChildCellValueChanged,
      type: 'number',
      hide: true,
    },
    {
      field: 'maleFamilyMembers',
      headerName: 'Number of brothers',
      onCellValueChanged: this.onChildCellValueChanged,
      type: 'number',
      hide: true,
    },
    {
      field: 'birthOrder',
      headerName: 'Order between siblings',
      type: 'number',
      valueFormatter: (v) => typeof v.data?.birthOrder == 'number' ? this.ut.translate(this.ut.ordinalNumbers[v.data.birthOrder - 1]) : '',//todo check the birthOrder value because ordinalNumbers start with First
      hide: true,
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
      onCellValueChanged: this.onChildCellValueChanged,
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
        type: 'enum',
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
    this.childService.fetchChildren();
    this.sub.add(this.childService.children.subscribe(v => {
      if (this.canAddEdit)
        this.rowData = this.ut.deepClone(v);
      else this.rowData = this.ut.deepClone(v.filter(v => v.isArchive == false));//Parent with archived child can not be viewed
      this.gridOptions.api?.refreshCells();
    }));

    this.sub.add(this.ut.user.subscribe(v => {
      this.canAddEdit = this.ut.userHasAny('Admin', 'HeadOfDepartment');
    }));

  }


  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }

  edit(child: IChildEntity | undefined) {
    if (child != undefined) {
      this.ut.router.navigate(['edit-child'], { state: { data: child } });
    }
  }

  printTable() {
    this.agGrid.printTable(this.gridOptions, v => this.isPrinting = v);
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
    {
      name: 'Report',
      icon: `<mat-icon _ngcontent-glk-c62="" color="primary" role="img" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">analytics</mat-icon>`,
      action: (v) => v ? this.ut.router.navigateByUrl('/child/' + v.id + '/report') : '',
      tooltip: 'View report of the selected child',
    },
  ];

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IChildEntity> = {
    ...this.agGrid.commonGridOptions('children table', this.columnDefs, this.canAddEdit,
      this.goalsStrengthsMenuItems, this.printTable, (item) => { this.edit(item) },
      (e) => {
        e.api.getFilterInstance('isArchive')?.setModel({ values: ['false', false, 'Not Archive'] });
      }
    ),
    onRowClicked: (v) => this.selectedItem = v.data,
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
