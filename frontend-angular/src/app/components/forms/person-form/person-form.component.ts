import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ICreatePerson, SucResEditDel, IPersonEntity } from '../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonService } from 'src/app/services/CRUD/person.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { FormService } from 'src/app/services/form.service';
import { Observable, debounceTime, distinctUntilChanged, fromEvent, of, share, switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-person-form[state]',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss']
})
export class PersonFormComponent extends UnsubOnDestroy implements OnInit, AfterViewInit {
  @Input() public person?: IPersonEntity | ICreatePerson;//optional for edit
  @Input() public state!: 'child' | 'account';
  @Input() public defaultPersonName = '';
  @Output() public personChange = new EventEmitter<IPersonEntity | ICreatePerson>();
  @ViewChild('nameInput') private nameInput!: ElementRef;
  protected existedPersons$!: Observable<{ name: string, id: number }[]>;

  public formGroup!: FormGroup;
  /**image is the image file chosen by the user. If user dose not choose an image OR edit a person that has image, then it is `undefined`.
   * It will be defined only when user select an image as placeholder to submit the file
  */
  protected image?: File;

  constructor(private fb: FormBuilder, public personService: PersonService,
    public formService: FormService, public router: Router) {
    super();
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      name: [this.defaultPersonName || null, [Validators.required, Validators.maxLength(100), Validators.minLength(4)]],
      birthDate: [null,],
      gender: [null, [Validators.required]],
      image: [null],
      createdDatetime: [new Date(), [Validators.required]],
    });
    if (this.person) {
      this.formGroup.setValue(this.formService.extractFrom(this.formGroup.controls, this.person));
    }
    this.sub.add(this.formGroup.valueChanges.subscribe(() => {
      this.person = { ...this.person, ...this.formGroup.value };
      this.personChange.emit(this.person);
    }));
  }

  ngAfterViewInit(): void {
    if (!this.existedPersons$)
      this.existedPersons$ = fromEvent(this.nameInput.nativeElement, 'keyup')
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(() => {
            if (this.nameInput.nativeElement.value.length >= 4)
              return this.formService.fetchPersonsByName(this.nameInput.nativeElement.value, this.state)
            return of([]);
          }),
          share());
  }

  /**
   * Called by the parent component. Hint: using `@ViewChild` decorator
   */
  public submit(): Promise<IPersonEntity> {
    const formData = new FormData();
    for (let c in this.formGroup.value) {
      if (c != 'image' && this.formGroup.controls[c].value != null)
        formData.append(c, this.formGroup.controls[c].value);
    }
    if (this.image)
      formData.append('image', this.image);
    return this.personService.postPerson(formData);
  }

  /** void if there is no dirty fields*/
  public async submitEdit(): Promise<SucResEditDel | void> {
    const formData = new FormData();
    for (let c in this.formGroup.value) {
      if (c != 'image' && this.formGroup.controls[c].dirty)
        formData.append(c, this.formGroup.controls[c].value);
    }
    if (this.image)
      formData.append('image', this.image);
    let isEmpty = true;
    formData.forEach(() => isEmpty = false);
    if (!isEmpty)
      return await this.personService.patchPerson((this.person as IPersonEntity).id, formData).catch(() => { });
  }


  @ViewChild('imageRef') imageRef!: ElementRef;
  onFileChange(event: Event) {
    // get the file object from the event target
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file)
      return;
    this.image = file;
    const reader = new FileReader();
    // read the file content as a data URL
    reader.readAsDataURL(file);
    // set the onload event handler
    reader.onload = () => {
      // assign the data URL to the imageURL variable
      this.imageRef.nativeElement.src = reader.result as string;
    };
  }

}
