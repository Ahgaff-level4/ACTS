import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { IChildEntity, IStrengthEntity } from '../../../../../../interfaces';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { StrengthService } from 'src/app/services/strength.service';
import { AddEditStrengthComponent } from '../../dialogs/add-edit/add-edit-strength/add-edit-strength.component';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { ColDef, GridOptions, NewValueParams } from 'ag-grid-community';
import { FieldService } from 'src/app/services/field.service';
import { ProgramService } from 'src/app/services/program.service';

@Component({
  selector: 'app-strength',
  templateUrl: './strength.component.html',
  styleUrls: ['./strength.component.scss']
})
export class StrengthComponent {
  public canAdd: boolean = this.ut.userHasAny('Admin', 'Teacher');
  public canEditDelete: boolean = this.ut.userHasAny('Admin', 'Teacher', 'HeadOfDepartment');
  public selectedItem?: IStrengthEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;
  /**don't use `rowData` 'cause child has goals for `rowData`*/
  public childItsStrengths: IChildEntity | undefined;
  private sub: Subscription = new Subscription();

  private onCellValueChange = async (e: NewValueParams<IStrengthEntity>) => {
    try {
      await this.service.patch(e.data.id, { [e.colDef.field as keyof IStrengthEntity]: e.newValue });
      this.ut.showSnackbar('Edited successfully')
    } catch (e) {
      if (this.childItsStrengths)
        await this.service.fetchChildItsStrengths(this.childItsStrengths.id).catch(() => { });
      this.gridOptions?.api?.refreshCells();
    }
  }


  /**
* @see [ag-grid.service](./../../../services/ag-grid.service.ts) for more information of how to set the columnDef properties.
  */
  public columnDefs: (ColDef<IStrengthEntity>)[] = [
    {
      field: 'activity.name',
      headerName: 'Activity',
      type: 'long',
    },
    {
      field: 'activity.program.name',
      headerName: 'Program',
      type: 'enum',//filterParams in init
      valueGetter: (v) => v.data?.activity?.program?.name ?? this.ut.translate('«Special activity»'),
    },
    {
      field: 'activity.field.name',
      headerName: 'Field',
      type: 'enum',//filterParams in init
    },
    {
      field: 'note',
      headerName: 'Note',
      type: 'long',
      onCellValueChanged: this.onCellValueChange,
    },
    {
      field: 'assignDatetime',
      headerName: 'Assign Date',
      type: 'fromNow',
      onCellValueChanged: this.onCellValueChange,
    },
    {
      field: 'teacher.person.name',
      headerName: 'By Teacher',
      type: 'long',
    },
  ];


  private menuItems: MyMenuItem<IStrengthEntity>[] = [
    {
      name: 'Delete',
      icon: `<mat-icon _ngcontent-glk-c62="" color="warn" role="img" class="mat-icon notranslate mat-warn material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">delete</mat-icon>`,
      action: (v) => this.deleteDialog(v),
      tooltip: 'Delete the selected strength',
      disabled: !this.canEditDelete,
    },
  ];

  constructor(public service: StrengthService, public ut: UtilityService,
    private dialog: MatDialog, private route: ActivatedRoute,
    public agGrid: AgGridService, private fieldService:FieldService,
    private programService:ProgramService) {
  }



  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: async params => {
        let childId = params.get('id');
        console.log('childId=',childId)
        if (typeof childId === 'string')
          this.sub.add(this.service.childItsStrengths.subscribe(async v => {
            if (v && v.id == +(childId as string))
              this.childItsStrengths = v;
            else await this.service.fetchChildItsStrengths(+(childId as string), true).catch(() => { });
          }));
        else this.ut.errorDefaultDialog("Sorry, there was a problem fetching the child's strengths. Please try again later or check your connection.")
      },
    });

    this.sub.add(this.fieldService.fields.subscribe(v => {
      let col = this.gridOptions.api?.getColumnDef('activity.field.name');
      if (col)
        col.filterParams = { values: v.map(n => n.name) }
    }));

    this.sub.add(this.programService.programs.subscribe(v => {
      let col = this.gridOptions.api?.getColumnDef('activity.program.name');
      if (col)
        col.filterParams = { values: [...v.map(n => n.name), this.ut.translate('«Special activity»')] };
    }));

    this.sub.add(this.ut.user.subscribe(v => {
      this.canAdd = this.ut.userHasAny('Admin', 'Teacher');
      this.canEditDelete = this.ut.userHasAny('Admin', 'Teacher', 'HeadOfDepartment');
    }));
  }

  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }

  printTable() {
    this.agGrid.printTable(this.gridOptions, v => this.isPrinting = v);
  }

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IStrengthEntity> = {
    ...this.agGrid.commonGridOptions('strengths table', this.columnDefs, this.canEditDelete,
      this.menuItems, this.printTable, (item) => { this.addEdit(item) },
    ),
    onRowClicked: (v) => this.selectedItem = v.data,
  }

  /** @param strengthOrChildId is either a strength to be Edit. Or childId to be Add */
  addEdit(strengthOrChildId?: IStrengthEntity | number) {
    if (typeof strengthOrChildId != 'object' && typeof strengthOrChildId != 'number')
      this.ut.errorDefaultDialog(undefined);
    else
      this.dialog
        .open<AddEditStrengthComponent, IStrengthEntity | number, 'edited' | 'added' | null>(AddEditStrengthComponent, { data: strengthOrChildId })
  }

  deleteDialog(strength?: IStrengthEntity) {
    if (strength == null)
      this.ut.showSnackbar(undefined);
    else
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
