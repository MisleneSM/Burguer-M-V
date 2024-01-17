import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  selectedProducts: any[] = [];
  totalAmount: number = 0;
  customerName: string = '';

  constructor(private orderService: OrderService) {}

  // atualiza o resumo de pedido caso haja alguma alteração
  ngOnInit(): void {
    this.orderService.addedProduct$.subscribe((products) => {
      this.selectedProducts = products;
    });
  }

  // remove por completo os pedidos
  removeProductFromOrder(product: any) {
    this.orderService.removeProduct(product.id);
    product.quantity = 0;
  }

  calculateTotalAmount(): number {
    return this.selectedProducts.reduce((total, product) => total + product.product.price * product.quantity, 0);
  }

  // encaminha pedidos para a API
  sendOrderToAPI() {
    console.log('Sending order:', this.customerName, this.selectedProducts);
    const order = {
      client: this.customerName,
      products: this.selectedProducts.map(item => ({
        ...item.product, 
        quantity: item.quantity
      })),
      status: 'pending', 
      dateEntry: new Date().toISOString(), // transforma a data em string
      dateProcessed: '' 
    };

    try {
      this.orderService.sendOrderToBackend(order);
      this.customerName = ''; // limpa o resumo do pedido ao encaminhar para a cozinha
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao enviar pedido:', error.message);
      } else {
        console.error('Ocorreu um erro desconhecido ao enviar o pedido.');
      }
    }
  }
}