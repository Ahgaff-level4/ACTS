import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ColDef, GetContextMenuItemsParams, GetLocaleTextParams, GridApi, GridOptions, MenuItemDef, SideBarDef } from 'ag-grid-enterprise';
import { GridReadyEvent } from 'ag-grid-community';
import { Clipboard } from '@angular/cdk/clipboard';

@Injectable({
  providedIn: 'root'
})
export class AgGridService {

  constructor(public ut: UtilityService, private clipboard: Clipboard) { }

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
    enableCellTextSelection: true,
    ensureDomOrder: true,
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

      if (v.filter == 'agSetColumnFilter')
        v.filterParams.suppressMiniFilter = true;

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
* @param printTable a function that will be called on menu>Table>print clicked.
* @param editRowAction if provided then do not provide `Edit row` item in `menu` param. This will add `Edit row` menu item with the action provided.
* @param onGridReady USE THIS if you want to use onGridReady. Using `onGridReady` on your `GridOptions` will overwrite the `onGridReady` used in `commonGridOptions`
* @returns Object of common grid options.
*/
  public commonGridOptions = <IEntity>(keyTableName: string, columnDefs: ColDef<IEntity>[],
    canEdit: boolean, menu: MyMenuItem<IEntity>[] | null | undefined, printTable: () => void | null,
    editRowAction?: (item: IEntity | undefined) => void, onGridReady?: (event: GridReadyEvent) => void,
  ): GridOptions<IEntity> => {
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
        onGridReady && onGridReady(e);
      },//save table state in Pinned, Moved, and Visible.
      onColumnPinned: e => { localStorage.setItem(keyTableName, JSON.stringify(e.columnApi.getColumnState())) },
      onColumnMoved: e => { localStorage.setItem(keyTableName, JSON.stringify(e.columnApi.getColumnState())) },
      onColumnVisible: e => { localStorage.setItem(keyTableName, JSON.stringify(e.columnApi.getColumnState())) },
      getLocaleText: this.getLocaleText,
      getContextMenuItems: v => {
        /** Menu structure:
         * Edit row <<if `editRowAction` is Function>>
         * <<menu param items>>
         * Copy =>
         *          Copy cell
         *          Copy row     Ctrl+C
         *          Copy row (with headers)
         * -------- separator --------
         * table =>
         *          Export as CSV
         *          Export as Excel
         *          Print
         *          Copy table
         *          Copy table (with headers)
        */
        const copyIcon = '<mat-icon _ngcontent-xxc-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">content_copy</mat-icon>';
        const items: MenuItemDef[] = [];
        if (typeof editRowAction == 'function')
          items.push({
            name: this.ut.translate('Edit row'),
            icon: '<mat-icon _ngcontent-cen-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">edit</mat-icon>',
            action: () => editRowAction(v.node?.data),
            disabled: !canEdit
          });

        if (Array.isArray(menu))
          items.push(...menu.map(this.mapMyMenuItemToMenuItemDef(v.node?.data)));

        return [...items, {
          name: this.ut.translate('Copy'),
          icon: copyIcon,
          subMenu: this.copySubMenu(v, copyIcon),
        },
          'separator',
        {
          name: this.ut.translate('Export table'),
          icon: '<mat-icon _ngcontent-qgp-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">ios_share</mat-icon>',
          subMenu: this.exportTableSubMenu(v.api, printTable),
        },
        ]
      },
    }
  }
  /*Used inside map of MyMenuItem[] array. Convert array items from `MyMenuItem` to `MenuItemDef` AND translate `name` and `tooltip` properties. */
  private mapMyMenuItemToMenuItemDef<E>(data: E): (item: MyMenuItem<E>) => MenuItemDef {
    return (item) => {
      let action = item.action;
      if (typeof action == 'function')
        item.action = () => action!(data);
      if (item.name)
        item.name = this.ut.translate(item.name);
      if (item.tooltip)
        item.tooltip = this.ut.translate(item.tooltip);
      return item;
    }
  }

  private copySubMenu(menuParam: GetContextMenuItemsParams, copyIcon: string): (string | MenuItemDef)[] {
    const api = menuParam.api;
    return [{
      name: this.ut.translate('Copy cell'),
      icon: copyIcon,
      action: () => {
        this.clipboard.copy(menuParam.value) == false ? this.ut.showSnackbar(undefined) : '';
      }
    },
    {
      name: this.ut.translate('Copy row'),
      icon: copyIcon,
      shortcut: 'Ctrl + C',
      action: api.copyToClipboard,
    },
    {
      name: this.ut.translate('Copy row (with headers)'),
      icon: copyIcon,
      action: () => api.copyToClipboard({ includeHeaders: true })
    }, 'separator',
    {
      name: this.ut.translate('Copy table'),
      icon: copyIcon,
      action: () => this.exportClipboard(api, false),
    },
    {
      name: this.ut.translate('Copy table (with headers)'),
      icon: `<mat-icon _ngcontent-ceh-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">table_view</mat-icon>`,
      action: () => this.exportClipboard(api, true),
    },]
  }

  private exportTableSubMenu(api: GridApi, printTable: () => void | null): (string | MenuItemDef)[] {
    const tableMenu = [{
      name: this.ut.translate('Export as CSV'),
      icon: '<mat-icon _ngcontent-hwt-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">download</mat-icon>',
      action: () => this.exportCSV(api),
    },
    {
      name: this.ut.translate('Export as Excel'),
      icon: '<mat-icon _ngcontent-hwt-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">download</mat-icon>',
      action: () => this.exportExcel(api),
    },];
    if (printTable)
      tableMenu.push({
        name: this.ut.translate('Print'),
        icon: `<mat-icon _ngcontent-xhr-c62="" role="img" color="primary" class="mat-icon notranslate mat-primary material-icons mat-ligature-font" aria-hidden="true" ng-reflect-color="primary" data-mat-icon-type="font">print</mat-icon>`,
        action: printTable,
      });
    return tableMenu;
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
