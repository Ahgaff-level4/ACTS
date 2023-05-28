import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDialogModule } from '@angular/material/dialog'
import { AppComponent } from './components/static/app/app.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ClipboardModule } from '@angular/cdk/clipboard';


@NgModule({
  exports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatIconModule,
    MatCheckboxModule,
    MatDialogModule,
    DragDropModule,
    MatRippleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatMomentDateModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatListModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatCardModule,
    MatProgressBarModule,
    ClipboardModule,
  ],
})
export class AppMaterialModule {
}
