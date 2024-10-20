// Define Post interface
export interface IPost {
    id: number;
    fk_user_id: number;
    content_text: string;
    content_image_path?: string;
    visible: boolean;
    created_at: Date;
}

export class Post implements IPost {
    constructor(
        public id: number,
        public fk_user_id: number,
        public content_text: string,
        public visible: boolean,
        public created_at: Date,
        public content_image_path?: string,
    ) {}
    static isValidPostRequest(post: any): post is IPost {
        return (
            typeof post.content_text === 'string' &&
            (typeof post.content_image_path === 'undefined' || typeof post.content_image_path === 'string') &&
            typeof post.visible === 'boolean'
        );
    }
}
