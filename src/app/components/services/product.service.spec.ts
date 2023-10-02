import { TestBed, fakeAsync} from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { ProductService } from "./product.service";
import { AuthService } from "./authentication.service";
import { UserService } from "./user.service";

describe('ProductService', () => {
    let productService: ProductService;
    let httpTestingController: HttpTestingController;
    let authService: jasmine.SpyObj<AuthService>;
    let userService: jasmine.SpyObj<UserService>;

    beforeEach(() => {
        const authServiceSpy = jasmine.createSpyObj('AuthService', ['isUserLoggedIn']);
        const userServiceSpy = jasmine.createSpyObj('UserService', ['getEmployees', 'addEmployee', 'deleteEmployee', 'updateEmployee', 'loadEmployees']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ProductService,
                { provide: AuthService, useValue: authServiceSpy },
                { provide: UserService, useValue: userServiceSpy }
            ]
        });

        productService = TestBed.inject(ProductService);
        httpTestingController = TestBed.inject(HttpTestingController);
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    });

    it('should create', () => {
        expect(productService).toBeTruthy();
    });

    it('getProducts - Deve retornar produtos quando o usuário estiver logado', () => {
        const tokenDummy = 'tokenDummy';
        const respostaDummy = [{ id: 1, nome: 'Produto 1' }, { id: 2, nome: 'Produto 2' }];

        authService.isUserLoggedIn.and.returnValue({ loggedIn: true, token: tokenDummy });

        productService.getProducts().subscribe((produtos) => {
            expect(produtos).toEqual(respostaDummy);
        });

        const req = httpTestingController.expectOne('https://burger-queen-api-mock-88v3.vercel.app/products');
        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.get('Authorization')).toEqual(`Bearer ${tokenDummy}`);

        req.flush(respostaDummy);
    });

    it('getProducts - Deve lançar um erro quando o usuário não estiver logado', () => {
        authService.isUserLoggedIn.and.returnValue({ loggedIn: false, token: null });

        expect(() => {
            productService.getProducts().subscribe();
        }).toThrowError('Usuário não logado');
    });

    it('addProduct - Deve adicionar um produto quando o usuário estiver logado', fakeAsync(() => {
        const tokenDummy = 'tokenDummy';
        const newProduct = {
            name: 'Novo Produto',
            price: 10.0,
            image: 'imagem.png',
            type: 'Tipo'
        };

        authService.isUserLoggedIn.and.returnValue({ loggedIn: true, token: tokenDummy });

        productService.addProduct(newProduct).subscribe((response) => { });

        // Verifique se a solicitação POST foi feita com os cabeçalhos corretos
        const req = httpTestingController.expectOne('https://burger-queen-api-mock-88v3.vercel.app/products');
        expect(req.request.method).toEqual('POST');
        expect(req.request.headers.get('Authorization')).toEqual(`Bearer ${tokenDummy}`);
        expect(req.request.headers.get('Content-Type')).toEqual('application/json');

        // Simula uma resposta de sucesso
        req.flush({});
    }));

    it('addProduct - Deve lançar um erro quando o usuário não estiver logado', () => {
        authService.isUserLoggedIn.and.returnValue({ loggedIn: false, token: null });
        const newProduct = {
            name: 'Novo Produto',
            price: 10.0,
            image: 'imagem.png',
            type: 'Tipo'
        };

        expect(() => {
            productService.addProduct(newProduct).subscribe();
        }).toThrowError('Usuário não logado');
    });

    it('updateProduct - Deve atualizar um produto quando o usuário estiver logado', fakeAsync(() => {
        const tokenDummy = 'tokenDummy';
        const productId = 1;
        const updatedProduct = {
            name: 'Produto Atualizado',
            price: 20.0,
            image: 'nova-imagem.png',
            type: 'Novo Tipo'
        };

        authService.isUserLoggedIn.and.returnValue({ loggedIn: true, token: tokenDummy });

        productService.updateProduct(productId, updatedProduct).subscribe((response) => { });

        // Verifique se a solicitação PUT foi feita com os cabeçalhos corretos
        const req = httpTestingController.expectOne(`${productService['apiUrl']}/${productId}`); // Acessando apiUrl indiretamente
        expect(req.request.method).toEqual('PUT');
        expect(req.request.headers.get('Authorization')).toEqual(`Bearer ${tokenDummy}`);
        expect(req.request.headers.get('Content-Type')).toEqual('application/json');

        // Simula uma resposta de sucesso
        req.flush({});
    }));

    it('updateProduct - Deve lançar um erro quando o usuário não estiver logado', () => {
        authService.isUserLoggedIn.and.returnValue({ loggedIn: false, token: null });
        const productId = 1;
        const updatedProduct = {
            name: 'Produto Atualizado',
            price: 20.0,
            image: 'nova-imagem.png',
            type: 'Novo Tipo'
        };

        expect(() => {
            productService.updateProduct(productId, updatedProduct).subscribe();
        }).toThrowError('Usuário não logado');
    });

    it('deleteProduct - Deve excluir um produto quando o usuário estiver logado', fakeAsync(() => {
        const tokenDummy = 'tokenDummy';
        const productId = 1;

        authService.isUserLoggedIn.and.returnValue({ loggedIn: true, token: tokenDummy });

        productService.deleteProduct(productId).subscribe((response) => { });

        // Verifique se a solicitação DELETE foi feita com os cabeçalhos corretos
        const req = httpTestingController.expectOne(`${productService['apiUrl']}/${productId}`); // Acessando apiUrl indiretamente
        expect(req.request.method).toEqual('DELETE');
        expect(req.request.headers.get('Authorization')).toEqual(`Bearer ${tokenDummy}`);
        expect(req.request.headers.get('Cache-Control')).toEqual('no-cache');

        // Simula uma resposta de sucesso
        req.flush({});
    }));

    it('deleteProduct - Deve lançar um erro quando o usuário não estiver logado', () => {
        authService.isUserLoggedIn.and.returnValue({ loggedIn: false, token: null });

        expect(() => {
            productService.deleteProduct(1).subscribe();
        }).toThrowError('Usuário não logado');
    });
});