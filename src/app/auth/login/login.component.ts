import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { MatSnackBar, MatDialog } from '@angular/material';

import { AuthService } from '../auth.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { tmpTranslations } from '../../../tabit/data/data.service';
import { ForgotPasswordDialogComponent } from '../../../tabit/ui/dialogs/forgot-password.component/forgot-password.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router:Router,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  //TODO: side menu add X and enable sliding off

  mode: string;// normal (selecting org and continuing to app), switch (changing an org, restart should occur)

  hidePass = true;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(1)])
  });

  get email(): any { return this.loginForm.get('email'); }
  get password(): any { return this.loginForm.get('password'); }

  ngOnInit() {
    // after hitting logout, we get the switch mode so after login, the org selection comp will know to reload
    this.route.paramMap
      //  .filter(params => params.m)
      .subscribe((params: ParamMap) => {
        const mode = params.get('m');
        this.mode = (mode && mode === 's') ? 'switch' : 'normal';
      });
  }

  login() {
    if (this.email.invalid || this.password.invalid) return;

    this.authService.login({
      email: this.email.value,
      password: this.password.value
    })
      .then(()=>{
        const paramObj:any = {};
        if (this.mode==='switch') {
          paramObj.m = 's';
        }
        this.router.navigate(['/restaurants', paramObj]);
      })
      .catch(err=>{
        if (err.status===403) {
          this.snackBar.open(tmpTranslations.get('login.userPassIncorrect'), null, {
            duration: 3000,
            verticalPosition: 'top'
          });
        }
      });
  }

  forgotPassword() {
    let dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
      width: '450px',
      data: {
        title: tmpTranslations.get('login.passwordRestore'),
        email: this.loginForm.value.email.slice(0)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result!==false) {
        this.authService.forgotPassword({email: result.email})
          .then(() => {
            this.snackBar.open(`${tmpTranslations.get('login.resetPasswordSent')} ${result.email}`, null, {
              duration: 5000,
              verticalPosition: 'top'
            });
          })
          .catch(()=> {
            this.snackBar.open(`${tmpTranslations.get('opFailed')} (err 826)`, null, {
              duration: 5000,
              verticalPosition: 'top'
            });
          });
      }
    });
  }

}
