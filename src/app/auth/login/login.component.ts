import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
//export class LoginComponent implements OnInit {
export class LoginComponent {  

  constructor(private authService: AuthService, private router:Router) {
    // this.authService.login({
    //   email: 'or@tabit.cloud',//email,
    //   password: '100Ahbaroshim'//password
    // })
    //   .then(() => {
    //     this.router.navigate(['home']);
    //   });

  // ngOnInit() {
    
  }
  
  onLogin(form?: NgForm) {    
    const email = form.value.email;
    const password = form.value.password;
    this.authService.login({      
      email: 'or@tabit.cloud',//email,
      password: '100Ahbaroshim'//password
    })
      .then(()=>{
        this.router.navigate(['u/orgs']);
      }, ()=>{
        debugger;
      });
  }


}
