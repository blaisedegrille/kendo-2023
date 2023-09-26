import { Component, OnInit, HostListener, TemplateRef } from '@angular/core';
import {
  GridDataResult,
  SelectableSettings,
  SelectionEvent,
  DataStateChangeEvent,
} from '@progress/kendo-angular-grid';
import {
  CompositeFilterDescriptor,
  DataSourceRequestState,
  FilterDescriptor,
  process,
  State,
} from '@progress/kendo-data-query';
import { DialogService, WindowService } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { NotificationService } from '@progress/kendo-angular-notification';
import { BaseComponent } from '../base/base.component';
import { Observable } from 'rxjs';
import { AppFunctionService } from 'src/app/data/app-function.service';
import { CredentialsService } from 'src/app/data/credentials.service';

// import { DropDowns } from '../../_index';

type columnType = 'text' | 'numeric' | 'boolean' | 'date';
interface ColumnSetting {
  field: string;
  title: string;
  format?: string;
  type: columnType;
  width?: number;
}
const credentialsKey = 'credentials';

@Component({
  selector: 'app-base-maintenance',
  templateUrl: './base-maintenance.component.html',
})
export class BaseMaintenanceComponent<T>
  extends BaseComponent
  implements OnInit
{
  public gridData!: GridDataResult;
  public gridHeigth: number = window.innerHeight - 158;
  public selectedRows!: any[];
  public selectableSettings!: SelectableSettings;

  public defaultItem: { name: string; id?: number } = {
    name: this.translate.instant('global-filter.please-select'),
  };

  public defaultItemAll: { name: string; id?: number } = {
    name: this.translate.instant('global-filter.all'),
  };

  public defaultItemAllShort: { name: string; id?: number } = {
    name: this.translate.instant('global-filter.all-short'),
  };

  // public get dropDownsEnum(): typeof DropDowns {
  //   return DropDowns;
  // }

  public state: DataSourceRequestState = {
    skip: 0,
    take: 20,
  };
  public columns!: ColumnSetting[];
  public enabledOperation = {
    create: false,
    update: false,
    delete: false,
    export: false,
    archive: false,
    show: false,
  };

  public activate = false;
  public inactivate = true;
  public archivate = false;
  public unarchivate = true;

  public editDataItem: T | undefined;
  public isNew!: boolean;
  public close = false;
  public dataItems: any;
  public isRevocation = false;
  public isDeleted = false;
  public serverSidePaging = true;
  public loadAtStart = true;

  public gridState: State = {
    sort: [
      {
        field: 'name',
        dir: 'asc',
      },
    ],
    skip: 0,
    take: 20,
    filter: {
      logic: 'and',
      filters: [
        {
          field: 'active',
          operator: 'eq',
          value: true,
        },
      ],
    },
  };

  public dataLoading = false;

  // protected dialogTexts: MessageTraslations[];
  protected confirmation = {};
  protected appFunctionName = '';
  protected service: any;

  /**
   * Konstruktor
   * @params injektált objektumok
   */
  constructor(
    protected override windowService: WindowService,
    protected override dialogService: DialogService,
    protected override translate: TranslateService,
    protected appFunctionService: AppFunctionService,
    protected credentialsService: CredentialsService,
    protected router: Router,
    protected override notificationService: NotificationService
  ) {
    super(windowService, dialogService, translate, notificationService);
  }
  /**
   *
   * Inicializálás
   */
  public override ngOnInit() {
    if (!this.appFunctionName || this.credentialsService.credentials == null) {
      return;
    }

    if (
      !this.operationEnabled(
        this.credentialsService.credentials.enabledOperations,
        this.appFunctionName,
        this.appFunctionService.operations.base.show
      )
    ) {
      this.router.navigate(['/error'], {
        queryParams: { error: 'unautherized' },
      });
      return;
    }
    this.enabledOperation.create = this.operationEnabled(
      this.credentialsService.credentials.enabledOperations,
      this.appFunctionName,
      this.appFunctionService.operations.base.create
    );
    this.enabledOperation.update = this.operationEnabled(
      this.credentialsService.credentials.enabledOperations,
      this.appFunctionName,
      this.appFunctionService.operations.base.update
    );
    this.enabledOperation.delete = this.operationEnabled(
      this.credentialsService.credentials.enabledOperations,
      this.appFunctionName,
      this.appFunctionService.operations.base.delete
    );
    this.enabledOperation.export = this.operationEnabled(
      this.credentialsService.credentials.enabledOperations,
      this.appFunctionName,
      this.appFunctionService.operations.base.export
    );

    this.logMe('ngOnInit operations', this.enabledOperation);

    if (this.loadAtStart) {
      this.loadData();
    }
    this.setSelectableSettings();
  }
  /**
   * Grid alapértelmezett sor-kiválaszthatóságának beállítása
   */
  public setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single',
    };
  }
  /**
   * Sorkiválasztás megváltozott
   * @param event
   */
  public onGridSelectionChange(event: SelectionEvent) {
    console.log('selectedRows: ', this.selectedRows);
    if (this.selectedRow.active) {
      this.inactivate = this.enabledOperation.delete;
      this.activate = false;
    } else {
      this.inactivate = false;
      this.activate = this.enabledOperation.delete;
    }
  }
  /**
   *
   * @param state Grid-adatváltozás (lapozás szűrés, rendezés) lekezelése
   */
  public dataStateChange(state: DataStateChangeEvent) {
    this.beforeDataStateChange(state);
    this.selectedRows = [];
    this.gridState = state;
    this.state = state;
    this.dataLoading = true;
    if (this.serverSidePaging) {
      this.service.fetch(this.gridState).subscribe(
        (result: any) => {
          this.dataItems = result.data;
          this.gridData = result;
          this.dataLoading = false;
          this.afterDataStateChange(state);
        },
        (e: any) => {
          this.errorHandler(e);
          this.dataLoading = false;
        }
      );
    } else {
      this.gridData = process(this.dataItems, this.gridState);
      this.dataLoading = false;
    }
  }
  /**
   * Adatok mentése excelbe
   * @param event
   */
  public onExcelExport(event: any) {
    const sheet = event.workbook.sheets[0];
    sheet.rows.push({ type: 'data', cells: [{ value: '' }] });
  }
  /**
   * Grid-adatváltozás elején lefutó eljárás (a leszármazottban felülírható)
   * @param state
   */
  public beforeDataStateChange(state: DataStateChangeEvent) {}

  /**
   * Grid-adatváltozás elején lefutó eljárás (a leszármazottban felülírható)
   * @param state
   */
  public afterDataStateChange(state: DataStateChangeEvent) {}
  /**
   * Adatok frissítése
   */
  public refresh() {
    this.gridState.skip = 0;
    this.loadData();
  }
  /**
   * Adatok újratöltése
   */
  public loadData() {
    this.selectedRows = [];
    this.dataLoading = true;

    // console.log('MOST ÉPP ITT VAGYUNK: ', this.gridState);
    this.service.fetch(this.gridState).subscribe({
      next: (result: any) => {
        console.log('RESULT: ', result);
        this.dataItems = result.data;
        if (this.serverSidePaging) {
          this.gridData = result;
        } else {
          this.gridData = process(this.dataItems, this.gridState);
        }
      },
      complete: () => {
        this.dataLoading = false;
      },
    });
    /*     this.service.fetch(this.gridState).subscribe(
      (result: any) => {
        this.dataItems = result.data;
        if (this.serverSidePaging) {
          this.gridData = result;
        } else {
          this.gridData = process(this.dataItems, this.gridState);
        }
        this.dataLoading = false;
      },
      (e: any) => {
        console.log('e: ', e);
        this.errorHandler(e);
        this.dataLoading = false;
      }
    ); */
  }
  /**
   * A szerkesztő ablaban megszakították a rögzítést
   */
  public cancelHandler() {
    // let object = new Object() as T;
    const object: T = undefined as T;
    this.editDataItem = object;
  }
  /**
   * Módosítás előtt lefutó eljárás (a leszármazottban felülírható)
   */
  public beforeEdit() {}

  /**
   * Módosítást kezdeményeztek
   * @returns
   */
  public editHandler() {
    if (!this.selectedRow) {
      return;
    }
    this.service.get(this.selectedRow.id).subscribe((r: any) => {
      //console.log('editHadler_row', r);
      this.editDataItem = r;
      console.log('editHandler_item', this.editDataItem);
      this.isNew = false;
      this.beforeEdit();
    });
  }

  /**
   * A szerkesztő-ablakban mentést kezdeményeztek
   * @param item az aktuális adattartalom
   */
  public saveHandler(item: T) {
    this.service.save(item, this.isNew).subscribe(
      (r: any) => {
        if (r.errorList && r.errorList.length === 0) {
          this.close = true;
          this.editDataItem = undefined;
          this.successNotif();
          this.refresh();
        }
      },
      (e: any) => {
        this.errorHandler(e, this.dialogTexts[this.saveError as any]);
      }
    );
  }
  /**
   * Fizikai törlést kezdeményeztek
   * @param event
   * @returns
   */
  public removeHandler(event: any) {
    if (!this.selectedRow) {
      return;
    }
    const dialog = this.deleteConfirmation;

    dialog.result.subscribe((dialogResult: any) => {
      if (dialogResult.result === 'Yes') {
        this.removeItem();
      }
    });
  }
  /**
   * Visszavonás/Érvényesítést kezdeményeztek
   * @param event
   * @returns
   */
  public revocationHandler(event: any) {
    if (!this.selectedRow) {
      return;
    }
    const title = this.activate
      ? this.dialogActivationTitle
      : this.dialogRevocationTitle;
    const text = this.activate
      ? this.dialogActivationText
      : this.dialogRevocationText;
    const dialog = this.confirmationDialog(title, text);

    dialog.result.subscribe((dialogResult: any) => {
      if (dialogResult.result === 'Yes') {
        this.revocationItem();
      }
    });
  }

  public allData = (): Observable<GridDataResult> => {
    return this.service.fetch({
      filter: this.gridState.filter,
      sort: this.gridState.sort,
    });
  };

  /**
   * Újraméretezés lekezelése
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.logMe(`Height: ${event.target.innerHeight}`);
    //this.gridHeigth = event.target.innerHeight - 100;
  }
  /**
   * Sorkiválasztás után lefutó eljárás (Callback)
   * @param args
   * @returns
   */
  public selectedCallback = (args: any) => args.dataItem;
  /**
   * Utoljára kiszelektált sor
   */
  get selectedRow() {
    // console.log('this.selectedRows[0]....get', this.selectedRows);
    if (this.selectedRows && this.selectedRows.length > 0) {
      return this.selectedRows[0];
    }
    return false;
  }
  /**
   * Egy sor kiválasztott?
   */
  get oneRowSelected() {
    console.log('oneRowSelected....get ');
    return this.selectedRows && this.selectedRows.length === 1;
  }
  /**
   * Fizikai törlést megerősítő dialóg felhívása
   */
  get deleteConfirmation() {
    return this.confirmationDialog(
      this.dialogDeleteTitle,
      this.dialogDeleteText
    );
  }
  /**
   * Fizikai törlés végrehajtása
   */
  protected removeItem() {
    this.service.remove(this.selectedRow).subscribe(
      (r: any) => {
        if (r.errorList && r.errorList.length === 0) {
          this.refresh();
          this.successNotif();
        } else {
          this.errorHandler(r);
        }
      },
      (e: any) => this.errorHandler(e)
    );
  }
  /**
   * Visszavonás/érvényesítés végrehajtása
   */
  protected revocationItem() {
    this.logMe('revocationItem - selectedRow', this.selectedRow);
    this.service.revocation(this.selectedRow.id).subscribe(
      (r: any) => {
        if (r.errorList && r.errorList.length === 0) {
          this.refresh();
          this.successNotification('Succesfully revocation', true, true);
        } else {
          this.errorHandler(r);
        }
      },
      (e: any) => {
        this.errorHandler(e);
      }
    );
  }
  /**
   * Template alapú üzenet-dialóg megjelenítése
   * @param template templét
   * @param titleText dialóg-fejléc
   */
  protected showMessageTemplate(template: TemplateRef<any>, titleText: string) {
    this.dialogService.open({
      title: titleText,
      content: template,
      actions: [
        { text: this.dialogTexts[this.dialogClose as any], primary: true },
      ],
      width: 450,
      height: 200,
      minWidth: 250,
    });
  }
  /**
   * Jogosultság-ellenőrzés
   * @param operations a felhasználó összes jogosultsága
   * @param appFunctionName vizsgált funkció
   * @param operation keresett művelet
   * @returns van joga vagy nincs
   */
  protected operationEnabled(
    operations: any[],
    appFunctionName: string,
    operation: string
  ): boolean {
    const op = operations.find(
      (item) =>
        item.toLowerCase() ===
        `${appFunctionName.toLowerCase()}_${operation.toLowerCase()}`
    );
    return op !== undefined;
  }
  /**
   * Visszavonás megerősítő dialóg megjelenítése
   */
  get revocationConfirmation() {
    return this.confirmationDialog(
      this.dialogRevocationTitle,
      this.dialogRevocationText
    );
  }

  /**
   * Szerkesztés a gridben: DropDown módosítás vizsgálata
   * @param oldValue
   * @param gridValue
   * @returns
   */
  protected checkDDChanges(oldValue: any, gridValue: any): any {
    if (gridValue === '' || gridValue === undefined || gridValue === null) {
      return oldValue;
    } else {
      return gridValue;
    }
  }

  /**
   * Dátum UTC formára hozása
   * @param src lokális dátum
   * @returns UTC-re konvertált dátum
   */
  protected asUTC(src: Date): Date {
    return new Date(src.getTime() + src.getTimezoneOffset() * 60000);
  }
  /**
   * Egy filterelem generálása (általános)
   * @param name mégnevezés
   * @param value érték
   * @param actualfilters az akualizálandó struktúra
   * @param operator reláció
   */
  protected setFilterItem(
    name: string,
    value: any,
    actualfilters: any,
    operator = 'eq'
  ) {
    if (value) {
      actualfilters.push({
        field: name,
        operator,
        value,
        ignoreCase: false,
      } as FilterDescriptor);
    }
  }
  /**
   * Egy filterelem generálása (dátum)
   * @param name mégnevezés
   * @param value érték
   * @param actualfilters az akualizálandó struktúra
   * @param operator reláció
   */
  protected setFilterItemDate(
    name: string,
    value: any,
    actualfilters: any,
    operator = 'eq'
  ) {
    if (value) {
      actualfilters.push({
        field: name,
        operator,
        value: this.asUTC(value),
        ignoreCase: false,
      } as FilterDescriptor);
    }
  }

  /**
   * Egy filterelem generálása (YN)
   * @param name mégnevezés
   * @param value érték
   * @param actualfilters az akualizálandó struktúra
   * @param operator reláció
   */
  protected setFilterItemYN(
    name: string,
    check: any,
    value: any,
    actualfilters: any,
    operator: string
  ) {
    if (check) {
      actualfilters.push({
        field: name,
        operator,
        value,
        ignoreCase: false,
      } as FilterDescriptor);
    }
  }
  /**
   * Filter visszatöltés deserializáló segédfüggvény (dátum deszerializáláshoz)
   * @param key
   * @param value
   * @returns
   */
  protected filterDeserializer(key: any, value: any): any {
    if (
      value != null &&
      value.length === 24 &&
      value.substring(10, 11) === 'T' &&
      value.substring(23) === 'Z'
    ) {
      const d = Date.parse(value);
      if (isNaN(d)) {
        return value;
      } else {
        return new Date(d);
      }
    }
    return value;
  }
  protected removeIfExistsById(arr: any[], id: number) {
    const idx = arr.findIndex((record) => record.id === id);
    if (idx > -1) {
      arr.splice(idx, 1);
    }
  }
  protected applyMultiSelectFilter(
    arr: any[],
    id: string,
    actualFilter: (CompositeFilterDescriptor | FilterDescriptor)[]
  ) {
    if (arr && arr.length > 0) {
      const items: FilterDescriptor[] = [];
      arr.forEach((x: any) => {
        items.push({
          field: id,
          operator: 'eq',
          value: x,
          ignoreCase: false,
        } as FilterDescriptor);
      });
      actualFilter.push({
        logic: 'or',
        filters: items,
      } as CompositeFilterDescriptor);
    }
  }
  protected getMultiSelectFilter(arr: any[], id: string): FilterDescriptor[] {
    const items: FilterDescriptor[] = [];
    arr.forEach((x: any) => {
      items.push({
        field: id,
        operator: 'eq',
        value: x,
        ignoreCase: false,
      } as FilterDescriptor);
    });
    return items;
  }
}
