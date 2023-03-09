import { NgModule } from '@angular/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatButtonModule} from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatCheckboxModule } from '@angular/material/checkbox'
@NgModule({
  exports:[
    MatAutocompleteModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatIconModule,
    MatCheckboxModule,
  ]
})
export class AppMaterialModule { }
