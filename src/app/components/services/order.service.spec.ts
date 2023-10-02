import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OrderService } from './order.service';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AuthService } from './authentication.service';


describe('OrderService', () => {
    let orderService: OrderService;
    let http: HttpClient;
    let authService: AuthService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [OrderService, HttpClient, AuthService],
        });

        orderService = TestBed.inject(OrderService);
        authService = TestBed.inject(AuthService);
        http = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should create', () => {
        expect(orderService).toBeTruthy();
    });

    it('addProduct - Deve adicionar um produto corretamente', () => {
        const productToAdd = { id: 1, name: 'Produto 1', price: 10 }; //Simulação de produto

        // Chama a função para adicionar o produto
        orderService.addProduct(productToAdd);

        // Obtem os produtos adicionados do BehaviorSubject
        let addedProducts: any[] = [];
        orderService.addedProduct$.subscribe((products) => {
            addedProducts = products;
        });

        expect(addedProducts.length).toBe(1);
        expect(addedProducts[0].product).toEqual(productToAdd);
        expect(addedProducts[0].quantity).toBe(1);
    });

    it('addProduct - Deve incrementar a quantidade de um produto existente', () => {
        const product1 = { id: 1, name: 'Produto 1', price: 10 };
        const product2 = { id: 2, name: 'Produto 2', price: 15 };

        // Adiciona o primeiro produto duas vezes
        orderService.addProduct(product1);
        orderService.addProduct(product1);

        // Adiciona o segundo produto apenas uma vez
        orderService.addProduct(product2);

        let addedProducts: any[] = [];
        orderService.addedProduct$.subscribe((products) => {
            addedProducts = products;
        });

        // Verifica se a quantidade do primeiro produto foi incrementada
        expect(addedProducts.length).toBe(2);
        expect(addedProducts[0].product).toEqual(product1);
        expect(addedProducts[0].quantity).toBe(2);

        // Verifica se o segundo produto foi adicionado corretamente
        expect(addedProducts[1].product).toEqual(product2);
        expect(addedProducts[1].quantity).toBe(1);
    });

    it('removeProduct - Deve remover um produto corretamente', () => {
        const productToAdd = { id: 1, name: 'Produto 1 ', price: 10 };
        orderService.addProduct(productToAdd);

        // Remove o produto
        orderService.removeProduct(productToAdd.id);

        let addedProducts: any[] = [];
        orderService.addedProduct$.subscribe((products) => {
            addedProducts = products;
        });

        //Verifica se o produto foi removido corretamente
        expect(addedProducts.length).toBe(0);
    });

    it('sendOrderToBackend - Deve enviar um pedido para o backend corretamente', () => {
        const authServiceInstance = TestBed.inject(AuthService);
        spyOn(authServiceInstance, 'isUserLoggedIn').and.returnValue({ loggedIn: true, token: 'mockedToken' });

        const mockOrder = { id: 1, items: [] }; // Mock de um pedido
        const mockResponse = 'Response data'; // Mock da resposta do servidor

        // Espiona a função 'post' do HttpClient e retornar um Observable com o mock de resposta
        const httpPostSpy = spyOn(http, 'post').and.returnValue(of(mockResponse));
        const consoleLogSpy = spyOn(console, 'log');

        orderService.sendOrderToBackend(mockOrder);

        expect(httpPostSpy).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith('Response data enviado para a API');

        expect(orderService.getAddedProductsLength()).toBe(0);
    });

    it('sendOrderToBackend - Deve tratar erro ao enviar um pedido para o backend', () => {
        const authServiceInstance = TestBed.inject(AuthService);
        spyOn(authServiceInstance, 'isUserLoggedIn').and.returnValue({ loggedIn: true, token: 'mockedToken' });

        const mockOrder = { id: 1, items: [] }; // Mock de um pedido
        const errorMessage = 'Erro simulado ao enviar pedido para a API'; // Mensagem de erro simulada

        // Espiona a função 'post' do HttpClient e retorna um Observable com erro simulado
        const httpPostSpy = spyOn(http, 'post').and.returnValue(throwError({ message: errorMessage }));
        const consoleErrorSpy = spyOn(console, 'error');

        orderService.sendOrderToBackend(mockOrder);

        // Testa o tratamento de erro após a chamada assíncrona
        expect(httpPostSpy).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Falha ao enviar pedido para a API:', errorMessage);
        expect(orderService.getAddedProductsLength()).toBe(0);
    });

    it('sendOrderToBackend - Deve resetar a quantidade de produtos para zero', () => {
        const authServiceInstance = TestBed.inject(AuthService);
        spyOn(authServiceInstance, 'isUserLoggedIn').and.returnValue({ loggedIn: true, token: 'mockedToken' });

        const mockOrder = { id: 1, items: [] }; // Mock de um pedido

        // Criado alguns itens de pedido com quantidades diferentes
        const mockItems = [
            { product: { id: 1, quantity: 2 } },
            { product: { id: 2, quantity: 3 } },
            { product: { id: 3, quantity: 1 } },
        ];

        // Adiciona os itens individualmente ao carrinho
        for (const mockItem of mockItems) {
            orderService.addProduct(mockItem.product);
        }

        orderService.sendOrderToBackend(mockOrder);

        const addedProducts = orderService.addedProduct$; // Acesse o estado do carrinho usando o observable
        addedProducts.subscribe(products => {
            for (const item of products) {
                expect(item.product.quantity).toBe('');
            }
        });
    });

    it('getOrders - Deve obter pedidos corretamente', () => {
        const httpResponse = new HttpResponse({
            body: [{ id: 1 }, { id: 2 }],
        });
        const responseBody = httpResponse.body;

        // Mock da solicitação HTTP
        const httpGetSpy = spyOn(http, 'get').and.returnValue(of(httpResponse));

        // Chamada da função getOrders
        let orders: any[] = [];
        orderService.getOrders().subscribe((data) => {
            orders = data;
        });

        // Verifica se a função HTTP foi chamada corretamente
        expect(httpGetSpy).toHaveBeenCalledWith('https://burger-queen-api-mock-88v3.vercel.app/orders', jasmine.objectContaining({
            headers: jasmine.any(HttpHeaders),
        }));

        // Verifica se os pedidos foram obtidos corretamente
        expect(responseBody).toEqual([Object({ id: 1 }), Object({ id: 2 })]);
    });

    it('decreaseProductQuantity - Deve diminuir a quantidade de um produto existente', () => {
        // Adicionado um produto de exemplo com quantidade 2
        const productToAdd = { id: 1, name: 'Produto de Teste', price: 10 };
        orderService.addProduct(productToAdd);
        orderService.addProduct(productToAdd);

        orderService.decreaseProductQuantity(productToAdd.id);

        // Obtem os produtos adicionados do BehaviorSubject
        let addedProducts: any[] = [];
        orderService.addedProduct$.subscribe((products) => {
            addedProducts = products;
        });

        // Verifica se a quantidade do produto foi diminuída
        expect(addedProducts.length).toBe(1);
        expect(addedProducts[0].quantity).toBe(1);
    });

    it('getOrderedProduct - Deve obter um produto de pedidos corretamente', () => {
        const exampleOrder = { product: { id: 1 }, quantity: 3 };

        spyOn(orderService, 'getOrderedProduct').and.returnValue(exampleOrder);

        const orderedProduct = orderService.getOrderedProduct(1);

        expect(orderService.getOrderedProduct).toHaveBeenCalledWith(1);
        expect(orderedProduct).toEqual(exampleOrder);
    });

    it('updateOrder - Deve atualizar um pedido corretamente', () => {
        const exampleOrder = { id: 1, status: 'ready' };
        const httpPutSpy = spyOn(http, 'put').and.returnValue(of({}));

        orderService.updateOrder(exampleOrder).subscribe(() => {
            expect(httpPutSpy).toHaveBeenCalled();

            expect(httpPutSpy).toHaveBeenCalledWith('https://burger-queen-api-mock-88v3.vercel.app/orders/1', jasmine.objectContaining(exampleOrder), jasmine.any(Object));
        });
    });

    it('getReadyOrdersFromBackend - Deve obter pedidos prontos corretamente quando o usuário estiver logado', fakeAsync(() => {
        const user = { loggedIn: true, token: 'mockedToken' };

        spyOn(authService, 'isUserLoggedIn').and.returnValue(user);

        let orders: any[] | undefined;

        orderService.getReadyOrdersFromBackend().subscribe((data) => {
            orders = data;
        });

        const req = httpTestingController.expectOne((request) => request.url.endsWith('?status=ready'));

        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${user.token}`);

        req.flush([{ id: 1, status: 'ready' }]);

        tick();

        expect(orders).toEqual([{ id: 1, status: 'ready' }]);
    }));

    it('getReadyOrdersFromBackend - Deve retornar EMPTY quando o usuário não estiver logado', fakeAsync(() => {
        // Simula que o usuário não está logado
        spyOn(authService, 'isUserLoggedIn').and.returnValue({ loggedIn: false, token: null });
    
        const response$ = orderService.getReadyOrdersFromBackend();
    
        // Não deve fazer nenhuma solicitação HTTP neste caso
        httpTestingController.expectNone(`${orderService['apiUrl']}?status=ready`);
    
        // Aguarda a resolução do Observable
        let response: any;
        response$.subscribe((data) => {
            response = data;
        });

        expect(response).toEqual(undefined);
    }));
});