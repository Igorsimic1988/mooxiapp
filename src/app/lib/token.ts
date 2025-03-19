import { v4 as uuidv4 } from "uuid";
import { PrismaClient, Role } from '@prisma/client'
import { getVerificationTokenByEmail } from "../utils/verification-token";


const prisma = new PrismaClient();

export const generateVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 2 * 60 * 60 * 1000); // 2h, pitati je li to ok
  
    const existingToken = await getVerificationTokenByEmail(email);
  
    if (existingToken) {
      await prisma.verificationToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }
  
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: "email-verification",
        email,
        token,
        expires,
      },
    });
  
    return verificationToken;
  };

  export const generateResetToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user){
      throw new Error("User with this email does not exist");
    }
    await prisma.verificationToken.deleteMany({
      where: {
        email,
        identifier: { in: ["password-reset", "email-verification"] },
      },
    });
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: "password-reset",
        email,
        token,
        expires,
      },
    });
  
    return verificationToken;

  }

  export const generateInvitationToken = async (email: string, tenantId: string, role: Role) => {
    const token = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);//24h

    const existingInvitation = await prisma.invitation.findUnique({
      where: { 
        email
      },
    });

    if (existingInvitation){
      await prisma.invitation.delete({
        where: {
          email,
        },
      });
    }

    const invitation = await prisma.invitation.create({
      data: {
        email,
        tenantId,
        role,
        token,
        expiresAt: expires,
      }
    });
    return invitation;
  }