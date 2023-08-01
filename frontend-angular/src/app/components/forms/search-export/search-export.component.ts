import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GridApi, GridOptions } from 'ag-grid-community';
import { AgGridService } from 'src/app/services/ag-grid.service';
import { PrivilegeService, } from 'src/app/services/privilege.service';
import { DisplayService } from 'src/app/services/display.service';

@Component({
  selector: 'app-search-export[isPrinting][gridOptions][keyup][print]',
  templateUrl: './search-export.component.html',
  styleUrls: ['./search-export.component.scss']
})
export class SearchExportComponent {
  @Input() isPrinting!: boolean;
  @Output() keyup: EventEmitter<Event> = new EventEmitter<Event>();
  @Output() print: EventEmitter<void> = new EventEmitter<void>();
  @Input() gridOptions!: GridOptions<any>;
  constructor(public agGridService: AgGridService, public pr: PrivilegeService) { }
}
