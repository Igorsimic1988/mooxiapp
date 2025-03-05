// import { PrismaAdapter } from '@auth/prisma-adapter';
// import NextAuth from 'next-auth';
// import type { Adapter } from 'next-auth/adapters';
// import  EmailProvider  from 'next-auth/providers/email';

// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// export const authOptions = {
//   adapter: PrismaAdapter(prisma) as Adapter,
//   providers: [
//     EmailProvider({
//       server: {
//         host: process.env.EMAIL_SERVER,
//         port: Number(process.env.EMAIL_PORT),
//         auth: {
//           user: process.env.EMAIL_USERNAME,
//           pass: process.env.EMAIL_PASSWORD,
//         },
//       },
//       from: process.env.EMAIL_FROM,
//     }),
//   ],
//   callbacks: {
//     async session({ session, token }) {
//       if (session.user){
//         session.user.email = token.email;
//       }
//       return session;
//     },
//     async jwt({token}){
//       return token;
//     }
//   },
//   session: {
//     strategy: "jwt",
//   }
// };

import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions, type Session } from "next-auth"
import { JWT } from "next-auth/jwt";
import type { Adapter } from "next-auth/adapters";
import EmailProvider from "next-auth/providers/email";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
    async jwt({ token }: { token: JWT }) {
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, 

};

