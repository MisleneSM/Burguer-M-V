import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './authentication.service';
import { Observable, EMPTY } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://burger-queen-api-mock-88v3.vercel.app/orders';
  private addedProducts: any[] = [];
  private addedProductSubject = new BehaviorSubject<any[]>(this.addedProducts);
  addedProduct$ = this.addedProductSubject.asObservable(); // converte o subject em Observavel

  public getApiUrl(): string {
    return this.apiUrl;
  }

  constructor(private http: HttpClient, private authService: AuthService) {}

  addProduct(product: any) {
    const existingProduct = this.addedProducts.find(p => p.product.id === product.id);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      this.addedProducts.push({ product, quantity: 1 });
    }
    this.addedProductSubject.next(this.addedProducts); // notifica os observadores que estejam "ouvindo" addedProduct$
  }

  // remove o produto do resumo do pedido
  removeProduct(productId: number) {
    this.addedProducts = this.addedProducts.filter(p => p.product.id !== productId);
    this.addedProductSubject.next(this.addedProducts);
  }

  getAddedProductsLength(): number {
    return this.addedProducts.length;
  }
  
  // Encaminhar pedidos para API
  sendOrderToBackend(order: any) {
    const { loggedIn, token } = this.authService.isUserLoggedIn();

    if (!loggedIn) {
      throw new Error('User not logged in');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(this.apiUrl, order, { headers }).subscribe(
      (response) => {
        console.log(response + ' enviado para a API');
        this.addedProducts = [];
        this.addedProductSubject.next(this.addedProducts);
      },
      (error) => {
        console.error('Falha ao enviar pedido para a API:', error.message);
      }
    );

    // Reset quantity inputs to zero
    this.addedProducts.forEach(item => {
      item.product.quantity = '';
    });
  }

  // Pegar produtos enviados para API
  getOrders(): Observable<any[]> {
    const user = this.authService.isUserLoggedIn();
    const headers = new HttpHeaders({
      'Authorization': user.loggedIn ? `Bearer ${user.token}` : ''
    });

      return this.http.get<any[]>(this.apiUrl, { headers });
  }

  // diminuir a quantidade do produto
  decreaseProductQuantity(productId: number) {
    const existingProduct = this.addedProducts.find(p => p.product.id === productId);
    if (existingProduct) {
      existingProduct.quantity -= 1;
    }
  }
  
  // busca produto especifico que foi armazenado, função chamada em removeProductFromOrder
  getOrderedProduct(productId: number): any {
    return this.addedProducts.find(p => p.product.id === productId);
  }
  
  // atualiza pedidos da API quando for marcados como entregue, função chamada em markOrderAsDelivered  - tables
  updateOrder(order: any): Observable<any> {
    const updateUrl = `${this.apiUrl}/${order.id}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.isUserLoggedIn().token}`
    });

    return this.http.put(updateUrl, order, { headers });
  }

  //função para pegar os pedidos que estão marcados como pronto no cooked
  getReadyOrdersFromBackend(): Observable<any[]> {
    const user = this.authService.isUserLoggedIn();
    if (user.loggedIn) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${user.token}`
      });

      return this.http.get<any[]>(`${this.apiUrl}?status=ready`, { headers }); // retornará apenas pedidos que tenham status ready
    } else {
      return EMPTY; // observador vazio 
    }
  }
}


