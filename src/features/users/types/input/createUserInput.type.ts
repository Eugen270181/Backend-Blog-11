export type CreateUserInputModel = {
    login: string //min 3 max 10 pattern ^[a-zA-Z0-9_-]*$
    password: string // min 6 max 20
    email: string // pattern: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$
}