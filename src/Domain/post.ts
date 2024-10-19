// Define Post interface
export interface Post {
    id: number;
    fk_user_id: number;
    content_text: string;
    content_image_path: string;
    visible: boolean;
    created_at: Date;
}
