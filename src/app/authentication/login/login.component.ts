import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = false;

  constructor(public authservice: AuthService) {}

  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.isLoading = true;
    console.log('Login Form Values:', form.value);

    // Call the loginUser function from AuthService
    this.authservice.loginUser(form.value.email, form.value.password);

    // Simulate login delay (optional)
    setTimeout(() => {
      this.isLoading = false;
      // Example logic: redirect, show message, etc.
    }, 2000);
  }
}
