import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/authentication.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-cooked',
  templateUrl: './cooked.component.html',
  styleUrls: ['./cooked.component.css','./cooked.component.ptone.css','./cooked.component.pttwo.css']
})
export class CookedComponent implements OnInit {
  orders: any[] = [];
  activeTab: string = 'pending';

  constructor(private orderService: OrderService, private authService: AuthService, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  logout() {
    this.authService.logout();
  }

  // carrega os pedidos no servidor
  loadOrders() {
    this.orderService.getOrders().subscribe(
      (orders: any[]) => {
        this.orders = orders.map(order => {
          if (order.products && Array.isArray(order.products)) { // Adicionei essa condicional para verificar se o retorno do produto é realmente um array
            const productDetails = order.products.map((product: any) => {
              return {
                productName: product.name,
                quantity: product.quantity,
              };
            });
            return {
              ...order,
              productDetails: productDetails,
            };
          } else {
            return order;
          }
        });
      },
      (error: any) => {
        console.error('Erro ao puxar os produtos', error);
      }
    );
  }

  // Marcar o pedido como pronto
  markOrderAsReady(order: any) {
    order.status = 'ready';
    order.dateProcessed = new Date().toISOString();

    // Atualizar o pedido no serviço
    this.orderService.updateOrder(order).subscribe(
      () => {
        console.log('Pedido marcado como pronto:', order);
        this.loadOrders(); // atualiza a lista
      },
      (error) => {
        console.error('Falha ao marcar o pedido como pronto:', error);
      }
    );
  }

  calculatePreparationTime(order: any): string {
    if (order.status === 'ready' && order.dateEntry && order.dateProcessed) {
      const entryTime = new Date(order.dateEntry).getTime();
      const processedTime = new Date(order.dateProcessed).getTime();
      const preparationTime = processedTime - entryTime;
      const minutes = Math.floor(preparationTime / 1000 / 60);

      const formattedEntryDate = this.datePipe.transform(order.dateEntry, 'dd/MM/yyyy HH:mm:ss');
      return `Data: ${formattedEntryDate} - ${minutes} min`;
    } else {
      return '';
    }
  }

  setActiveTab(tab: string) { //controlar qual aba está ativa
    this.activeTab = tab;
  }

  filterOrdersByStatus(status: string): any[] { //filtra pedidos com base no status
    return this.orders.filter(order => order.status === status);
  }
}
