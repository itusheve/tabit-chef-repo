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

  constructor(private authService: AuthService, private router:Router) { }
  
  onLogin(form?: NgForm) {    
    const email = form.value.email;
    const password = form.value.password;
    this.authService.login({      
      email: email,
      password: password
    })
      .then(()=>{
        this.router.navigate(['/restaurants']);
      }, ()=>{
        debugger;
      });
  }


}
