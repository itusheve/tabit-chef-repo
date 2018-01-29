import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { MatSnackBar } from '@angular/material';

import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private authService: AuthService, 
    private router:Router,
    public snackBar: MatSnackBar
  ) { }

  //TODO: show when user/pass are wring
  //TODO: side menu add X and enable sliding off
  //TODO: ecognize email input as email for keyboard



  hidePass = true;
  
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(1)])
  });

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  // getErrorMessage() {
  //   return this.email.hasError('required') ? 'You must enter a value' :
  //     this.loginForm.get('email').hasError('email') ? 'Not a valid email' :
  //       '';
  // }

  ngOnInit() {
  }

  login() {    
    if (this.email.invalid || this.password.invalid) return;
    this.authService.login({      
      email: this.email.value,
      password: this.password.value
    })
      .then(()=>{
        this.router.navigate(['/restaurants']);
      })
      .catch(err=>{
        if (err.status===403) {
          this.snackBar.open('שם משתמש ו/או סיסמא אינם נכונים', null, {
            direction: 'rtl',
            duration: 3000,
              });
        }
      });
  }


  // onLogin(form?: NgForm) {    
  //   const email = form.value.email;
  //   const password = form.value.password;
  //   this.authService.login({      
  //     email: email,
  //     password: password
  //   })
  //     .then(()=>{
  //       this.router.navigate(['/restaurants']);
  //     }, ()=>{
  //       debugger;
  //     });
  // }


}
