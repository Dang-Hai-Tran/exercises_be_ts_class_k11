// Define Like interface
export interface Like {
    id: number;
    fk_user_id: number;
    fk_post_id: number;
    created_at: Date;
}
