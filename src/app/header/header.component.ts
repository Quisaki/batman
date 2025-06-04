import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../authentication/auth.service';  // ✅ Adjust path if needed

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']  // ✅ Ensure this file exists or remove it if not used
})
export class HeaderComponent implements OnInit, OnDestroy {
  public userIsAuthenticated = false;
  private authListenerSubs!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // ✅ Get initial auth state (e.g., if user is already logged in from previous session)
    this.userIsAuthenticated = this.authService.getIsAuth();

    // ✅ Subscribe to auth status changes (e.g., after login/logout)
    this.authListenerSubs = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  onLogout() {
    // ✅ Triggers logout method in AuthService
    this.authService.logout();
  }

  ngOnDestroy() {
    // ✅ Prevent memory leaks by unsubscribing
    this.authListenerSubs.unsubscribe();
  }
}
