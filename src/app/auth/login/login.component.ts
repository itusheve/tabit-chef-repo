import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { MatSnackBar } from '@angular/material';

import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { tmpTranslations } from '../../../tabit/data/data.service';

// import tmpTranslations from 

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

  //TODO: side menu add X and enable sliding off

  hidePass = true;
  
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(1)])
  });

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

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
          this.snackBar.open(tmpTranslations.get('login.userPassIncorrect'), null, {
            direction: 'rtl',//TODO localization
            duration: 3000,
              });
        }
      });
  }

}
