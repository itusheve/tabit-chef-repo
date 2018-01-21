// import { Component, OnInit } from '@angular/core';
// import { NgForm, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
//export class LoginComponent implements OnInit {
export class LoginComponent {  

  constructor(private authService: AuthService, private router:Router) { }
  
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

  login() {    
    if (this.email.invalid || this.password.invalid) return;
    this.authService.login({      
      email: this.email.value,
      password: this.password.value
    })
      .then(()=>{
        this.router.navigate(['/restaurants']);
      }, ()=>{
        debugger;
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
