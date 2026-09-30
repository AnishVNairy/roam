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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
