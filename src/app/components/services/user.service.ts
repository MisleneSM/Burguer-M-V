import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './authentication.service';
import { map, catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://burger-queen-api-mock-88v3.vercel.app/users';
  constructor(private http: HttpClient, private authService: AuthService) { }

  getEmployees(): Observable<any[]> {
    const { loggedIn, token } = this.authService.isUserLoggedIn();
  
    if (!loggedIn) {
      throw new Error('Usuário não logado');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      map(users => {
        return users.map(user => {
          return {
            id: user.id,
            name: user.name,
            role: user.role === 'chefe' ? 'Cozinheiro' : 'Garçom' 
          };
        });
      })
    );
  }
  

  addEmployee(employee: any): Observable<any> {
    const { loggedIn, token } = this.authService.isUserLoggedIn();
  
    if (!loggedIn) {
      throw new Error('Usuário não logado');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    if (employee.role === 'Cozinheiro') {
      employee.role = 'chefe';
    } else if (employee.role === 'Garçom') {
      employee.role = 'service';
    }
  
    const body = JSON.stringify({
      name: employee.name,
      email: employee.email,
      password: employee.password,
      role: employee.role
    });
  
    return this.http.post(this.apiUrl, body, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao adicionar funcionário:', error);
        throw error;
      })
    );
  }
  
  
  deleteEmployee(employeeId: number): Observable<any> {
    const { loggedIn, token } = this.authService.isUserLoggedIn();

    if (!loggedIn) {
      throw new Error('Usuário não logado');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.apiUrl}/${employeeId}`;

    return this.http.delete(url, { headers });
  }

  updateEmployee(employeeId: number, updatedData: any): Observable<any> {
    const { loggedIn, token } = this.authService.isUserLoggedIn();
  
    if (!loggedIn) {
      throw new Error('Usuário não logado');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    // Verifico a função selecionada e ajusto antes de enviar para a API mock
    if (updatedData.role === 'Cozinheiro') {
      updatedData.role = 'chefe';
    } else if (updatedData.role === 'Garçom') {
      updatedData.role = 'service';
    }
  
    const url = `${this.apiUrl}/${employeeId}`;
  
    return this.http.patch(url, JSON.stringify(updatedData), { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao atualizar funcionário:', error);
        throw error;
      })
    );
  }}
