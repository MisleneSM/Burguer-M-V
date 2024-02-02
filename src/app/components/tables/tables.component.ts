import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css', './tables.component.ptone.css']
})
export class TablesComponent implements OnInit {
  readyOrders: any[] = [];
  deliveredOrders: any[] = [];
  activeTab: string = 'ready';

  constructor(private orderService: OrderService, private router: Router) {} // Injete o Router

  ngOnInit(): void {
    this.updateOrders();
  }

  goToMenu() {
    this.router.navigate(['/menu']); // rota do menu
  }

  updateOrders() {
    this.orderService.getReadyOrdersFromBackend().subscribe(
      (orders) => {
        this.readyOrders = orders.filter(order => !order.entregue); 
        this.deliveredOrders = orders.filter(order => order.entregue);
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

  markOrderAsDelivered(order: any) { //quando clico no botão que tem essa função crio uma nova parte no meu backeend onde entregue recebe true
    order.entregue = true; 
    this.orderService.updateOrder(order).subscribe(
      () => {
        console.log('Order marked as delivered:', order);
        this.updateOrders();
      },
      (error) => {
        console.error('Error marking order as delivered:', error);
      }
    );
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  calculateTotal(order: any): number {
    return order.products.reduce((total: number, product: any) => total + (product.price * product.quantity), 0);
  }

  calculatePreparationTime(order: any): string {
    if (order.status === 'ready' && order.dateEntry && order.dateProcessed) {
      const entryTime = new Date(order.dateEntry).getTime();
      const processedTime = new Date(order.dateProcessed).getTime(); //getTime retorna um valor numerico
      const preparationTime = processedTime - entryTime;
      const minutes = Math.floor(preparationTime / 1000 / 60);

      return `${minutes} min`;
    } else {
      return '';
    }
  }
}

