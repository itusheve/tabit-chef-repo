import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-are-you-sure',
  templateUrl: 'are-you-sure.html',
})
// tslint:disable-next-line:component-class-suffix
export class AreYouSureDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AreYouSureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    }

  onCancelClick(): void {
    this.dialogRef.close(false);
  }

  onOkClick(): void {
    this.dialogRef.close(true);
  }

}
