import { Component } from '@angular/core';
import { IProgramEntity } from '../../../../../../interfaces';
import { ProgramService } from 'src/app/services/program.service';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { AddEditProgramComponent } from '../../dialogs/add-edit/add-edit-program/add-edit-program.component';
import { ColDef, GridOptions, NewValueParams } from 'ag-grid-community';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.scss']
})
export class ProgramComponent {
  public canAddEditDelete: boolean = this.ut.userHasAny('Admin', 'HeadOfDepartment');;
  public selectedItem?: IProgramEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;
  public rowData: IProgramEntity[] | undefined;

  private onCellValueChange = async (e: NewValueParams<IProgramEntity>) => {
    try {
      await this.service.patch(e.data.id, { [e.colDef.field as keyof IProgramEntity]: e.newValue });
      this.ut.showSnackbar('Edited successfully')
    } catch (e) {
      this.service.programs.pipe(first()).subscribe(v => {
        this.rowData = v.map(n => ({ ...n }));
        this.gridOptions?.api?.refreshCells();
      });
    }
  }

  /**
* @see [ag-grid.service](./../../../services/ag-grid.service.ts) for more information of how to set the columnDef properties.
  */
  public columnDefs: (ColDef<IProgramEntity>)[] = [
    {
      field: 'name',
      headerName: 'Program name',//headerName will be translated
      type: 'long',
      onCellValueChanged: this.onCellValueChange,
    },
    {
      field: 'activityCount',
      headerName: 'Number of Activities',
      type: 'number',
    },
    {
      field: 'createdDatetime',
      headerName: 'Created Date',
      type: 'fromNow',
      onCellValueChanged: this.onCellValueChange,
    },
  ];

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

  private menuItems: MyMenuItem<IProgramEntity>[] = [
    {
      name: 'Activities',
      icon: `<mat-icon _ngcontent-tvg-c62="" color="primary" role="img" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">interests</mat-icon>`,
      action: (v) => v ? this.ut.router.navigateByUrl('/program/' + v.id + '/activities') : '',
      tooltip: 'View activities of the selected program',
    },
    {
      name: 'Delete',
      icon: `<mat-icon _ngcontent-glk-c62="" color="warn" role="img" class="mat-icon notranslate mat-warn material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">delete</mat-icon>`,
      action: (v) => this.deleteDialog(v),
      tooltip: 'Delete the selected program',
      disabled: !this.canAddEditDelete,
    },
  ];

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IProgramEntity> = {
    ...this.agGrid.commonGridOptions('programs table', this.columnDefs, this.canAddEditDelete,
      this.menuItems, this.printTable, (item) => { this.addEdit(item) },
      (e) => e.api.sizeColumnsToFit()
    ),
    onRowClicked: (v) => this.selectedItem = v.data,
  }

  constructor(private service: ProgramService, public ut: UtilityService, private dialog: MatDialog, public agGrid: AgGridService) {
  }

  ngOnInit(): void {

    this.service.programs.subscribe({
      next: v => {
        this.rowData = v.map(n => ({ ...n }));
      }
    });

    this.ut.user.subscribe(v => {
      this.canAddEditDelete = this.ut.userHasAny('Admin', 'HeadOfDepartment');
    });
  }



  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }


  /** if `data` param passed then it is Edit. Otherwise will be Add */
  addEdit(data?: IProgramEntity) {
    this.dialog
      .open<AddEditProgramComponent, IProgramEntity>(AddEditProgramComponent, { data });
  }

  deleteDialog(program: IProgramEntity | undefined) {
    if (program == null) {
      this.ut.showSnackbar(undefined);
      return;
    }
    this.ut.showMsgDialog({
      content: this.ut.translate('You are about to delete the program: ') + program.name + this.ut.translate(" permanently. All its activities will be deleted! NOTE: You won't be able to delete the program if there is a child with at least one goal that depends on this program."),
      type: 'confirm',
      buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
    }).afterClosed().subscribe(async (v) => {
      if (v === 'Delete') {
        try {
          await this.service.delete(program.id, true);
          this.ut.showSnackbar('The program has been deleted successfully.');
        } catch (e) { }
      }
    })

  }
}
