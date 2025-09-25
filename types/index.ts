export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface PostType {
  id: number;
  name: string;
  description: string | null;
}

export interface Post {
  id: number;
  author_id: number;
  post_type_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  author_username?: string;
  post_type_name?: string;
}

export interface Comment {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  created_at: string;
  updated_at: string | null;
  author_username?: string;
}

export interface PostWithComments extends Post {
  comments: Comment[];
}

export interface UserWithPostCount extends User {
  post_count: number;
}

export interface UserWithPostCount extends User {
  post_count: number;
}