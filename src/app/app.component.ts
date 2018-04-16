import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],

  // TLA:
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[class.cordova]': 'cordova'
  }
})

export class AppComponent implements OnInit {
  cordova = '';

  token = 'please hold';

  constructor() {  }

  ngOnInit() {
    /* TLA: */
    // this.appService.setAppSidenav(this.appSidenav);

    /* TLA: */
    // Setting the title
    // this.title = this.appService.appConfig.title;
    // this.direction = this.appService.appConfig.direction;
    // console.log('isPlatformBrowser: ', isPlatformBrowser(this._platformId));

    /* TLA: */
    this.cordova = window['cordova'];
    if (typeof window['cordova'] !== 'undefined') {
      console.log('Cordova exists');
    } else {
      console.log('Cordova does NOT exist');
    }

    const that = this;
    setInterval(function(){
      that.token = window.localStorage.getItem('token');
    }, 1000);
  }
}

