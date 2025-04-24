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

    const brands = await prisma.brand.findMany({
      where: { tenantId: account.tenantId },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
