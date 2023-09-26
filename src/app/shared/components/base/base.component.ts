import { Component, OnInit } from '@angular/core';
import { DialogService, WindowService } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@progress/kendo-angular-notification';

@Component({
  selector: 'base',
  template: '',
})
export abstract class BaseComponent implements OnInit {
  protected dialogTexts: any[] = [];
  protected readonly dialogClose = 'dialog.close';
  protected readonly dialogError = 'dialog.error';
  protected readonly dialogActivationTitle = 'dialog.activation.title';
  protected readonly dialogActivationText = 'dialog.activation.text';
  protected readonly dialogRevocationTitle = 'dialog.revocation.title';
  protected readonly dialogRevocationText = 'dialog.revocation.text';
  protected readonly dialogDeleteTitle = 'dialog.delete.title';
  protected readonly dialogDeleteText = 'dialog.delete.text';
  protected readonly dialogNo = 'dialog.no';
  protected readonly dialogYes = 'dialog.yes';
  protected readonly dialogWarning = 'dialog.warning';
  protected readonly internalServerError = 'error.internal-server-error';
  protected readonly saveError = 'error.save-error';
  protected readonly dialogArchiveTitte = 'dialog.archive.title';
  protected readonly dialogArchiveText = 'dialog.archive.text';
  protected readonly dialogUnarchiveTitle = 'dialog.unarchive.title';
  protected readonly dialogUnarchiveText = 'dialog.unarchive.text';
  protected readonly dialogCloseConfirmTitle = 'dialog.close-confirm.title';
  protected readonly dialogCloseConfirmText = 'dialog.close-confirm.text';

  constructor(
    protected windowService: WindowService,
    protected dialogService: DialogService,
    protected translate: TranslateService,
    protected notificationService: NotificationService
  ) {
    this.translate
      .get([
        this.dialogError,
        this.dialogClose,
        this.dialogYes,
        this.dialogNo,
        this.dialogDeleteTitle,
        this.dialogDeleteText,
        this.dialogRevocationTitle,
        this.dialogRevocationText,
        this.dialogActivationTitle,
        this.dialogActivationText,
        this.dialogWarning,
        this.internalServerError,
        this.saveError,
        this.dialogArchiveTitte,
        this.dialogArchiveText,
        this.dialogUnarchiveTitle,
        this.dialogUnarchiveText,
        this.dialogCloseConfirmTitle,
        this.dialogCloseConfirmText,
      ])
      .subscribe((translation) => {
        this.dialogTexts = translation;
      });
  }

  ngOnInit() {}
  /**
   * Aktuális dátum lekérése
   */
  public get today(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  /**
   * gid incell datepicker min value
   */
  public getActualDate() {
    console.log('today: ', this.today);
    return this.today;
  }
  /**
   * Logolás a konzolra (a hívó osztály nevének megjelenítésével)
   * @param arg
   * @param args
   */
  protected logMe(arg: any, ...args: any[]) {
    console.log(`${this.constructor.name}-${arg.toString()}`, args);
  }
  /**
   * Üzenet-dialóg megjelenítése
   * @param message üzenet szövege
   * @param titleText dialóg fejléc
   * @param width szélesség
   * @param height magasság
   */
  protected showMessage(
    message: string,
    titleText: string,
    width = 450,
    height = 200
  ) {
    console.log('ShowMessage:', message);
    this.dialogService.open({
      title: titleText,
      content: message,
      actions: [
        {
          text: this.dialogTexts[this.dialogClose as any],
          primary: true,
        },
      ],
      width,
      height,
      minWidth: 250,
    });
  }

  /**
   * Hibaüzenet megjelenítése
   * @param message hibaüzenet
   */
  protected showError(message: string) {
    this.showMessage(message, this.dialogTexts[this.dialogError as any]);
  }
  /**
   * Figyelmeztetés megjelenítése
   * @param message üzenet
   */
  protected showWarning(message: string) {
    this.showMessage(message, this.dialogTexts[this.dialogWarning as any]);
  }
  /**
   * Megerősítő dialóg megjelenítése
   * @param title dialóg fejléc
   * @param text üzenet
   * @returns igen vagy nem volt a válasz
   */
  protected confirmationDialog(title: string, text: string): any {
    const titleTranslated = this.dialogTexts[title as any];
    const textTranslated = this.dialogTexts[text as any];
    return this.dialogService.open({
      title: titleTranslated === undefined ? title : titleTranslated,
      content: textTranslated === undefined ? text : textTranslated,
      actions: [
        {
          text: this.dialogTexts[this.dialogYes as any],
          primary: true,
          result: 'Yes',
        },
        { text: this.dialogTexts[this.dialogNo as any], result: 'No' },
      ],
      width: 450,
      height: 200,
      minWidth: 250,
    });
  }
  /**
   * Hibakezelő eljárás
   * @param result hiba-objektum
   * @param message üzenet
   */
  protected errorHandler(
    result: any,
    message: string = this.dialogTexts[this.internalServerError as any]
  ) {
    this.logMe('errorHandler called', result);
    // INTERCEPTOR MIATT NINCS SZÜKSÉG KÜLÖN MEGADNI A HIBA KEZELÉSÉT

    // if (result.error && result.error.message) {
    //   this.showError(`${message} ${result.error.exceptionId}`);
    // } else if (result.errorList && result.errorList.length > 0) {
    //   this.translate
    //     .get(result.errorList[0].message)
    //     .subscribe((translation) => {
    //       this.showError(translation);
    //     });
    // }
  }
  /**
   * Succes notification
   */
  protected successNotif() {
    this.successNotification('Sikeres mentés', true, true);
  }
  /**
   * Warning Nofification
   * @param content  text
   * @param icon  true or false
   * @param closable  true or false
   */
  protected warningNotification(
    content: string,
    icon: boolean,
    closable: boolean
  ) {
    this.notificationDlg('warning', content, icon, closable);
  }

  /**
   * Success Nofification
   * @param content  text
   * @param icon  true or false
   * @param closable  true or false
   */
  protected successNotification(
    content: string,
    icon: boolean,
    closable: boolean
  ) {
    this.notificationDlg('success', content, icon, closable);
  }

  /**
   * Error Nofification
   * @param content  text
   * @param icon  true or false
   * @param closable  true or false
   */
  protected errorNotification(
    content: string,
    icon: boolean,
    closable: boolean
  ) {
    this.notificationDlg('error', content, icon, closable);
  }
  /**
   * DropDown megnevezés lekérése a tömbből Id alapján
   * @param value - Id értéke
   * @param list - név-id párokat tartalmazó lista
   */
  protected getDDName(value: any, list: any[]): string {
    let res = '';
    list.forEach((x: any) => {
      if (x.id === value) {
        res = x.name;
      }
    });
    return res;
  }

  /**
   * Notification Base
   */
  private notificationDlg(
    style: any,
    content: string,
    icon: boolean,
    closable: boolean
  ) {
    this.notificationService.show({
      content: this.translate.instant(content),
      cssClass: 'button-notification',
      hideAfter: 3000,
      animation: { type: 'slide', duration: 400 },
      position: { horizontal: 'center', vertical: 'top' },
      type: { style: style, icon },
    });
  }
}
