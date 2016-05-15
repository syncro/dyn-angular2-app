import {
  Component,
  Input,
  Attribute,
  DynamicComponentLoader,
  Injector,
  ElementRef,
  ViewContainerRef
} from '@angular/core';
import {
  Routes,
  Route,
  ROUTER_PROVIDERS,
  ROUTER_DIRECTIVES
} from '@angular/router';

import {MdCheckbox} from '@angular2-material/checkbox';


import {Greeter} from './services';

@Component({
  selector: 'hello',
  template: '<p>{{ message }}</p>'
})
export class Hello {
  constructor(greeter: Greeter) {
    this.message = greeter.say('hello', 'Angular 2');
  }
}

@Component({
  selector: 'ciao',
  template: '<p>{{ message }}</p>'
})
export class Ciao {
  constructor(greeter: Greeter) {
    this.greeter = greeter;
  }

  routerOnActivate(curr, prev, currTree, prevTree) {
    this.message = this.greeter.say('ciao', curr.getParam('name'));
  }
}

@Component({
  selector: 'linker',
  template: '<p><a [href]="url" [title]="name">{{ name }}</a></p>'
})
export class Linker {
  @Input() url;

  constructor(@Attribute('name') name) {
    this.name = name;
  }
}

@Component({
             selector: 'form',
             template: `<form>
                         <input type="text" name="yo" />
                         <input type="button" value="ok" />
                        </form>`
           })
export class Form {

}


@Component({
  selector: 'hello-app',
  viewProviders: [Greeter],
  directives: [ROUTER_DIRECTIVES, Linker, MdCheckbox],
  template: `
    <ul>
      <li><a [routerLink]="['/']">Hello</a></li>
      <li><a [routerLink]="['/ciao', 'ng2']">Ciao</a></li>
    </ul>
    <router-outlet></router-outlet>
    <linker name="GitHub" url="https://github.com/shuhei/babel-angular2-app"></linker>

    <button (click)="onClick()">View Form</button>
    <button (click)="onDynClick()">Load Dynamically</button>
    <div #form>Welcome..! Here form component will be loaded.</div>
    <div id="form">Form will be loaded above this.</div>
    <md-checkbox>checkbox</md-checkbox>
  `
})
@Routes([
  new Route({ path: '/', component: Hello }),
  new Route({ path: '/ciao/:name', component: Ciao })
])
export class App {

  constructor(dcl: DynamicComponentLoader, injector: Injector, viewContainerRef: ViewContainerRef) {
    this.dcl = dcl;
    this.injector = injector;
    this.viewContainerRef = viewContainerRef;
  }

  ngOnInit() {
    this.bindComponentAddEvent();
  }

  bindComponentAddEvent() {
    window.addEventListener('component:add', function (e) {
      var cmp = e.detail.component;
      var sl = e.detail.selector;
      this.dcl.loadAsRoot(cmp, sl,this.injector);
    }.bind(this), false);
  }

  onClick() {
    if(this.component != undefined){
      this.component.then((componentRef: ComponentRef) => {
        componentRef.dispose();
        return componentRef;
      });
    }
    this.component = this.dcl.loadNextToLocation(Form, this.viewContainerRef);
    alert('form');
  }

  onDynClick() {

    document.getElementById('form').innerHTML = '<div id="inj"></div>';

    window.dispatchEvent(new CustomEvent(
        'component:add',
        {'detail': {'component': Form, 'selector': '#inj' }}
    ));
  }
}
