import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  templateUrl: 'forgot-password.html',
})
// tslint:disable-next-line:component-class-suffix
export class ForgotPasswordDialogComponent {

    fgtPswForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
    });

    get email(): any { return this.fgtPswForm.get('email'); }
    public env: any;
    constructor(
        public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.env = environment;
        this.fgtPswForm.setValue({ email: data.email });
    }

    onCancelClick(): void {
        this.dialogRef.close(false);
    }

    onOkClick(): void {
        this.dialogRef.close({ email: this.email.value });
    }

}
