// src/app/posts/post.model.ts
export interface Post {
  id: string;
  title: string;
  content: string;
  imagePath: string;
  creator?: string; // 👈 Optional if not always used
}
