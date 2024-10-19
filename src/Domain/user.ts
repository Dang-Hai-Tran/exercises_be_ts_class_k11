// Define User interface
export interface IUser {
    id: number;
    username: string;
    password: string;
    salt: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: Date;
}

export class User implements IUser {
    constructor(
        public id: number,
        public username: string,
        public password: string,
        public salt: string,
        public first_name: string,
        public last_name: string,
        public email: string,
        public created_at: Date
    ) {}
    static isValidRegisterRequest(user: any): user is IUser {
        return (
            typeof user.username === 'string' &&
            typeof user.password === 'string' &&
            typeof user.first_name === 'string' &&
            typeof user.last_name === 'string' &&
            typeof user.email === 'string'
        );
    }
}
