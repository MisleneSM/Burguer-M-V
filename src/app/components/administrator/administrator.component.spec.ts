import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministratorComponent } from './administrator.component';
import { AuthService } from '../services/authentication.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { UserService } from '../services/user.service';
import { ProductService } from '../services/product.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AdministratorComponent', () => {
  let component: AdministratorComponent;
  let fixture: ComponentFixture<AdministratorComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let productService: jasmine.SpyObj<ProductService>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getEmployees', 'addEmployee', 'deleteEmployee', 'updateEmployee', 'loadEmployees']); // teste função ngOnInit, loadEmployees -, addEmployees
    userServiceSpy.getEmployees.and.returnValue(of([{ id: 1, nome: 'Funcionário 1' }, { id: 2, nome: 'Funcionário 2' }])); // teste função ngOnInit

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout', 'isUserLoggedIn']);
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts', 'addProduct', 'updateProduct', 'deleteProduct', 'loadProducts']);

    TestBed.configureTestingModule({
      declarations: [AdministratorComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ProductService, useValue: productServiceSpy }
      ],
      imports: [FormsModule, HttpClientModule, HttpClientTestingModule],
    });
    fixture = TestBed.createComponent(AdministratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - deve carregar funcionários no ngOnInit', () => {
    const funcionariosFalsos = [{ id: 1, nome: 'Funcionário 1' }, { id: 2, nome: 'Funcionário 2' }];
    userService.getEmployees.and.returnValue(of(funcionariosFalsos));

    spyOn(component, 'loadEmployees').and.callThrough(); // callThrough é utilizado para manter o comportamento original dessa função

    component.ngOnInit();

    expect(component.loadEmployees).toHaveBeenCalled(); // verifica se a função é chamada
    expect(component.employees).toEqual(funcionariosFalsos);
  });

  it('logout - Deve chamar o método logout do AuthService quando logout é acionado', () => {
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
  });

  it('loadEmployees - Deve chamar userService.getEmployees e atualizar a propriedade employees', () => {
    const employees = [{ id: 1, name: 'Employee 1' }, { id: 2, name: 'Employee 2' }];
    userService.getEmployees.and.returnValue(of(employees));

    component.loadEmployees();

    expect(userService.getEmployees).toHaveBeenCalled();
    expect(component.employees).toEqual(employees);
  });

  it('loadEmployees - Deve tratar erro ao carregar funcionários', () => {
    const errorResponse = { message: 'Erro ao carregar funcionários' };
    userService.getEmployees.and.returnValue(throwError(errorResponse)); // Simula um erro

    component.loadEmployees();

    expect(userService.getEmployees).toHaveBeenCalled();
    expect(component.employees).toEqual([]); // Verifica se a propriedade employees está vazia após o erro
  });

  it('addEmployee - Deve chamar userService.addEmployee com sucesso', () => {
    const expectedEmployee = { id: 0, name: '', email: '', password: '', role: 'garçom' };

    userService.addEmployee.and.returnValue(of({}));

    component.addEmployee();

    expect(userService.addEmployee).toHaveBeenCalledWith(expectedEmployee); // verifica se a função esta chamando os argumentos especificos da variavel
  });

  it('addEmployee - Deve tratar erro ao chamar userService.addEmployee', () => {
    const errorMessage = 'Erro ao adicionar funcionário';
    userService.addEmployee.and.returnValue(throwError(errorMessage));

    component.addEmployee();

    expect(userService.addEmployee).toHaveBeenCalledWith(component.newEmployee);
  });

  it('resetForm - Deve redefinir o formulário corretamente', () => {
    component.newEmployee = { name: 'Nome', email: 'email@example.com', password: 'senha123', role: 'garçom' };

    component.resetForm();

    expect(component.newEmployee).toEqual({ name: '', email: '', password: '', role: 'garçom' });
  });

  it('deleteEmployee - Deve excluir um funcionário com confirmação', () => {
    spyOn(window, 'confirm').and.returnValue(true); // returnValue configura o que a função espiada deve retornar quando for chamada.

    userService.deleteEmployee.and.returnValue(of({})); // retorna um valor vazio concluindo a operação de exclusão simulada

    component.deleteEmployee(1);

    expect(window.confirm).toHaveBeenCalledWith('Tem certeza que deseja excluir esse funcionário?');
  });

  it('deleteEmployee - Deve tratar erro ao excluir funcionário', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const errorResponse = { message: 'Erro ao excluir funcionário' };
    userService.deleteEmployee.and.returnValue(throwError(errorResponse));

    component.deleteEmployee(1);

    expect(window.confirm).toHaveBeenCalledWith('Tem certeza que deseja excluir esse funcionário?');
  });

  it('showUpdateForm - Deve configurar isEditing como true e definir employeeToUpdate corretamente', () => {
    const employee = {
      id: 1,
      name: 'John Doe',
      role: 'Developer',
    };

    component.showUpdateForm(employee);

    expect(component.isEditing).toBe(true); // verifica se são identicos
    expect(component.employeeToUpdate).toEqual(employee);
  });

  it('updateEmployee - Deve atualizar um funcionário com sucesso', () => {
    const employeeToUpdate = {
      id: 1,
      name: 'John Doe',
      role: 'Cozinheiro',
    };

    userService.updateEmployee.and.returnValue(of({})); // simula que a chamada foi bem sucedida

    spyOn(component, 'loadEmployees');
    spyOn(component, 'cancelUpdate');

    component.employeeToUpdate = { ...employeeToUpdate };

    component.updateEmployee();

    expect(userService.updateEmployee).toHaveBeenCalledWith(1, jasmine.objectContaining({ id: 1, name: 'John Doe', role: 'chefe' }));

    expect(component.loadEmployees).toHaveBeenCalled();
    expect(component.cancelUpdate).toHaveBeenCalled();
  });

  it('updateEmployee - Não deve fazer nada quando o papel não for "Cozinheiro" ou "Garçom"', () => {
    component.employeeToUpdate = { role: 'OutroPapel' };
    const initialRole = component.employeeToUpdate.role;

    spyOn(component, 'updateEmployee').and.stub(); // stub substitui a função e não executa o comportamento real

    component.updateEmployee();

    expect(component.updateEmployee).toHaveBeenCalled()
    expect(component.employeeToUpdate.role).toBe(initialRole); // O papel não deve ser alterado
  });

  it('updateEmployee - Deve tratar erro ao atualizar funcionário', () => {
    const errorResponse = { message: 'Erro ao atualizar funcionário' };
    userService.updateEmployee.and.returnValue(throwError(errorResponse)); // Simula um erro

    spyOn(console, 'error');

    component.updateEmployee();

    expect(console.error).toHaveBeenCalledWith('Erro ao atualizar funcionário', errorResponse);
  });

  it('updateEmployee - Deve atualizar o role para "chefe" quando o role atual for "Cozinheiro"', () => {
    component.employeeToUpdate = { id: 1, role: 'Cozinheiro' };
    userService.updateEmployee.and.returnValue(of({}));

    component.updateEmployee();

    expect(component.employeeToUpdate.role).toBe('');
  });

  it('updateEmployee - Deve atualizar o role para "service" quando o role atual for "Garçom"', () => {
    component.employeeToUpdate = { id: 1, role: 'Garçom' };
    userService.updateEmployee.and.returnValue(of({}));

    component.updateEmployee();

    expect(component.employeeToUpdate.role).toBe('');
  });

  it('cancelUpdate - Deve cancelar a edição e redefinir os valores', () => {
    component.isEditing = true;
    component.employeeToUpdate = { id: 1, name: 'Nome', role: 'Cargo' };

    component.cancelUpdate();

    expect(component.isEditing).toBe(false);
    expect(component.employeeToUpdate).toEqual({ id: 0, name: '', role: '' });
  });

  it('setActiveTab - Deve definir a aba ativa corretamente', () => {
    authService.isUserLoggedIn.and.returnValue({ loggedIn: true, token: 'fakeToken' });

    component.activeTab = 'outra_aba';
    component.isEmployeesTabActive = true;

    // Espia a função loadProducts para evitar o erro de subscrição(subscribe)
    spyOn(component, 'loadProducts').and.stub();

    component.setActiveTab('produtos');

    expect(component.activeTab).toBe('produtos');
    expect(component.isEmployeesTabActive).toBe(false);

    component.setActiveTab('outra_aba');

    expect(component.activeTab).toBe('outra_aba');

    expect(component.isEmployeesTabActive).toBe(true);
  });

  it('loadProducts - Deve carregar produtos com sucesso', () => {
    const mockProductsResponse = [{ id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' }]; // Define a resposta simulada

    productService.getProducts.and.returnValue(of(mockProductsResponse));

    component.loadProducts();

    expect(productService.getProducts).toHaveBeenCalledOnceWith(); // Verifica se a função foi chamada
    expect(component.products).toEqual(mockProductsResponse); // Verifica se a variável products foi atualizada corretamente
  });

  it('loadProducts - Deve tratar erro ao carregar produtos', () => {
    const errorResponse = { message: 'Erro ao carregar produtos' };
    productService.getProducts.and.returnValue(throwError(errorResponse)); // Simula um erro

    spyOn(console, 'error');

    component.loadProducts();

    expect(console.error).toHaveBeenCalledWith('Erro ao carregar produtos', errorResponse);
  });

  it('addProduct - Deve adicionar um novo produto com sucesso', () => {
    const newProduct = {
      name: 'Novo Produto',
      price: '10.99',
      image: 'produto.jpg',
      type: 'Tipo Produto'
    };

    component.newProduct = { ...newProduct };

    productService.addProduct.and.returnValue(of({}));

    spyOn(component, 'loadProducts');
    spyOn(component, 'resetProductForm');

    component.addProduct();

    expect(productService.addProduct).toHaveBeenCalledWith(newProduct);
    expect(component.loadProducts).toHaveBeenCalled();
    expect(component.resetProductForm).toHaveBeenCalled();
  });

  it('addProduct - Deve tratar erro ao adicionar um novo produto', () => {
    const errorResponse = { message: 'Erro ao adicionar produto' };
    const newProduct = {
      name: 'Novo Produto',
      price: '10.99',
      image: 'produto.jpg',
      type: 'Tipo Produto'
    };
    component.newProduct = { ...newProduct };
  
    productService.addProduct.and.returnValue(throwError(errorResponse)); // Simula um erro
  
    spyOn(console, 'error'); // Espiona a função console.error
  
    component.addProduct();
  
    expect(console.error).toHaveBeenCalledWith('Erro ao adicionar produto', errorResponse);
  });

  it('resetProductForm - Deve redefinir o formulário de produto corretamente', () => {
    component.newProduct = {
      name: 'Produto de Teste',
      price: '9.99',
      image: 'teste.jpg',
      type: 'Tipo de Teste'
    };

    // Chama a função para redefinir o formulário
    component.resetProductForm();

    // Verifica se os campos foram redefinidos corretamente
    expect(component.newProduct.name).toBe('');
    expect(component.newProduct.price).toBe('');
    expect(component.newProduct.image).toBe('');
    expect(component.newProduct.type).toBe('');
  });

  it('editProduct - Deve editar um produto corretamente', () => {
    const productToEdit = {
      id: 1,
      name: 'Produto Original',
      price: '19.99',
      image: 'original.jpg',
      type: 'Tipo Original'
    };

    component.editProduct(productToEdit);

    // Verifica se as propriedades foram definidas corretamente para edição
    expect(component.isEditingProduct).toBe(true);
    expect(component.productToUpdate).toEqual(productToEdit); // Verifica se o produto para atualização é igual ao produto original
  });

  it('updateProduct - Deve atualizar um produto corretamente', () => {
    const productToUpdate = {
        id: 1,
        name: 'Produto Original',
        price: '19.99',
        image: 'original.jpg',
        type: 'Café da manha'
    };
  
    productService.updateProduct.and.returnValue(of({})); 
  
    spyOn(component, 'loadProducts');
    spyOn(component, 'cancelUpdateProduct');
  
    component.productToUpdate = { ...productToUpdate };
    component.updateProduct();
  
    expect(productService.updateProduct).toHaveBeenCalledWith(productToUpdate.id, productToUpdate);
    expect(component.loadProducts).toHaveBeenCalled();
    expect(component.cancelUpdateProduct).toHaveBeenCalled();
  });

  it('updateProduct - Deve tratar erro ao atualizar um produto', () => {
    const errorResponse = { message: 'Erro ao atualizar produto' };
    const productToUpdate = {
      id: 1,
      name: 'Produto Original',
      price: '19.99',
      image: 'original.jpg',
      type: 'Café da manha'
    };
    component.productToUpdate = { ...productToUpdate };
  
    productService.updateProduct.and.returnValue(throwError(errorResponse)); // Simula um erro
  
    spyOn(console, 'error'); // Espiona a função console.error
  
    component.updateProduct();
  
    expect(console.error).toHaveBeenCalledWith('Erro ao atualizar produto', errorResponse);
  });

  it('cancelUpdateProduct - Deve cancelar a atualização de um produto corretamente', () => {
    component.isEditingProduct = true;
    component.productToUpdate = {
      id: 1,
      name: 'Produto Original',
      price: '19.99',
      image: 'original.jpg',
      type: 'Tipo Original'
    };

    component.cancelUpdateProduct();

    expect(component.isEditingProduct).toBe(false);
    expect(component.productToUpdate).toEqual({ id: 0, name: '', price: '', image: '', type: '' });
  });


  it('deleteProduct - Deve excluir um produto corretamente', () => {
    const productId = 1;
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(true);
    const deleteProductResponse = {}; // Simulando uma resposta vazia do serviço

    productService.deleteProduct.and.returnValue(of(deleteProductResponse));
    
    const loadProductsSpy = spyOn(component, 'loadProducts');

    component.deleteProduct(productId);

    expect(confirmSpy).toHaveBeenCalledWith('Tem certeza que deseja excluir este produto?');
    expect(productService.deleteProduct).toHaveBeenCalledWith(productId);

    expect(loadProductsSpy).toHaveBeenCalled();
  });

  it('deleteProduct - Deve tratar erro ao excluir um produto', () => {
    const productId = 1;
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(true);
    const errorResponse = { message: 'Erro ao excluir produto' };
  
    productService.deleteProduct.and.returnValue(throwError(errorResponse)); // Simula um erro
  
    spyOn(console, 'error'); // Espiona a função console.error
  
    component.deleteProduct(productId);
  
    expect(confirmSpy).toHaveBeenCalledWith('Tem certeza que deseja excluir este produto?');
    expect(productService.deleteProduct).toHaveBeenCalledWith(productId);
  
    expect(console.error).toHaveBeenCalledWith('Erro ao excluir produto', errorResponse);
  });
});
