import { NextResponse } from "next/server";
import { generateInvitationToken } from "src/app/lib/token";
import { sendInvitationLink } from "src/app/lib/resend";
import { validateToken } from "src/app/lib/validateToken";
import { PrismaClient} from '@prisma/client'
//sta je redis, in memori baza podataka, orm, kesiranje, mikroservisi
//kako je najbolje cuvati, struktuisati bazu
//taktike kesiranja
//kesiranje van i unutar baze

const prisma = new PrismaClient();
export async function POST (req: Request) {
    try{
        const user = await validateToken(req);
        const { email, tenantId, role } = await req.json();
          const ownerAccount = await prisma.tenantAccount.findFirst({
            where: {
              userId: user.id,
              tenantId: tenantId,
              role: "OWNER",
            },
          });
      
          if (!ownerAccount) {
            return NextResponse.json({ error: "Only OWNERS can send invites for this tenant" }, { status: 403 });
          }
        const invitation = await generateInvitationToken(email, tenantId, role);

        await sendInvitationLink(email, invitation.token, tenantId);
        return NextResponse.json({ message: "Invitation sent successfully" }, { status: 201 });
    }catch(error) {
        console.log(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}