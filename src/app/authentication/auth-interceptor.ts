import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';

import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Get token from AuthService
    const authToken = this.authService.getToken();

    // Clone the request and set Authorization header
    const authRequest = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + authToken)
    });

    // Handle request and catch errors
    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Log error for debugging
        console.error('HTTP Error:', error);

        // Show alert with backend error message if available
        if (error.error && error.error.message) {
          alert(error.error.message);
        } else {
          alert('An unknown error occurred!');
        }

        // Pass the error along so other handlers can act on it
        return throwError(error);
      })
    );
  }
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private dialog: MatDialog) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // For now just pass through, you can add error handling with MatDialog here
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Example: you can open a dialog on error
        // this.dialog.open(ErrorDialogComponent, { data: error });

        // Or simply log and rethrow
        console.error('ErrorInterceptor caught:', error);
        return throwError(error);
      })
    );
  }
}
