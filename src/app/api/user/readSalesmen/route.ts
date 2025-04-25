import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateToken } from 'src/app/lib/validateToken';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const user = await validateToken(req);
    const account = await prisma.tenantAccount.findUnique({
      where: { userId: user.id },
    });

    if (!account) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Nađi sve korisnike u tom tenant-u koji su SALESMAN
    const salesmen = await prisma.user.findMany({
      where: {
        tenantAccount: {
          tenantId: account.tenantId,
          role: 'SALESMAN',
        },
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
      },
    });

    return NextResponse.json({ salesmen });
  } catch (error) {
    console.error('Error fetching salesmen:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
