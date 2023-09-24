import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookedComponent } from './cooked.component';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/authentication.service';
import { DatePipe } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('CookedComponent', () => {
  let component: CookedComponent;
  let fixture: ComponentFixture<CookedComponent>;
  let orderService: jasmine.SpyObj<OrderService>;
  let authService: jasmine.SpyObj<AuthService>;
  let datePipe: DatePipe;

  beforeEach(() => {
    const orderServiceSpy = jasmine.createSpyObj('OrderService', ['getOrders', 'updateOrder']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    datePipe = new DatePipe('en-US');
    
    TestBed.configureTestingModule({
      declarations: [CookedComponent],
      providers: [
        { provide: OrderService, useValue: orderServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: DatePipe, useValue: datePipe}
      ],
    });

    fixture = TestBed.createComponent(CookedComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    orderService.getOrders.and.returnValue(of([])); // Configuração do spy para retornar um observable simulado
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - Deve carregar os pedidos no ngOnInit', () => {
    const ordersMock = [
      { status: 'pending' },
      { status: 'cooked' }
    ];

    orderService.getOrders.and.returnValue(of(ordersMock));

    spyOn(component, 'loadOrders').and.callThrough(); //Espiona o método loadOrders

    component.ngOnInit();

    expect(component.loadOrders).toHaveBeenCalled();
    expect(component.orders).toEqual(ordersMock);
  });

  it('logout - Deve chamar o método de logout ao chamar a função logout', () => {
    const authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('loadOrders - Deve carregar os pedidos no ngOnInit', () => {
    const ordersMock = [
      { status: 'pending', products: [{ name: 'Product 1', quantity: 2 }] },
      { status: 'cooked', products: [{ name: 'Product 2', quantity: 3 }] },
    ];

    orderService.getOrders.and.returnValue(of(ordersMock));

    spyOn(component, 'loadOrders').and.callThrough();

    component.ngOnInit();

    expect(orderService.getOrders).toHaveBeenCalled();
    expect(component.loadOrders).toHaveBeenCalled();
  });

  it('loadOrders - Deve carregar os pedidos corretamente mesmo quando o retorno dos produtos não é um array', () => {
    const ordersMock = [
      { status: 'pending', products: { name: 'Product 1', quantity: 2 } },
      { status: 'cooked', products: { name: 'Product 2', quantity: 3 } },
    ];

    orderService.getOrders.and.returnValue(of(ordersMock));

    component.loadOrders();

    expect(component.orders).toEqual(ordersMock);
  });

  it('loadOrders - Deve lidar corretamente com o erro ao puxar os produtos', () => {
    const errorMessage = 'Erro ao buscar os produtos';

    spyOn(console, 'error');

    orderService.getOrders.and.returnValue(throwError(errorMessage));

    component.loadOrders();

    expect(console.error).toHaveBeenCalledWith('Erro ao puxar os produtos', errorMessage);
  });

  it('markOrderAsReady - Deve marcar o pedido como pronto e atualizar a lista de pedidos', () => {
    const orderToUpdate = {id: 1, status: 'pending'};

    const updatedOrder = { ...orderToUpdate, status: 'ready', dateProcessed: jasmine.any(String) };

    orderService.updateOrder.and.returnValue(of({}));

    spyOn(component, 'loadOrders');

    component.markOrderAsReady(orderToUpdate);

    expect(orderService.updateOrder).toHaveBeenCalledWith(updatedOrder);
    expect(component.loadOrders).toHaveBeenCalled();
  });

  it('markOrderAsReady - Deve tratar erro ao marcar o pedido como pronto', () => {
    const orderToUpdate = { id: 1, status: 'pending' };
    const errorResponse = { message: 'Erro ao marcar o pedido como pronto' };
  
    orderService.updateOrder.and.returnValue(throwError(errorResponse));
  
    spyOn(console, 'error'); // Espiona a função console.error
  
    component.markOrderAsReady(orderToUpdate);
  
    expect(orderService.updateOrder).toHaveBeenCalledWith(jasmine.objectContaining(orderToUpdate));
    expect(console.error).toHaveBeenCalledWith('Falha ao marcar o pedido como pronto:', errorResponse);
  });

  it('calculatePreparationTime - Deve calcular o tempo de preparo de um pedido pronto', () => {
    const order = {
      id: 1,
      status: 'ready',
      dateEntry: '2023-08-30T10:00:00Z',
      dateProcessed: '2023-08-30T10:30:00Z'
    };

    const expectedFormattedEntryDate = datePipe.transform(order.dateEntry, 'dd/MM/yyyy HH:mm:ss');
    const expectedPreparationTime = 'Data: ' + expectedFormattedEntryDate + ' - 30 min';

    const result = component.calculatePreparationTime(order);

    expect(result).toBe(expectedPreparationTime);
  });

  it('calculatePreparationTime - Deve retornar uma string vazia para um pedido não pronto', () => {
    const order = {
      id: 2,
      status: 'pending',
      dateEntry: '2023-08-30T11:00:00Z',
      dateProcessed: '2023-08-30T11:30:00Z'
    };

    const result = component.calculatePreparationTime(order);

    expect(result).toBe('');
  });

  it('setActiveTab - Deve definir a aba ativa corretamente', () => {
    const tab = 'pending';

    component.setActiveTab(tab);

    expect(component.activeTab).toBe(tab);
  });

  it('filterOrdersByStatus - Deve filtrar os pedidos pelo status corretamente', () => {
    const orders = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'ready' },
      { id: 3, status: 'cooked' },
      { id: 4, status: 'ready' }
    ];

    component.orders = orders;

    const filteredOrders = component.filterOrdersByStatus('ready');

    expect(filteredOrders.length).toBe(2);
    expect(filteredOrders.every(order => order.status === 'ready')).toBeTrue(); //toBeTrue verifica se o retorno é igual a true.
  });

  it('filterOrdersByStatus - Deve retornar um array vazio se nenhum pedido tiver o status fornecido', () => {
    const orders = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'pending' }
    ];

    component.orders = orders;

    const filteredOrders = component.filterOrdersByStatus('ready');

    expect(filteredOrders.length).toBe(0);
  });
});
