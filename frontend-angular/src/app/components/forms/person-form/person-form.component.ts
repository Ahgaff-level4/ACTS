import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ICreatePerson, SucResEditDel, IPersonEntity } from '../../../../../../interfaces';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { PersonService } from 'src/app/services/person.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss']
})
export class PersonFormComponent implements OnInit {
  @Input() public person?: IPersonEntity | ICreatePerson;//optional for edit
  @Output() public personChange = new EventEmitter<IPersonEntity | ICreatePerson>();
  @Input() public personId: number | undefined;//todo if will be need it. For edit if you can't provide person then only id
  public formGroup: FormGroup;
  protected minlength = { minlength: 4 };
  protected nowDate = new Date();

  constructor(private fb: FormBuilder, public personService: PersonService, private ut: UtilityService) {
    this.formGroup = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(50), Validators.minLength(4)]],
      birthDate: null,
      gender: [null, [Validators.required]],
      createdDatetime: [new Date(), [Validators.required]],
    });
  }

  ngOnInit(): void {
    //todo if necessary: if(this.personId){//fetch person info}
    if (this.person) {
      this.formGroup.setValue(this.ut.extractFrom(this.formGroup.controls, this.person));
    }
    this.formGroup.valueChanges.subscribe(() => {
      this.person = { ...this.person, ...this.formGroup.value };
      this.personChange.emit(this.person);
    });
  }

  /**
   * Called by the parent component. Hint: using `@ViewChild` decorator
   */
  public async submit(): Promise<IPersonEntity> {
    return await this.personService.postPerson(this.ut.extractDirty(this.formGroup.controls) as ICreatePerson);
  }

  /** void if there is no dirty fields*/
  public async submitEdit(): Promise<SucResEditDel | void> {
    let dirtyFields = this.ut.extractDirty(this.formGroup.controls);
    if (dirtyFields != null)
      return await this.personService.patchPerson((this.person as IPersonEntity).id,dirtyFields);
  }

}
