export interface IUserFollower {
    id: number;
    fk_user_id: number;
    fk_follower_id: number;
    created_at: Date;
}

export class UserFollower implements IUserFollower {
    constructor(
        public id: number,
        public fk_user_id: number,
        public fk_follower_id: number,
        public created_at: Date
    ) {}
    static isValidUserFollowerRequest(userFollower: any): userFollower is IUserFollower {
        return (
            typeof userFollower.fk_user_id === 'number' &&
            typeof userFollower.fk_follower_id === 'number'
        );
    }
}
