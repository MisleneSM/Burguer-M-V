import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/authentication.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-administrator',
  templateUrl: './administrator.component.html',
  styleUrls: ['./administrator.component.css','./administrator.component.ptone.css', './administrator.component.pttwo.css', './administrator.component.ptthree.css', './administrator.component.ptfor.css', './administrator.component.ptfive.css', './administrator.component.ptsix.css', './administrator.component.ptseven.css']
})
export class AdministratorComponent implements OnInit {
  employees: any[] = [];
  newEmployee: any = { id: 0, name: '', email: '', password: '', role: 'garçom' };
  isEditing = false;
  employeeToUpdate: any = { id: 0, name: '', role: '' };
  products: any[] = [];
  activeTab: string = 'funcionarios';
  newProduct: any = { name: '', price: '', image: '', type: '' };
  isEditingProduct = false;
  productToUpdate: any = { id: 0, name: '', price: '', image: '', type: '' };


  isEmployeesTabActive: boolean = true;  // Variável para controlar a exibição da seção de funcionários

  constructor(private userService: UserService, private authService: AuthService, private productService: ProductService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  logout() {
    this.authService.logout();
  }

  loadEmployees() {
    this.userService.getEmployees().subscribe(
      (employees: any[]) => {
        this.employees = employees;
      },
      (error: any) => {
        console.error('Erro ao carregar funcionários', error);
        this.employees = [];
      }
    );
  }

  addEmployee() {
    this.userService.addEmployee(this.newEmployee).subscribe(
      (response: any) => {
        console.log('Funcionário adicionado com sucesso', response);
        this.loadEmployees();
        this.resetForm();
      },
      (error: any) => {
        console.error('Erro ao adicionar funcionário', error);
      }
    );
  }

  resetForm() {
    this.newEmployee = { name: '', email: '', password: '', role: this.newEmployee.role };
  }

  // deletar funcionário
  deleteEmployee(employeeId: number) {
    if (confirm('Tem certeza que deseja excluir esse funcionário?')) {
      this.userService.deleteEmployee(employeeId).subscribe(
        (response: any) => {
          console.log('Funcionário excluído com sucesso', response);
          this.loadEmployees();
        },
        (error: any) => {
          console.error('Erro ao excluir funcionário', error);
        }
      );
    }
  }

  // editar funcionário
  showUpdateForm(employee: any) {
    this.isEditing = true;
    this.employeeToUpdate = { ...employee };
  }

  // atualizar funcionário
  updateEmployee() {
    if (this.employeeToUpdate.role === 'Cozinheiro') {
      this.employeeToUpdate.role = 'chefe';
    } else if (this.employeeToUpdate.role === 'Garçom') {
      this.employeeToUpdate.role = 'service';
    }

    this.userService.updateEmployee(this.employeeToUpdate.id, this.employeeToUpdate).subscribe(
      (response: any) => {
        console.log('Dados do funcionário atualizados com sucesso', response);
        this.loadEmployees();
        this.cancelUpdate();
      },
      (error: any) => {
        console.error('Erro ao atualizar funcionário', error);
      }
    );
  }

  cancelUpdate() {
    this.isEditing = false;
    this.employeeToUpdate = { id: 0, name: '', role: '' };
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'produtos') {
      this.loadProducts();
      this.isEmployeesTabActive = false;  // Desativa a exibição da seção de funcionários quando a aba "Produtos" estiver ativa
    } else {
      this.isEmployeesTabActive = true;   // Ativa a exibição da seção de funcionários quando qualquer outra aba estiver inativa
    }
  }

  // carregar produtos
  loadProducts() {
    this.productService.getProducts().subscribe(
      (productsResponse: any[]) => {
        console.log('Dados dos produtos recebidos com sucesso:', productsResponse);
  
        // Combine as duas listas de produtos em uma única lista
        this.products = productsResponse.reduce((accumulator, currentList) => {
          return accumulator.concat(currentList);
        }, []);
  
      },
      (error: any) => {
        console.error('Erro ao carregar produtos', error);
      }
    );
  }
  
  addProduct() {
    const newProduct = {
      name: this.newProduct.name,
      price: this.newProduct.price.toString(), // Converter o preço para uma string
      image: this.newProduct.image,
      type: this.newProduct.type
    };
  
    this.productService.addProduct(newProduct).subscribe(
      (response: any) => {
        console.log('Produto adicionado com sucesso', response);
        this.loadProducts();
        this.resetProductForm();
      },
      (error: any) => {
        console.error('Erro ao adicionar produto', error);
      }
    );
  }

  resetProductForm() {
    this.newProduct = { name: '', price: '', image: '', type: '' };
  }

  editProduct(product: any) {
    this.isEditingProduct = true;
    this.productToUpdate = { ...product };
  }

// atualizar produtos
  updateProduct() {
    this.productService.updateProduct(this.productToUpdate.id, this.productToUpdate).subscribe(
      (response: any) => {
        console.log('Produto atualizado com sucesso', response);
        this.loadProducts();
        this.cancelUpdateProduct();
      },
      (error: any) => {
        console.error('Erro ao atualizar produto', error);
      }
    );
  }

  cancelUpdateProduct() {
    this.isEditingProduct = false;
    this.productToUpdate = { id: 0, name: '', price: '', image: '', type: '' };
  }

  deleteProduct(productId: number) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.productService.deleteProduct(productId).subscribe(
        (response: any) => {
          console.log('Produto excluído com sucesso', response);
          this.loadProducts();
        },
        (error: any) => {
          console.error('Erro ao excluir produto', error);
        }
      );
    }
  }
}
