// Define Comment interface
export interface Comment {
    id: number;
    fk_user_id: number;
    fk_post_id: number;
    content_text: string;
    created_at: Date;
}
