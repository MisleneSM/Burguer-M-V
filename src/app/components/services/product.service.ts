import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './authentication.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/products';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getProducts(): Observable<any[]> {
    const { loggedIn, token } = this.authService.isUserLoggedIn();

    if (!loggedIn) {
      throw new Error('Usuário não logado');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache'
    });

    return this.http.get<any[]>(this.apiUrl, { headers }); // garante também que apenas usuários logados tenha acesso aos produtos.
  }

  addProduct(newProduct: any): Observable<any> {
    const { loggedIn, token } = this.authService.isUserLoggedIn();

    if (!loggedIn) {
      throw new Error('Usuário não logado');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const body = JSON.stringify({
      name: newProduct.name,
      price: newProduct.price,
      image: newProduct.image,
      type: newProduct.type
    });

    return this.http.post(this.apiUrl, body, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao adicionar produto:', error);
        throw error;
      })
    );
  }

  updateProduct(productId: number, updatedProduct: any): Observable<any> {
    const { loggedIn, token } = this.authService.isUserLoggedIn();
  
    if (!loggedIn) {
      throw new Error('Usuário não logado');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    const body = JSON.stringify(updatedProduct);
  
    return this.http.put(`${this.apiUrl}/${productId}`, body, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao atualizar produto:', error);
        throw error;
      })
    );
  }
  
  deleteProduct(productId: number): Observable<any> {
    const { loggedIn, token } = this.authService.isUserLoggedIn();
  
    if (!loggedIn) {
      throw new Error('Usuário não logado');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache'
    });
  
    return this.http.delete(`${this.apiUrl}/${productId}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao excluir produto:', error);
        throw error;
      })
    );
  }
}
