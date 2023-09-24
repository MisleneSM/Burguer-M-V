import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/login';
  private accessTokenKey = 'accessToken';
  private userRoleKey = 'accessRole';

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string): Observable<boolean> {
    const loginUser = { email, password };
    // Faz a chamada http da url e faz a verificação do email e senha do usuário.
    return this.http.post<any>(`${this.apiUrl}/login`, loginUser).pipe(
      map(response => {
        if (response.accessToken) {
          localStorage.setItem(this.accessTokenKey, response.accessToken);
          localStorage.setItem(this.userRoleKey, response.user.role);
          return true;
        } else {
          throw new Error("Credenciais inválidas");
        }
      }),
      catchError(error => {
        console.log('Erro de login', error);
        return throwError("Ocorreu um erro durante o login. Por favor, tente novamente.");
      })
    );
  }

  // verifica se o usuário esta logado na aplicação
  isUserLoggedIn(): { loggedIn: boolean, token: string | null } {
    const token = localStorage.getItem(this.accessTokenKey);
    return {
      loggedIn: !!token,
      token: token
    };
  }

  // Busca o role do usuário
  getUserRole(): string | null {
    return localStorage.getItem(this.userRoleKey);
  }

  // Obter o email do usuario logado / é necessário??
  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  // Define o token após o login // perguntar para viih sobre esse 'token'
  storageToken(token: string) {
    localStorage.setItem('token', token);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    this.router.navigate(['']);
  }

  getUsername(): string | null {
    return localStorage.getItem('username')
  }
}