import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthData } from './auth-data.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string = '';
  private userId: string = '';                // <-- userId variable
  private isAuthenticated = false;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer: any;
  private expiresInDuration: number = 0;

  constructor(private http: HttpClient, private router: Router) {}

  CreateUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http
      .post('http://localhost:3000/api/user/signup', authData)
      .subscribe(response => {
        console.log(response);
      });
  }

  loginUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        'http://localhost:3000/api/user/login',
        authData
      )
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        this.userId = response.userId;       // <-- set userId here

        if (token) {
          this.expiresInDuration = response.expiresIn;  // seconds from backend
          this.setAuthTimer(this.expiresInDuration);

          const now = new Date();
          const expirationDate = new Date(now.getTime() + this.expiresInDuration * 1000);

          this.saveAuthData(token, expirationDate, this.userId);  // <-- pass userId here

          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          this.router.navigate(['/']);  // Redirect after successful login
        }

        console.log('Token received:', this.token);
        console.log('UserId received:', this.userId);   // Optional debug log
      });
  }

  getUserId() {
    return this.userId;    // <-- return the saved userId
  }

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  logout() {
    this.token = '';
    this.userId = '';              // <-- clear userId on logout
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresInDuration = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresInDuration > 0) {
      this.token = authInformation.token;
      this.userId = authInformation.userId;      // <-- set userId here
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
      this.setAuthTimer(expiresInDuration / 1000);
    }
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer for: ' + duration + ' seconds');
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);   // <-- save userId here
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');        // <-- clear userId here
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');  // <-- get userId

    if (!token || !expirationDate || !userId) {     // also check userId
      return null;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    };
  }
}
