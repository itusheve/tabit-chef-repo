import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-are-you-sure',
    templateUrl: 'are-you-sure.html',
})
// tslint:disable-next-line:component-class-suffix
export class AreYouSureDialogComponent {

    translations: {
        ok: string,
        cancel: string
    };

    constructor(
        public dialogRef: MatDialogRef<AreYouSureDialogComponent>,
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.translations = {
            ok: 'OK',
            cancel: 'Cancel'
        };
        this.translate.get('cancel').subscribe((res: string) => {
            this.translations.cancel = res;
        });
        this.translate.get('ok').subscribe((res: string) => {
            this.translations.ok = res;
        });
    }

    onCancelClick(): void {
        this.dialogRef.close(false);
    }

    onOkClick(): void {
        this.dialogRef.close(true);
    }

}
