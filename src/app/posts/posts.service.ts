// src/app/posts/post.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Post } from './post.model';
import { AuthService } from '../authentication/auth.service';

@Injectable({ providedIn: 'root' })
export class PostService {
  private posts: Post[] = [];
  private postUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  // Helper: add Authorization header with Bearer token
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: 'Bearer ' + token });
  }

  // Fetch posts with pagination
  getPosts(postsPerPage: number, currentPage: number): void {
    const queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.http
      .get<{ message: string; posts: any[]; maxPosts: number }>(
        'http://localhost:3000/api/posts' + queryParams
      )
      .pipe(
        map(postData => {
          // Map _id and creator from backend to frontend model
          const transformedPosts: Post[] = postData.posts.map(post => ({
            id: post._id,
            title: post.title,
            content: post.content,
            imagePath: post.imagePath,
            creator: post.creator  // backend sets this from req.userData.userId
          }));
          return {
            posts: transformedPosts,
            maxPosts: postData.maxPosts,
          };
        })
      )
      .subscribe({
        next: ({ posts, maxPosts }) => {
          this.posts = posts;
          this.postUpdated.next({ posts: [...this.posts], postCount: maxPosts });
        },
        error: err => {
          console.error('Failed to fetch posts', err);
        },
      });
  }

  // Observable to listen to post updates
  getPostUpdateListener(): Observable<{ posts: Post[]; postCount: number }> {
    return this.postUpdated.asObservable();
  }

  // Get single post by ID
  getPost(id: string): Observable<{ _id: string; title: string; content: string; imagePath: string; creator: string }> {
    return this.http.get<{ _id: string; title: string; content: string; imagePath: string; creator: string }>(
      `http://localhost:3000/api/posts/${id}`
    );
  }

  // Add a new post (creator is NOT set here, backend sets it based on token)
  addPost(title: string, content: string, image: File): void {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http
      .post<{ message: string; post: any }>(
        'http://localhost:3000/api/posts',
        postData,
        { headers: this.getAuthHeaders() }
      )
      .subscribe({
        next: response => {
          const post: Post = {
            id: response.post._id,
            title: response.post.title,
            content: response.post.content,
            imagePath: response.post.imagePath,
            creator: response.post.creator  // backend returns creator
          };
          this.posts.push(post);
          this.postUpdated.next({
            posts: [...this.posts],
            postCount: this.posts.length,
          });
          this.router.navigate(['/']);
        },
        error: err => {
          console.error('Failed to add post', err);
        },
      });
  }

  // Update existing post (creator NOT set here, backend uses user info from token)
  updatePost(id: string, title: string, content: string, image: File | string): void {
    let postData: FormData | Post;

    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      // No creator field sent here! Backend will keep creator intact
      postData = { id, title, content, imagePath: image };
    }

    this.http
      .put<{ imagePath: string }>(
        `http://localhost:3000/api/posts/${id}`,
        postData,
        { headers: this.getAuthHeaders() }
      )
      .subscribe({
        next: response => {
          const updatedPosts = [...this.posts];
          const index = updatedPosts.findIndex(p => p.id === id);
          if (index >= 0) {
            const updatedPost: Post = {
              id,
              title,
              content,
              imagePath: response.imagePath,
              creator: this.posts[index].creator // preserve creator on frontend
            };
            updatedPosts[index] = updatedPost;
            this.posts = updatedPosts;
            this.postUpdated.next({
              posts: [...this.posts],
              postCount: this.posts.length,
            });
          }
          this.router.navigate(['/']);
        },
        error: err => {
          console.error('Failed to update post', err);
        },
      });
  }

  // Delete a post by ID with auth header
  deletePost(postId: string): Observable<any> {
    return this.http.delete(
      `http://localhost:3000/api/posts/${postId}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
