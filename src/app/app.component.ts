import { Component, OnInit } from '@angular/core';
import { DebugService } from './debug.service';

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

  logArr: {type: string, message: string}[];

  constructor(
    private ds: DebugService
  ) {
    this.logArr = ds.logArr;
  }

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
      document.querySelector('#splash').remove();
    } else {
      console.log('Cordova does NOT exist');
    }

    const that = this;
    setInterval(function(){
      that.token = window.localStorage.getItem('token');
    }, 1000);
  }
}

