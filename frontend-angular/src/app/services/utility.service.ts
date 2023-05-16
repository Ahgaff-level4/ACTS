import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role, SuccessResponse, User, ErrorResponse } from './../../../../interfaces.d';
import { BehaviorSubject } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ButtonType, MessageDialogComponent, MessageDialogData } from '../components/dialogs/message/message.component';
import * as moment from 'moment';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FromNowPipe } from '../pipes/from-now.pipe';
import { CalcAgePipe } from '../pipes/calc-age.pipe';
import { DatePipe } from '../pipes/date.pipe';
import { ColDef, GridOptions } from 'ag-grid-community';
@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  public user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);//null means not loggedIn and there is no user info
  public ordinalNumbers = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-first', 'Twenty-second', 'Twenty-third', 'Twenty-fourth', 'Twenty-fifth', 'Twenty-sixth', 'Twenty-seventh', 'Twenty-eighth', 'Twenty-ninth', 'Thirtieth'];
  public isLoading = new BehaviorSubject<boolean>(false);
  /**Used in ag-grid options. So, that we generalize some common columns' options by setting the type of the column with one of these types */



  /**used in ag-grid by javascript destruction. Ex: myGridOptions={...this.ut.commonGridOptions(...),(add your own options)}
  * @param keyTableName use to store/restore table state from localStorage.
  * @param columnDefs used to set its `editable` base on if onCellChange exists. `headerName` will be translated
  * @param canEdit to set editable. And if user double click will show error message.
  * @param menu right-click menu.
  * @returns Object of common grid options.
  */
  public commonGridOptions = (keyTableName: string, columnDefs: ColDef<any>[], canEdit: boolean, menu: { icon: string, title: string }[] | null): GridOptions => {
    return {/** DefaultColDef sets props common to all Columns*/
      pagination: true,
      rowSelection: 'single',
      animateRows: true,
      enableBrowserTooltips: true,
      // sideBar: ['Hello'],//todo how to implement sideBar for columns show/hide
      columnDefs: columnDefs.map(v => {
        v.editable = typeof v.onCellValueChanged == 'function' && canEdit;
        v.headerName = this.translate(v.headerName);
        if (v.field?.toLowerCase().includes('date') && typeof v.filter != 'string') {
          v.filter = 'agDateColumnFilter'
          v.filterParams = {
            comparator: function (filterLocalDateAtMidnight: string, cellValue: string) {
              var cellMoment = moment(cellValue, 'YYYY-MM-DD');
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
      }),
      columnTypes: {
        fromNow: {
          valueFormatter: (v) => this.fromNow(v.value),//set the presentational value
          chartDataType: 'time',
          tooltipValueGetter: (v) => this.toDate(v.value),
          width: 150,
        },
        fromNowNoAgo: {
          valueFormatter: (v) => this.fromNow(v.value, true),//set the presentational value
          chartDataType: 'time',
          tooltipValueGetter: (v) => this.toDate(v.value),
          width: 100
        },
        long: {
          tooltipValueGetter: function (v) { return v.value },//To show what the cell can't, because of the cell size but the text is long.
        }
      },
      defaultColDef: {
        sortable: true,
        filter: 'agTextColumnFilter',
        checkboxSelection: false,
        // wrapText:true,//true will prevent the three dots for long text `long text...`
        resizable: true,
        enablePivot: false,
        rowGroup: false,

      },
      sideBar: {
        toolPanels: [
          {
            id: 'columns',
            labelDefault: this.translate('Columns'),
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',

            toolPanelParams: {
              suppressRowGroups: true,
              suppressValues: true,
              suppressPivots: true,
              suppressPivotMode: true
            }
          }
        ],
        // defaultToolPanel: 'columns'//show panel on init
      },
      onCellDoubleClicked: async (e) => {
        if (!canEdit)
          this.showSnackbar("You don't have sufficient privilege to edit!");
        else if (e.colDef.editable !== true)
          this.showSnackbar("You can't edit any row in this column directly!");
      },
      onCellContextMenu: (e) => {
        console.log('show add/edit/delete menu', e)
        //todo show add/edit/delete menu
      },
      onGridReady: e => {//restore table state
        let prevState = JSON.parse(localStorage.getItem(keyTableName) ?? 'null');
        prevState && e.columnApi.applyColumnState({ state: prevState });
      },//save table state in Pinned, Moved, and Visible.
      onColumnPinned: e => {localStorage.setItem(keyTableName, JSON.stringify(e.columnApi.getColumnState()));console.log('saved')},
      onColumnMoved: e => {localStorage.setItem(keyTableName, JSON.stringify(e.columnApi.getColumnState()));console.log('saved')},
      onColumnVisible: e => {localStorage.setItem(keyTableName, JSON.stringify(e.columnApi.getColumnState()));console.log('saved')},
      // onColumnEverythingChanged: e => {localStorage.setItem(keyTableName, JSON.stringify(e.columnApi.getColumnState()));console.log('saved')},
    };
  }

  constructor(private http: HttpClient, private translatePipe: TranslatePipe, private toDatePipe: DatePipe, private calcAgePipe: CalcAgePipe, private fromNowPipe: FromNowPipe, private dialog: MatDialog, public router: Router, private snackbar: MatSnackBar) {
  }


  /**
   * promise will be fulfilled and user.next(...) will be called if user is login. otherwise rejected.
   */
  public isLogin = () => {
    return new Promise<void>((resolve, rej) => {
      this.http.get<User>(env.AUTH + 'isLogin').subscribe({
        next: res => {
          if (typeof res?.accountId === 'number' && Array.isArray(res?.roles)) {
            this.user.next(res);
            resolve();
          } else {
            this.user.next(null);
            rej();
          }
        }, error: () => {
          this.user.next(null);
          rej();
        }
      });
    });
  }


  /**
   * Display error dialog with message of:
   * - if `HttpErrorResponse` then extract the error `message`.
   * - if string then message is `eOrMessage`.
   * - else show default message (e.g., 'Something Went Wrong!') followed by `appendMsg` if exist.
   * @param eOrMessage
   * @param appendMsg used when error could not be identified and will be appended after the default error message: `'Something Went Wrong! '+appendMsg`
   */
  public errorDefaultDialog = (eOrMessage?: HttpErrorResponse | string | ErrorResponse | SuccessResponse, appendMsg?: string): MatDialogRef<MessageDialogComponent, any> => {
    console.warn('UtilityService : errorDefaultDialog : eOrMessage:', eOrMessage);

    let message: string;
    if (typeof eOrMessage === 'string')
      message = eOrMessage;
    else if (eOrMessage instanceof HttpErrorResponse && eOrMessage?.error?.message)
      message = eOrMessage.error.message;
    else if (typeof (eOrMessage as ErrorResponse)?.success === 'boolean'
      && typeof (eOrMessage as ErrorResponse)?.message === 'string')
      message = eOrMessage?.message;
    else
      message = this.translatePipe.transform('Something went wrong!') + ' ' + (appendMsg ? this.translatePipe.transform(appendMsg) : this.translatePipe.transform('Sorry, there was a problem. Please try again later or check your connection.'));

    return this.showMsgDialog({ content: message, type: 'error' })
  }

  /**
   * We recommend using pipe translate (e.g., `<h1>{{title | translate}}</h1>`)
   * @param key key inside the ar.json file. If `null` or `undefined` returns empty string
   * @returns correspond value of the provided key translation (e.g., 'Login' or 'تسجيل دخول')
   */
  public translate(key: string | null | undefined, ...args: any[]): string {
    if (key === null || key === undefined)
      return '';
    return this.translatePipe.transform(key, args);
  }

  /**
  *
  * @param value date object
  * @param noAgo boolean|undefined
  * @returns string user friendly date from now.
  * - If `noAgo==true` Ex: `4 months`, `2 days`.
  * - If `noAgo==undefined|false` Ex: `4 months ago`, `2 days ago`.
  * - If value is not expected returns empty string.
  */
  public fromNow(value: string | Date | moment.Moment | null | undefined, noAgo?: boolean): string {
    return this.fromNowPipe.transform(value, noAgo) ?? '';
  }

  /**@returns string format as 'yyyy/M/D' */
  public toDate(value: string | Date | moment.Moment | null | undefined): string {
    return this.toDatePipe.transform(value);
  }

  /**
   * @returns number of years from provided date until now.
   * NOTE: IF PROVIDED DATE IS INVALID THEN IT RETURNS `0` */
  public calcAge(value: string | Date | moment.Moment | null | undefined): number {
    return this.calcAgePipe.transform(value);
  }

  /**
   *
   * @param data structure of the message dialog
   * @returns MatDialogRef. Value when close is the button type clicked.
   */
  public showMsgDialog(data: MessageDialogData) {
    return this.dialog
      .open<MessageDialogComponent, MessageDialogData, ButtonType>(MessageDialogComponent, { data });
  }

  /**
   * @return `true` if user's roles has any one role of the param `roles`. If user has no role overlap with param `roles` then return `false`
   */
  public userHasAny(...roles: Role[]) {
    if (this.user.value)
      for (let r of this.user.value.roles)
        if (roles.includes(r))
          return true;

    return false;
  }

  /**
   * Used in formGroup to setValue of formGroup.controls with the correspond object properties.
   * Ex: `keys={'name':FormControl...}` and `properties={'name':'Ahmad','age':20,...}`
   * return `{'name':'Ahmad'}` and ignore any other property in `properties` param
   * @param keys
   * @param properties
   */
  public extractFrom(keys: { [key: string]: any }, properties: { [key: string]: any }) {
    let ret: { [key: string]: any } = {};
    if (!keys || !properties)
      console.error('Unexpected param!', keys, properties)
    for (let k in keys) {
      ret[k] = properties[k] ?? null;
    }
    return ret;
  }

  /**
   * Used to send the changed fields to the server.
   * @param controls formGroup.controls
   * @returns the only changed fields of the entity that formGroup represent OR null if there is no change instead of empty object `{}`
   */
  public extractDirty(controls: { [key: string]: AbstractControl<any, any> }): { [key: string]: any } | null {
    let ret: { [key: string]: any } = {};
    for (let key in controls)
      if (controls[key].dirty) {
        ret[key] = controls[key].value;
        if (typeof ret[key] == 'string' && key != 'password')
          ret[key] = ret[key].toString();
        if (ret[key] instanceof moment || moment.isMoment(ret[key]))
          ret[key] = ret[key].toDate().toISOString();
      }

    console.log('extractDirty', ret);
    return Object.keys(ret).length == 0 ? null : ret;
  }

  /**
   * loop for each control in the passed formGroup and trim the value
   */
  public trimFormGroup(formGroup: FormGroup) {
    if (formGroup)
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control && typeof control.value === 'string')
          control.setValue(control.value.trim());
      });
  }

  /**
   *
   * @param message text
   * @param action text of the action button like `Undo` or `Ok`.
   * @param duration before the snackbar automatically dismissed. Value is in milliseconds.
   * @returns on action clicked observable.
   */
  public showSnackbar(message: string, action?: string, duration = 4000) {
    message = this.translate(message);
    return this.snackbar.open(message, action, { duration }).onAction()
  }

  public displayRoles(roles: Role[]) {
    return roles.map(v => this.translate(v === 'HeadOfDepartment' ? 'Head of Department' : v)).join(this.translate(',') + ' ');
  }

  public validation = {//used in FormControl validators
    strongPasswordValidator(control: FormControl): ValidationErrors | null {
      // implement password strength check
      const isValid = true;
      return isValid ? null : { strongPassword: true };
    },
    noWhitespaceValidator(control: FormControl) {
      const isValid = !(control.value || '').trim().includes(' ');
      return isValid ? null : { whitespace: true };
    },
    /**if control use maxlength or minlength validators then component should have {min/maxlength:number} obj. And this function should be called with translate pipe using param min/max obj. Ex: {{getRequireMaxMinErrMsg()|translate:minMaxLength}} */
    getRequireMaxMinLengthErrMsg(control: AbstractControl | null): string | '' {
      if (control?.hasError('required'))
        return 'You must enter a value';

      if (control?.hasError('maxlength'))
        return 'Maximum length is ';

      if (control?.hasError('minlength'))
        return 'Minimum length is ';

      return '';
    }
  }

}

