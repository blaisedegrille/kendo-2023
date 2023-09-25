import { Component, Input, inject } from '@angular/core';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { ProductService } from '../data/product.service';
import { ParentComponent } from './parent.component';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent {
  @Input()
  public gridItems: Observable<GridDataResult> | undefined;
  @Input()
  public pageSize: number = 10;
  @Input()
  public skip: number = 0;
  @Input()
  public sortDescriptor: SortDescriptor[] = [];
  @Input()
  public filterTerm!: number;

  constructor(private readonly productService: ProductService) {
    this.loadGridItems();
  }

  private loadGridItems(): void {
    this.gridItems = this.productService.getProducts(
      this.skip,
      this.pageSize,
      this.sortDescriptor,
      this.filterTerm
    );
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadGridItems();
  }

  public handleSortChange(descriptor: SortDescriptor[]): void {
    this.sortDescriptor = descriptor;
    this.loadGridItems();
  }
}
