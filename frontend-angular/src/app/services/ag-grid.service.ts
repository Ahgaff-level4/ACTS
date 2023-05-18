import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ColDef, GetLocaleTextParams, GridApi, GridOptions, MenuItemDef, SideBarDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root'
})
export class AgGridService {

  constructor(public ut: UtilityService,) { }

  /**
   * @param data any nested object
   * @param field dot separated key. Ex:`person.name`
   * @returns the nested value or null.
   */
  private getNestedValue(data: any, field: string) {
    // split the field string by dots
    let parts = field.split('.');
    // start with the data object
    let value = data;
    // loop through the parts and access the properties
    for (let part of parts) {
      value = value[part];
      // if value is undefined or null, stop the loop
      if (value == null) break;
    }
    // return the final value
    return value;
  }

  public exportCSV(gridApi: GridApi<any> | undefined | null) {
    gridApi?.exportDataAsCsv();
  }
  public exportExcel(gridApi: GridApi<any> | undefined | null) {
    gridApi?.exportDataAsExcel();
  }

  public exportClipboard(gridApi: GridApi<any> | undefined | null, includeHeaders: boolean) {
    if (gridApi) {
      gridApi.selectAll();
      gridApi.copySelectedRowsToClipboard({ includeHeaders });
      this.ut.showSnackbar('Copied to clipboard');
    } else this.ut.showSnackbar(undefined);
  }

  // public copySelectedRow(gridApi: GridApi<any>|undefined|null, includeHeaders: boolean) {
  //   if (gridApi) {
  //     gridApi.copySelectedRowsToClipboard({ includeHeaders });
  //     this.ut.showSnackbar('Copied to clipboard');
  //   } else this.ut.showSnackbar(undefined);
  // }

  private gridOptionsProperties: GridOptions = {
    pagination: true,
    paginationPageSize: 10,
    rowSelection: 'single',
    animateRows: true,
    enableBrowserTooltips: true,
    preventDefaultOnContextMenu: true,
    suppressClipboardPaste: true,
    suppressCutToClipboard: true,
    enableRtl: this.ut.currentLang == 'ar' ? true : false,
  }

  private tapColumnDefs(columnDefs: ColDef<any>[], canEdit: boolean): ColDef<any>[] {
    return columnDefs.map(v => {
      v.editable = typeof v.onCellValueChanged == 'function' && canEdit;
      v.headerName = this.ut.translate(v.headerName);
      if (v.type?.includes('fromNow') || v.type?.includes('toDate')) {

        v.filter = 'agDateColumnFilter'
        v.filterParams = {
          comparator: function (filterLocalDateAtMidnight: string, cellValue: string) {
            var cellMoment = this.ut.moment(cellValue, 'YYYY-MM-DD');
            if (cellMoment.isBefore(filterLocalDateAtMidnight))
              return -1;
            else if (cellMoment.isAfter(filterLocalDateAtMidnight))
              return 1;
            return 0;
          }
        }
      }
      v.headerTooltip = v.headerName;
      return v;
    })
  }

  private columnTypes: { [key: string]: ColDef<any> } = {
    fromNow: {
      valueFormatter: (v) => this.ut.fromNow(v.value),//set the presentational value
      chartDataType: 'time',
      tooltipValueGetter: (v) => this.ut.toDate(v.value),
      valueGetter: v => this.ut.toDate(this.getNestedValue(v.data, v.colDef.field!)),
      width: 150,
    },
    fromNowNoAgo: {
      valueFormatter: (v) => this.ut.fromNow(v.value, true),//set the presentational value
      chartDataType: 'time',
      tooltipValueGetter: (v) => this.ut.toDate(v.value),
      valueGetter: v => this.ut.toDate(this.getNestedValue(v.data, v.colDef.field!)),
      width: 100,
    },
    toDate: {
      valueFormatter: (v) => this.ut.toDate(v.value),
      valueGetter: v => this.ut.toDate(this.getNestedValue(v.data, v.colDef.field!)),
      chartDataType: 'time',
      width: 100,
    },
    long: {
      tooltipValueGetter: function (v) { return v.value },//To show what the cell can't, because of the cell size but the text is long.
    }
  }

  private defaultColDef: ColDef<any> = {
    sortable: true,
    filter: 'agTextColumnFilter',
    checkboxSelection: false,
    // wrapText:true,//true will prevent the three dots for long text `long text...`
    resizable: true,
    enablePivot: false,
    rowGroup: false,
  }

