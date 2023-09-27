import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser'; // configuração do angular para lidar com execução em um navegador web
import { FormsModule } from '@angular/forms';//adicionei
import { HttpClientModule } from '@angular/common/http'; //adicionei
import { RouterModule } from '@angular/router'; // adicionei
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AppRoutingModule } from './app-routing.module'; 
import { MenuComponent } from './components/menu/menu.component';
import { OrderComponent } from './components/order/order.component';
import { CookedComponent } from './components/cooked/cooked.component';
import { DatePipe } from '@angular/common';
import { TablesComponent } from './components/tables/tables.component';
import { AdministratorComponent } from './components/administrator/administrator.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MenuComponent,
    OrderComponent,
    CookedComponent,
    TablesComponent,
    AdministratorComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([]),
    AppRoutingModule, 
  ],
  exports: [
    LoginComponent,
    MenuComponent,
    OrderComponent,
    TablesComponent,
    AdministratorComponent,
  ],
  providers: [ DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }