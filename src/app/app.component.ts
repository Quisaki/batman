import { Component, OnInit } from '@angular/core';
import { Post } from './posts/post.model';
import { AuthService } from './authentication/auth.service';  // adjust path as necessary

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  storedPosts: Post[] = [];  // 👈 Make sure the variable is named exactly this

  constructor(private authservice: AuthService) {}

  ngOnInit() {
    this.authservice.autoAuthUser();  // Call automatic authentication on app load
  }
}
