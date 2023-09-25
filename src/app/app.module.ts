import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SampleComponent } from './sample/sample.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProductService } from './data/product.service';
import { TableModule } from './grid/table.module';
import { GridComponent } from './grid/grid.component';

@NgModule({
  declarations: [AppComponent, SampleComponent, GridComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GridModule,
    TableModule,
    BrowserAnimationsModule,
  ],
  providers: [ProductService],
  bootstrap: [AppComponent],
})
export class AppModule {}