  private sideBar: SideBarDef = {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: this.ut.translate('Columns'),
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
        }
      },
      {
        id: 'filters',
        labelDefault: this.ut.translate('Filters'),
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
      },
    ],
  }

  private getLocaleText = (params: GetLocaleTextParams<any, any>): string => {
    const { key, defaultValue } = params;
    const t = this.ut.translate(key);//in english `t` will equal `key`. This is normal
    if ((t == key && t != defaultValue) || t.trim() == '')
      return defaultValue;
    return t;
  }

  /**used in ag-grid by javascript destruction. Ex: myGridOptions={...this.ut.commonGridOptions(...),(add your own options)}
* @param keyTableName use to store/restore table state from localStorage.
* @param columnDefs used to set its `editable` base on if onCellChange exists. `headerName` will be translated
* @param canEdit to set editable. And if user double click will show error message.
* @param menu right-click menu. There are default items (e.g., `Copy row`, `Table > ...`,etc) your menu items will be appended before default items
* @param editRowAction if provided then do not provide `Edit row` item in `menu` param. This will add `Edit row` menu item with the action provided.
* @param printTable a function that will be called on menu>Table>print clicked.
* @returns Object of common grid options.
*/
  public commonGridOptions = <IEntity>(keyTableName: string, columnDefs: ColDef<IEntity>[], canEdit: boolean, menu: MyMenuItem<IEntity>[] | null, printTable: () => void, editRowAction?: (item: IEntity | undefined) => void): GridOptions<IEntity> => {
    return {/** DefaultColDef sets props common to all Columns*/
      ...this.gridOptionsProperties,
      columnDefs: this.tapColumnDefs(columnDefs, canEdit),
      columnTypes: this.columnTypes,
      defaultColDef: this.defaultColDef,
      sideBar: this.sideBar,
      onCellDoubleClicked: async (e) => {
        if (!canEdit)
          this.ut.showSnackbar("You don't have sufficient privilege to edit!");
        else if (e.colDef.editable !== true)
          this.ut.showSnackbar("You can't edit any row in this column directly!");
      },
      onGridReady: e => {//restore table state
        let prevState = JSON.parse(localStorage.getItem(keyTableName) ?? 'null');
        prevState && e.columnApi.applyColumnState({ state: prevState });
        prevState && e.api.refreshCells();
      },//save table state in Pinned, Moved, and Visible.
      onColumnPinned: e => { localStorage.setItem(keyTableName, JSON.stringify(e.columnApi.getColumnState())) },
      onColumnMoved: e => { localStorage.setItem(keyTableName, JSON.stringify(e.columnApi.getColumnState())) },
      onColumnVisible: e => { localStorage.setItem(keyTableName, JSON.stringify(e.columnApi.getColumnState())) },
      getLocaleText: this.getLocaleText,
      getContextMenuItems: v => {

        console.log('getContextMenuItems : v=', v);
        /** Menu structure:
         * <<menu param items>>
         * Copy =>
         *          Copy cell
         *          Copy row     Ctrl+C
         *          Copy row (with headers)
         * separator --------
         * table =>
         *          Export as CSV
         *          Export as Excel
         *          Print
         *          Copy table
         *          Copy table (with headers)
        */
        const copyIcon = '<mat-icon _ngcontent-xxc-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">content_copy</mat-icon>';
        const items: MenuItemDef[] = [];
        if (editRowAction)
          items.push({
            name: this.ut.translate('Edit row'),
            icon: '<mat-icon _ngcontent-cen-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">edit</mat-icon>',
            action: () => editRowAction(v.node?.data),
            disabled: !canEdit
          });

        if (menu)
          items.push(...menu.map(item => {
            let action = item.action;
            if (typeof action == 'function')
              item.action = () => action!(v.node?.data);
            if (item.name)
              item.name = this.ut.translate(item.name);
            if (item.tooltip)
              item.tooltip = this.ut.translate(item.tooltip)
            return item;
          }));

        return [...items, {
          name: this.ut.translate('Copy'),
          icon: copyIcon,
          subMenu: [{
            name: this.ut.translate('Copy cell'),
            icon: copyIcon,
            // action:()=>{}//todo set e.value into clipboard aka copy
          },
          {
            name: this.ut.translate('Copy row'),
            icon: copyIcon,
            shortcut: 'Ctrl + C',
            action: v.api.copyToClipboard,
          },
          {
            name: this.ut.translate('Copy row (with headers)'),
            icon: copyIcon,
            action: () => v.api.copyToClipboard({ includeHeaders: true })
          },
          {
            name: this.ut.translate('Copy table'),
            icon: copyIcon,
            action: () => this.exportClipboard(v.api, false),
          },
          {
            name: this.ut.translate('Copy table (with headers)'),
            icon: `<mat-icon _ngcontent-ceh-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">table_view</mat-icon>`,
            action: () => this.exportClipboard(v.api, true),
          },]
        }, 'separator',
        {
          name: this.ut.translate('Export table'),
          icon: '<mat-icon _ngcontent-qgp-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">ios_share</mat-icon>',
          subMenu: [
            {
              name: this.ut.translate('Export as CSV'),
              icon: '<mat-icon _ngcontent-hwt-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">download</mat-icon>',
              action: () => this.exportCSV(v.api),
            },
            {
              name: this.ut.translate('Export as Excel'),
              icon: '<mat-icon _ngcontent-hwt-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">download</mat-icon>',
              action: () => this.exportExcel(v.api),
            },
            {
              name: this.ut.translate('Print'),
              icon: `<mat-icon _ngcontent-xhr-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">print</mat-icon>`,
              action: printTable,
            },

          ],
        },
        ]
        // name: string, // name of menu item
        // disabled?: boolean, // if item should be enabled / disabled
        // shortcut?: string, // shortcut (just display text, saying the shortcut here does nothing)
        // action?: ()=>void, // function that gets executed when item is chosen
        // checked?: boolean, // set to true to provide a check beside the option
        // icon?: HTMLElement|string, // the icon to display beside the icon, either a DOM element or HTML string
        // subMenu?: MenuItemDef[] // if this menu is a sub menu, contains a list of sub menu item definitions
        // cssClasses?: string[]; //Additional CSS classes to be applied to the menu item
        // tooltip?: string; //Optional tooltip for the menu item
      },
    }
  }
}

export interface MyMenuItem<IEntity> {
  /** Name of the menu item. No need for translation, it will be translated */
  name: string;
  /** It the item should be enabled / disabled */
  disabled?: boolean;
  /** Shortcut (just display text, saying the shortcut here does nothing) */
  shortcut?: string;
  /** Function that gets executed when item is chosen */
  /** Set to true to provide a check beside the option */
  checked?: boolean;
  /** The icon to display, either a DOM element or HTML string */
  icon?: Element | string;
  /** CSS classes to apply to the menu item */
  cssClasses?: string[];
  /** Tooltip for the menu item. It will be translated */
  tooltip?: string;
  /** On click action will be called */
  action?(entity?: IEntity): void
}
