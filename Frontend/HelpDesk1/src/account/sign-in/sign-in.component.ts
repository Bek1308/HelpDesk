import { Component, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import { Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ThemeService } from '../theme/theme.service';
import { FeatherIconService } from '../icon-service/feather-icon.service';



@Injectable({ providedIn: 'root' })
export class AuthService {
  login(data: LoginRequest): void {
    console.log('Login data:', data);
    // You can call HTTP API here in real use case
  }
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}


@Component({
  selector: 'app-sing-in',
  imports: [FormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements AfterViewInit {
  formData: LoginRequest = {
    email: '',
    password: '',
    rememberMe: true
  };
  isLoading = false;
  showPassword = false;
  hasTextPasword = false;
  errorMessage = true;
  errorMessageText = "Salom Qalaysizlar ";


  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private featherIconService: FeatherIconService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();

  }

  onSubmit(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.authService.login(this.formData);
      this.isLoading = false;

     
    }, 1000);
  }
  checkPasswordText( value: string) {
    if (this.formData.password && this.formData.password.trim().length > 0) {
      this.hasTextPasword = true;
    } 
    else if (this.formData.password && this.formData.password.trim().length == 0) {
      this.hasTextPasword = false;
    } 
    else {
      this.hasTextPasword = false;
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  togglePasswordVisibility(): void {
      this.showPassword = !this.showPassword;
  }
  toggleErrorMessage(){
    this.errorMessage = false
  }
}