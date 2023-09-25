import { Component, ViewChild } from '@angular/core';
import { GridComponent } from '../grid/grid.component';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { ProductService } from '../data/product.service';

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss'],
})
export class SampleComponent {
  @ViewChild(GridComponent) child: GridComponent = new GridComponent();

  public gridItems: Observable<GridDataResult> | undefined;
  public pageSize: number = 10;
  public skip: number = 0;
  public sortDescriptor: SortDescriptor[] = [];
  public filterTerm!: number;

  productService: ProductService | undefined;

  constructor(productService: ProductService) {
    //this.child.service = productService;
  }
}
