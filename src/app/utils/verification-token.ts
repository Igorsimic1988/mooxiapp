import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();


export const getVerificationTokenByEmail = async (email: string) => {
    const verificationToken = await prisma.verificationToken.findFirst({
        where:{
            email
        }
    })
    return verificationToken;
}