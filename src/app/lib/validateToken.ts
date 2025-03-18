import jwt from "jsonwebtoken";
import { PrismaClient} from '@prisma/client'


const prisma = new PrismaClient();

export async function validateToken(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { email: string };
    if (!decoded.email) {
        throw new Error("Invalid token");
      }
        const user = await prisma.user.findUnique({
        where: { email: decoded.email },
        include: {
            tenantAccount: true,
        },
      });
  
      if (!user) {
        throw new Error("User not found");
      }
  
    return user; 
  } catch (error) {
    console.log(error)
    throw new Error("Invalid or expired token");
  }
}
