import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PostService } from '../posts.service';
import { Post } from '../post.model';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../authentication/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  loading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string = '';  // <-- add userId here

  private postsSub: Subscription | undefined;
  private authStatusSub: Subscription | undefined;

  constructor(
    public postsService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);

    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe({
        next: (postData: { posts: Post[]; postCount: number }) => {
          this.loading = false;
          this.posts = postData.posts;
          this.totalPosts = postData.postCount;
        },
        error: (err) => {
          this.loading = false;
          console.error('Error fetching posts:', err);
        }
      });

    this.userIsAuthenticated = this.authService.getIsAuth();
    this.userId = this.authService.getUserId();  // <-- set initial userId

    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe((isAuthenticated: boolean) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();  // <-- update userId on auth change
      });
  }

  onPageChange(event: PageEvent) {
    this.loading = true;
    this.postsPerPage = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.loading = true;
    this.postsService.deletePost(postId).subscribe({
      next: () => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error deleting post:', err);
      }
    });
  }

  ngOnDestroy() {
    if (this.postsSub) {
      this.postsSub.unsubscribe();
    }
    if (this.authStatusSub) {
      this.authStatusSub.unsubscribe();
    }
  }
}
