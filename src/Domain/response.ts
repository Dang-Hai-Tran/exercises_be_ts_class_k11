export interface IResponse {
    message: string
    status: 'success' | 'error'
    code: number
    data?: any
}

export class Response implements IResponse {
    constructor(public message: string, public status: 'success' | 'error', public code: number, public data?: any) {}
}
