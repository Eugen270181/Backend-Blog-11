export type UserDto = {
    login: string
    email: string
    password: string
}


export const testingDtosCreator = {
    createUserDto({login, email, password}: {
        login?: string, email?: string, password?: string
    }): UserDto {
        return {
            login: login ?? 'test',
            email: email ?? 'test@gmail.com',
            password: password ?? '123456789',

        }
    },
    createUserDtos(count: number): UserDto[] {
        const users = [];

        for (let i = 0; i <= count; i++) {
            users.push({
                login: 'test' + i,
                email: `test${i}@gmail.com`,
                password: '12345678'
            })
        }
        return users;
    },
}