import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ProductService } from '../services/product.service';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css', './menu.componentOne.css']
})
export class MenuComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  filteredType: string = 'Café da manha';
  @Output() addToOrder: EventEmitter<any> = new EventEmitter<any>(); // adicionar produtos a um pedido
  @Output() removeFromOrder: EventEmitter<any> = new EventEmitter<any>(); // remover produtos de um pedido

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((data) => {
      this.products = data[0];
      this.filteredProducts = this.products.filter(product => product.type === 'Café da manha');
    });
  }

  goToMesas() {
    this.router.navigate(['/tables']);
  }

  logout(): void {
    this.authService.logout();
  }

  filterProducts(type: string) {
    this.filteredProducts = this.products.filter((product) => product.type === type);
    this.filteredType = type;
  }

  // adiciona o produto ao resumo do pedido
  addProductToOrder(product: any) {
    this.orderService.addProduct(product);
    this.updateProductQuantity(product, 1); // adiciona os produtos de 1 em 1
  }

  // remove o produto do resumo do pedido
  removeProductFromOrder(product: any) {
    const existingProduct = this.orderService.getOrderedProduct(product.id);

    if (existingProduct) {
      if (existingProduct.quantity > 1) {
        this.orderService.decreaseProductQuantity(product.id);
        this.updateProductQuantity(product, -1);
      } else {
        this.orderService.removeProduct(product.id);
        this.updateProductQuantity(product, -1);
      }
    }
  }
  
  // Atualiza a quantidade de produto
  private updateProductQuantity(product: any, change: number) {
    product.quantity = (product.quantity || 0) + change;
  }
}
