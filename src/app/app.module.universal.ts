import { UniversalModule } from 'angular2-universal';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    UniversalModule,
    FormsModule,
  ],
  entryComponents: [ AppComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
