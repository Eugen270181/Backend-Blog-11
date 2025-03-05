import bcrypt from 'bcrypt'

export const hashServices = {
    async getHash(password:string, saltRounds?:number){
        const saltRound=saltRounds?saltRounds:10
        return bcrypt.hash(password,saltRound)
    },
    async checkHash(password:string, hash:string){
        return  bcrypt.compare(password,hash)
    },
}