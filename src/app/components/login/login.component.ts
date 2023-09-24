import { Component } from '@angular/core'; //Define e configura componentes
import { Router } from '@angular/router'; // Roteamento - usado para navegar entre diferentes componentes - define rotas
import { AuthService } from '../services/authentication.service';
import { Observable } from 'rxjs'; // lida com eventos assíncronos

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', './login.component.ptone.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorLogin: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  login() {
    this.errorLogin = false;

    const loginObservable: Observable<boolean> = this.authService.login(this.email, this.password);
     
    loginObservable.subscribe({ // observador 
      next: isUserLoggedIn => {
        if (isUserLoggedIn) {
          const userRole = localStorage.getItem('accessRole');
          const roleRouteMap: { [key: string]: string } = {
            'service': '/menu',
            'chefe': '/cozinha',
            'admin': '/admin'
          };

          if (userRole !== null && userRole in roleRouteMap) {
            const targetRoute = roleRouteMap[userRole];
            this.router.navigate([targetRoute]);
          } else {
            throw new Error('Invalid role');
          }
        } else {
          this.errorLogin = true;
          this.errorMessage = 'Invalid login';
        }
      },
      error: error => {
        console.error('Login error:', error);
        this.errorLogin = true;
        this.errorMessage = 'Email ou senha inválidos';
      }
    });
  }
}
