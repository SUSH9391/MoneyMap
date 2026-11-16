export class AppError extends Error {
    constructor(
        message:string,
        public statusCode: number = 500
    ){
        super(message);
        this.name = "AppError";// server side error
    }
}
//all of these below are client side error
export class NotFoundError extends AppError{
    constructor(
        message: string = 'Resource not found'
    ){
        super(message,404);
    }
}

export class ValidationError extends AppError{
    constructor(
        message: string,
        public details?: any //any datatype
    )
    {
        super(message,400);//client side error
    }
}

export class UnauthorizedError extends AppError{
    constructor(
        message: string = 'Unauthorized' //not logged in
    ){
        super(message,401);
    }
}

export class ConflictError extends AppError{
    constructor(
        message:string
    ){
        super(message,409);
    }
}

export class ForbiddenError extends AppError{
    constructor(
        message:string = 'Forbidden'
    )
    {
        super(message,403)
    }
}
