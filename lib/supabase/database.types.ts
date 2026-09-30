export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
};

export type Motorcycle = {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  caption: string;
  media_url: string | null;
  created_at: string;
};

export type Like = {
  post_id: string;
  user_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<
        Profile,
        Pick<Profile, "id" | "username" | "display_name"> &
          Partial<Omit<Profile, "id" | "username" | "display_name">>,
        Partial<Omit<Profile, "created_at" | "id">>
      >;
      motorcycles: TableDefinition<
        Motorcycle,
        Pick<Motorcycle, "user_id" | "make" | "model"> &
          Partial<Omit<Motorcycle, "id" | "user_id" | "make" | "model">>,
        Partial<Omit<Motorcycle, "created_at" | "id" | "user_id">>
      >;
      posts: TableDefinition<
        Post,
        Pick<Post, "user_id" | "caption"> & Partial<Pick<Post, "id" | "media_url" | "created_at">>,
        Partial<Pick<Post, "user_id" | "caption" | "media_url">>
      >;
      likes: TableDefinition<
        Like,
        Pick<Like, "post_id" | "user_id"> & Partial<Pick<Like, "created_at">>,
        never
      >;
      comments: TableDefinition<
        Comment,
        Pick<Comment, "post_id" | "user_id" | "content"> & Partial<Pick<Comment, "id" | "created_at">>,
        never
      >;
    };
    Views: {
      post_likes_summary: {
        Row: { post_id: string; like_count: number; liked_by_current_user: boolean };
        Relationships: [];
      };
      post_comment_counts: {
        Row: { post_id: string; comment_count: number };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
