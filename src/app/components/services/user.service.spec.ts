import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { AuthService } from './authentication.service';

describe('UserService', () => {
  let userService: UserService;
  let httpTestingController: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService, AuthService],
    });
    userService = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  it('should create', () => {
    expect(userService).toBeTruthy();
});

  it('getEmployees - Deve obter funcionários com as informações corretas', () => {
    // Simula o método isUserLoggedIn do AuthService
    spyOn(authService, 'isUserLoggedIn').and.returnValue({
      loggedIn: true,
      token: 'token123',
    });

    userService.getEmployees().subscribe((usuarios) => {
      expect(usuarios.length).toBe(2);
      expect(usuarios[0].id).toBe(1);
      expect(usuarios[0].nome).toBe('Usuário 1');
      expect(usuarios[0].funcao).toBe('Cozinheiro');
      expect(usuarios[1].id).toBe(2);
      expect(usuarios[1].nome).toBe('Usuário 2');
      expect(usuarios[1].funcao).toBe('Garçom');
    });

    const requisicao = httpTestingController.expectOne('https://burger-queen-api-mock-88v3.vercel.app/users');

    expect(requisicao.request.method).toBe('GET');
    expect(requisicao.request.headers.get('Authorization')).toBe('Bearer token123');
  });

  it('getEmployees - Deve lançar um erro se o usuário não estiver logado', () => {
    spyOn(authService, 'isUserLoggedIn').and.returnValue({loggedIn: false, token: 'token123'});

    expect(() => userService.getEmployees()).toThrowError('Usuário não logado');
  });

  it('addEmployee - Deve adicionar um funcionário com as informações corretas', () => {
    spyOn(authService, 'isUserLoggedIn').and.returnValue({
      loggedIn: true,
      token: 'token123',
    });

    const funcionarioParaAdicionar = {
      name: 'Novo Funcionário',
      email: 'novo@funcionario.com',
      password: 'senha123',
      role: 'Cozinheiro',
    };

    userService.addEmployee(funcionarioParaAdicionar).subscribe(() => {});

    const requisicao = httpTestingController.expectOne('https://burger-queen-api-mock-88v3.vercel.app/users');

    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.headers.get('Authorization')).toBe('Bearer token123');

    const corpoEsperado = JSON.stringify({
      name: 'Novo Funcionário',
      email: 'novo@funcionario.com',
      password: 'senha123',
      role: 'chefe', // Deve ser convertido de 'Cozinheiro' para 'chefe'
    });

    expect(requisicao.request.body).toEqual(corpoEsperado);
  });

  it('addEmployee - Deve lançar um erro se o usuário não estiver logado', () => {
    spyOn(authService, 'isUserLoggedIn').and.returnValue({loggedIn: false, token: 'token123'});

    const funcionarioParaAdicionar = {
      name: 'Novo Funcionário',
      email: 'novo@funcionario.com',
      password: 'senha123',
      role: 'Cozinheiro',
    };

    expect(() => userService.addEmployee(funcionarioParaAdicionar)).toThrowError('Usuário não logado');
  });

  it('addEmployee - Deve adicionar um funcionário com role "chefe" quando o role atual for "Cozinheiro"', () => {
    const authServiceSpy = spyOn(authService, 'isUserLoggedIn').and.returnValue({ loggedIn: true, token: 'tokenDummy' });
  
    const newEmployee = {
      name: 'Novo Funcionário',
      email: 'novo@email.com',
      password: 'senha123',
      role: 'Cozinheiro'
    };
  
    userService.addEmployee(newEmployee).subscribe((response) => {
      expect(response.role).toEqual('chefe');
    });
  
    const req = httpTestingController.expectOne('https://burger-queen-api-mock-88v3.vercel.app/users');
    expect(req.request.method).toEqual('POST');
    expect(req.request.headers.get('Authorization')).toEqual('Bearer tokenDummy');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json');
  
    // Simula uma resposta de sucesso
    req.flush({ role: 'chefe' });
  });
  
  it('addEmployee - Deve adicionar um funcionário com role "service" quando o role atual for "Garçom"', () => {
    const authServiceSpy = spyOn(authService, 'isUserLoggedIn').and.returnValue({ loggedIn: true, token: 'tokenDummy' });
  
    const newEmployee = {
      name: 'Novo Funcionário',
      email: 'novo@email.com',
      password: 'senha123',
      role: 'Garçom'
    };
  
    userService.addEmployee(newEmployee).subscribe((response) => {
      expect(response.role).toEqual('service');
    });
  
    const req = httpTestingController.expectOne('https://burger-queen-api-mock-88v3.vercel.app/users');
    expect(req.request.method).toEqual('POST');
    expect(req.request.headers.get('Authorization')).toEqual('Bearer tokenDummy');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json');
  
    // Simula uma resposta de sucesso
    req.flush({ role: 'service' });
  });

  it('deleteEmployee - Deve excluir um funcionário com as informações corretas', () => {
    spyOn(authService, 'isUserLoggedIn').and.returnValue({
      loggedIn: true,
      token: 'token123',
    });

    const idDoFuncionarioParaExcluir = 1;

    userService.deleteEmployee(idDoFuncionarioParaExcluir).subscribe(() => {});

    const urlEsperada = `https://burger-queen-api-mock-88v3.vercel.app/users/${idDoFuncionarioParaExcluir}`;
    
    const requisicao = httpTestingController.expectOne(urlEsperada);

    expect(requisicao.request.method).toBe('DELETE');
    expect(requisicao.request.headers.get('Authorization')).toBe('Bearer token123');
  });

  it('deleteEmployee - Deve lançar um erro se o usuário não estiver logado', () => {
    spyOn(authService, 'isUserLoggedIn').and.returnValue({loggedIn: false, token: 'token123'});

    const idDoFuncionarioParaExcluir = 1;

    expect(() => userService.deleteEmployee(idDoFuncionarioParaExcluir)).toThrowError('Usuário não logado');
  });

  it('updateEmployee - Deve atualizar um funcionário com as informações corretas', () => {
    spyOn(authService, 'isUserLoggedIn').and.returnValue({
      loggedIn: true,
      token: 'token123',
    });

    const idDoFuncionarioParaAtualizar = 1;
    const dadosAtualizados = {
      name: 'Mislene',
      email: 'atualizado@funcionario.com',
      password: 'senha123',
      role: 'Cozinheiro',
    };

    userService.updateEmployee(idDoFuncionarioParaAtualizar, dadosAtualizados).subscribe(() => {});

    const urlEsperada = `https://burger-queen-api-mock-88v3.vercel.app/users/${idDoFuncionarioParaAtualizar}`;

    const requisicao = httpTestingController.expectOne(urlEsperada);

    expect(requisicao.request.method).toBe('PATCH');
    expect(requisicao.request.headers.get('Authorization')).toBe('Bearer token123');

    const corpoEsperado = JSON.stringify({
      name: 'Mislene',
      email: 'atualizado@funcionario.com',
      password: 'senha123',
      role: 'chefe'
    });

    expect(requisicao.request.body).toEqual(corpoEsperado);
  });

  it('updateEmployee - Deve lançar um erro se o usuário não estiver logado', () => {
    spyOn(authService, 'isUserLoggedIn').and.returnValue({
      loggedIn: false, token: 'token123'});

    const idDoFuncionarioParaAtualizar = 1;
    const dadosAtualizados = {
      name: 'Mislene',
      email: 'atualizado@funcionario.com',
      password: 'senha123',
      role: 'Cozinheiro',
    };

    expect(() => userService.updateEmployee(idDoFuncionarioParaAtualizar, dadosAtualizados)).toThrowError('Usuário não logado');
  });

  it('updateEmployee - Deve atualizar o role para "chefe" quando o role atual for "Cozinheiro"', () => {
    spyOn(authService, 'isUserLoggedIn').and.returnValue({ loggedIn: true, token: 'tokenDummy' });

    const employeeId = 1;
    const updatedData = {role: 'Cozinheiro'};

    userService.updateEmployee(employeeId, updatedData).subscribe((response) => {
      expect(response.role).toEqual('chefe');
    });

    // Verifica se a solicitação PATCH foi feita com os cabeçalhos corretos e o corpo JSON correto
    const req = httpTestingController.expectOne(`https://burger-queen-api-mock-88v3.vercel.app/users/${employeeId}`);
    expect(req.request.method).toEqual('PATCH');
    expect(req.request.headers.get('Authorization')).toEqual('Bearer tokenDummy');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json');
   
    req.flush({role: 'chefe'}); // Simule uma resposta de sucesso
  });

  it('updateEmployee - Deve atualizar o role para "service" quando o role atual for "Garçom"', () => {
    spyOn(authService, 'isUserLoggedIn').and.returnValue({ loggedIn: true, token: 'tokenDummy' });
  
    const employeeId = 1;
    const updatedData = { role: 'Garçom' };
  
    userService.updateEmployee(employeeId, updatedData).subscribe((response) => {
      expect(response.role).toEqual('service');
    });
  
    const req = httpTestingController.expectOne(`https://burger-queen-api-mock-88v3.vercel.app/users/${employeeId}`);
    expect(req.request.method).toEqual('PATCH');
    expect(req.request.headers.get('Authorization')).toEqual('Bearer tokenDummy');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json');
  
    // Simula uma resposta de sucesso
    req.flush({ role: 'service' });
  });
});
