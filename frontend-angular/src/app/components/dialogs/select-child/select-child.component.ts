import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChildService } from 'src/app/services/CRUD/child.service';
import { NotificationService } from 'src/app/services/notification.service';
import { IAccountEntity, IChildEntity } from '../../../../../../interfaces';
import { AccountService } from 'src/app/services/CRUD/account.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { MatListOption } from '@angular/material/list';
import { DisplayService } from 'src/app/services/display.service';
import { MatButton } from '@angular/material/button';
import { PrivilegeService } from 'src/app/services/privilege.service';

@Component({
  selector: 'app-select-child',
  templateUrl: './select-child.component.html',
  styleUrls: ['./select-child.component.scss']
})
export class SelectChildComponent extends UnsubOnDestroy implements OnInit {
  public parentTeacher: IAccountEntity | undefined;
  public children: IChildEntity[] | undefined;
  public filteredChildren: IChildEntity[] | undefined;

  constructor(public dialogRef: MatDialogRef<any>, private nt: NotificationService,
    private childService: ChildService, private accountService: AccountService,
    public display: DisplayService, public pr: PrivilegeService,
    /**this component will be used by either parent or teacher to select its children */
    @Inject(MAT_DIALOG_DATA) public data: { state: 'parent' | 'teacher', accountId: number }) {
    super();
  }

  ngOnInit(): void {
    this.sub.add(this.accountService.accounts$.subscribe(v => {
      if (v != undefined) {
        let parentTeacher = v.find(v => v.id == this.data.accountId);
        if (parentTeacher)
          this.parentTeacher = parentTeacher;
        else {
          this.nt.errorDefaultDialog('Could not find chosen parent/teacher');
          this.dialogRef.close();
        }
      } else this.accountService.fetch(true);
    }));

    this.childService.fetchChildren(true);
    this.sub.add(this.childService.children$.subscribe(v => {
      this.children = v;
      this.filteredChildren = v;
    }));
  }

  isChildSelected(child: IChildEntity): boolean {
    if (this.data.state == 'parent') {
      if (this.data.accountId == child.parentId)
        return true;
      else return false;
    }
    if (this.data.state == 'teacher')
      for (let t of child.teachers)
        if (t.id == this.data.accountId)
          return true;
    return false;

  }

  filter(search: string) {
    this.filteredChildren = this.children ? this.children.filter(v => v.person.name.toLowerCase().includes(search.toLowerCase())) : [];
  }

  /**afterViewInit will initialize the selected items otherwise will be undefined! */
  newSelectionLength(selected: MatListOption[] | undefined): number {
    if (!Array.isArray(selected))
      return 0;

    let len = 0;
    for (let child of this.children ?? []) {
      if (this.isChildSelected(child) != selected.map(v => (v.value as IChildEntity).id).includes(child.id))
        len++;
    }
    return len;
  }

  confirm(selected: MatListOption[]) {

    if (this.newSelectionLength(selected) != 0) {
      if (this.data.state == 'parent')
        this.nt.showMsgDialog({
          type: 'confirm',
          content: 'Be careful, selecting a child with an existed parent will change its parent permanently. Child has only one parent!',
          buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Continue' }],
        }).afterClosed().subscribe(v => {
          if (v == 'Continue') {
            this.submit(selected);
          }
        });
      else {//state == 'teacher'

        this.submit(selected);
      }
    } else {//nothing changed
      this.nt.notify('Edited successfully', undefined, 'success');
      this.dialogRef.close();
    }
  }

  private submit(selected: MatListOption[]) {
    this.display.isLoading.next(true);
    let partialAccount: Partial<IAccountEntity> = {};
    if (this.data.state == 'teacher')
      partialAccount.teaches = selected.map(v => ({ id: v.value.id }) as IChildEntity);
    else
      partialAccount.children = selected.map(v => ({ id: v.value.id }) as IChildEntity);
    this.accountService.put(this.data.accountId, partialAccount, true).then(() => {
      this.nt.notify('Edited successfully', undefined, 'success');
      this.dialogRef.close();
    });
  }
  registerNewChild() {
    //after close
    // this.dialogRef.close();
  }
}
