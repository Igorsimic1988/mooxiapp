import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export const getUserByEmail = async (email: string ) => {
    try{
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });
        return user;
    }catch (error){
        console.log(error)
        return null;
    }
}