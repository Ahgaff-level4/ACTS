import { Component } from '@angular/core';
import { ChildService } from 'src/app/services/CRUD/child.service';
import { IChildEntity } from '../../../../../../../interfaces';
import { ColDef, GridOptions, ISetFilterParams, NewValueParams, } from 'ag-grid-enterprise';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { map } from 'rxjs';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { DisplayService } from 'src/app/services/display.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ProgramService } from 'src/app/services/CRUD/program.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.scss'],
})
export class ChildrenComponent extends UnsubOnDestroy {
  public selectedItem?: IChildEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;

  public onChildCellValueChanged = async (e: NewValueParams<IChildEntity>) => {
    try {
      await this.childService.patchChild(e.data.id, { [e.colDef.field as keyof IChildEntity]: e.newValue });
      this.nt.notify('Edited successfully', undefined, 'success')
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
      valueGetter: (v) => this.display.calcAge(v.data?.person.birthDate),//set the under the hood value
      type: 'fromNowNoAgo',
      valueFormatter: (v) => this.display.fromNow(v.data?.person.birthDate, true),
      filter: 'agNumberColumnFilter',
      tooltipValueGetter: (v) => this.display.toDate(v.data?.person.birthDate),
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
      valueGetter: v => this.display.translate(v.data?.person?.gender),
      filterParams: { values: [this.display.translate('Male'), this.display.translate('Female')], },
      width: 110
    },
    {
      field: 'person.createdDatetime',
      headerName: 'Registration date',
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
      valueGetter: (v) => v.data ? this.display.childFamilyInformation(v.data) : '',
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
      valueFormatter: (v) => typeof v.data?.birthOrder == 'number' ? this.display.translate(this.display.ordinalNumbers[v.data.birthOrder - 1]) : '',//todo check the birthOrder value because ordinalNumbers start with First
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
      tooltipValueGetter: (v) => v.data?.parent?.username ? this.display.translate('Username') + ': ' + v.data.parent.username : '',
    },
    {
      field: 'teachers',
      headerName: 'Teachers',
      valueGetter: (v) => this.display.childTeachers(v.data),
      tooltipValueGetter: (v) => v.data?.teachers ? this.display.translate('Username') + ': ' + v.data.teachers.map(v => v.username).join(this.display.translate(', ')) : '',
    },
    {
      field: 'program.name',
      headerName: 'Program',
      type: 'enum',
      valueGetter: (v) => v.data?.program?.name,
      // filterParams: assigned on init
    },
    {
      field: 'isArchive',
      headerName: 'Archive',
      type: 'enum',
      filterParams: {
        values: [true, false],
        valueFormatter: v => v.value == true ? this.display.translate('Archive') : this.display.translate('Not Archive')
      } as ISetFilterParams<IChildEntity, boolean>,
      valueFormatter: v => v.value == true ? this.display.translate('Archive') : this.display.translate('Not Archive'),
      hide: true,
    }
  ];



  // Data that gets displayed in the grid
  public rowData = this.childService.children$.pipe(map(v => {
    if (this.pr.canUser('archiveChild'))
      return this.display.deepClone(v);
    else return this.display.deepClone(v.filter(v => v.isArchive == false));//Parent with archived child can not be viewed
  }));


  constructor(private childService: ChildService, public agGrid: AgGridService,
    public display: DisplayService, public pr: PrivilegeService, private nt: NotificationService,
    private programService: ProgramService, private router:Router,) {
    super();
  }

  ngOnInit() {
    this.childService.fetchChildren(true);
    this.sub.add(this.programService.programs$.subscribe(v => {
      let col = this.gridOptions.api?.getColumnDef('program.name');
      if (col)
        col.filterParams = { values: v.map(n => n.name) }
    }));
  }

  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }

  edit(child: IChildEntity | undefined) {
    if (child || this.selectedItem)
      this.router.navigate(['children', 'edit-child'], { state: { data: child ?? this.selectedItem } });
  }

  printTable() {
    this.agGrid.printTable(this.gridOptions, v => this.isPrinting = v);
  }

  private goalsStrengthsMenuItems: MyMenuItem<IChildEntity>[] = [
    {
      name: 'View',
      icon: `<mat-icon _ngcontent-tvg-c62="" color="primary" role="img" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">wysiwyg</mat-icon>`,
      action: (v) => v ? this.router.navigateByUrl('children/child/' + v.id) : '',
      tooltip: 'View all information',
    },
    {
      name: 'Goals',
      icon: `<mat-icon _ngcontent-tvg-c62="" color="primary" role="img" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">sports_score</mat-icon>`,
      action: (v) => v ? this.router.navigateByUrl('children/child/' + v.id + '/goals') : '',
      tooltip: 'View goals of the selected child',
    },
    {
      name: 'Strengths',
      icon: `<mat-icon _ngcontent-glk-c62="" color="primary" role="img" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">fitness_center</mat-icon>`,
      action: (v) => v ? this.router.navigateByUrl('children/child/' + v.id + '/strengths') : '',
      tooltip: 'View strengths of the selected child',
    },
    {
      name: 'Report',
      icon: `<mat-icon _ngcontent-glk-c62="" color="primary" role="img" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">analytics</mat-icon>`,
      action: (v) => v ? this.router.navigateByUrl('children/child/' + v.id + '/report') : '',
      tooltip: 'View report of the selected child',
    },
  ];

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IChildEntity> = {
    ...this.agGrid.commonGridOptions('children table', this.columnDefs, this.pr.canUser('editChildPage'),
      this.goalsStrengthsMenuItems, this.printTable, (item) => { this.edit(item) },
      (e) => {
        e.api.getFilterInstance('isArchive')?.setModel({ values: ['false', false, 'Not Archive'] });
        if (!this.pr.canUser('archiveChild')) {
          this.columnDefs.splice(this.columnDefs.map(v => v.field).indexOf('isArchive'), 1);
          this.gridOptions.api?.setColumnDefs(this.columnDefs);
        }
        this.gridOptions.api?.redrawRows();
      }
    ),
    onSelectionChanged: (e) => this.selectedItem = e.api.getSelectedRows()[0] ?? undefined,
  }

}
