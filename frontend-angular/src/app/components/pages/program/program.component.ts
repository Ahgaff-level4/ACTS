import { Component, OnDestroy } from '@angular/core';
import { IProgramEntity } from '../../../../../../interfaces';
import { ProgramService } from 'src/app/services/CRUD/program.service';
import { UtilityService } from 'src/app/services/utility.service';
import { AddEditProgramComponent } from '../../dialogs/add-edit/add-edit-program/add-edit-program.component';
import { ColDef, GridOptions, NewValueParams } from 'ag-grid-community';
import { AgGridService, MyMenuItem } from 'src/app/services/ag-grid.service';
import { Observable, Subscription, first } from 'rxjs';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.scss']
})
export class ProgramComponent extends UnsubOnDestroy {
  public selectedItem?: IProgramEntity;
  public quickFilter: string = '';
  public isPrinting: boolean = false;
  public rowData: Observable<IProgramEntity[]> = this.service.programs$;

  private onCellValueChange = async (e: NewValueParams<IProgramEntity>) => {
    try {
      await this.service.patch(e.data.id, { [e.colDef.field as keyof IProgramEntity]: e.newValue });
      this.nt.notify('Edited successfully', undefined, 'success')
    } catch (e) {
      this.service.fetch();
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
    },
  ];

  printTable() {
    this.agGrid.printTable(this.gridOptions, v => this.isPrinting = v);
  }

  private menuItems: MyMenuItem<IProgramEntity>[] = [
    {
      name: 'Activities',
      icon: `<mat-icon _ngcontent-tvg-c62="" color="primary" role="img" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">interests</mat-icon>`,
      action: (v) => v ? this.ut.router.navigateByUrl('/programs/program/' + v.id + '/activities') : '',
      tooltip: 'View activities of the selected program',
    },
    {
      name: 'Delete',
      icon: `<mat-icon _ngcontent-glk-c62="" color="warn" role="img" class="mat-icon notranslate mat-warn material-icons mat-ligature-font" aria-hidden="true" data-mat-icon-type="font">delete</mat-icon>`,
      action: (v) => this.deleteDialog(v),
      tooltip: 'Delete the selected program',
      disabled: !this.pr.canUser('deleteProgram'),
    },
  ];

  /**Before adding any attribute. Check if it exist in commonGridOptions. So, no overwrite happen!  */
  public gridOptions: GridOptions<IProgramEntity> = {
    ...this.agGrid.commonGridOptions('programs table', this.columnDefs, this.pr.canUser('editProgram'),
      this.menuItems, this.printTable, (item) => { this.addEdit(item) },
      (e) => e.api.sizeColumnsToFit()
    ),
    onSelectionChanged: (e) => this.selectedItem = e.api.getSelectedRows()[0] ?? undefined,
  }

  constructor(private service: ProgramService, public ut: UtilityService, private nt: NotificationService,
    public agGrid: AgGridService, public pr: PrivilegeService) {
    super();
  }

  ngOnInit() {
    this.service.fetch();
  }

  applySearch(event: Event) {
    this.quickFilter = (event.target as HTMLInputElement).value;
  }


  /** if `program` param passed then it is Edit. Otherwise will be Add */
  addEdit(program?: IProgramEntity) {
    this.nt
      .openDialog(AddEditProgramComponent, program);
  }

  deleteDialog(program: IProgramEntity | undefined) {
    if (program == null) {
      this.nt.notify(undefined);
      return;
    }
    this.nt.showMsgDialog({
      content: this.ut.translate('You are about to delete the program: ') + program.name + this.ut.translate(" permanently. All its activities will be deleted! NOTE: You won't be able to delete the program if there is a child with at least one goal that depends on this program."),
      type: 'confirm',
      buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
    }).afterClosed().subscribe(async (v) => {
      if (v === 'Delete') {
        try {
          await this.service.delete(program.id, true);
          this.nt.notify("Deleted successfully", 'The program has been deleted successfully', 'success');
        } catch (e) { }
      }
    })
  }
}
