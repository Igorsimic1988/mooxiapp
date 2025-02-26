import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import type { Adapter } from 'next-auth/adapters';

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [],
  callbacks: {
    async session({ session, user }) {
      if (!session.user) return session;

      session.user.id = user.id;

      return session;
    },
  },
  events: {},
});
