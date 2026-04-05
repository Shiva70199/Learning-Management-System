import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/error.middleware.js";

export async function enrollUser(userId: string, subjectId: string) {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) throw new AppError(404, "Subject not found");
  await prisma.enrollment.upsert({
    where: { userId_subjectId: { userId, subjectId } },
    create: { userId, subjectId },
    update: {},
  });
  return { subjectId, enrolled: true };
}

export async function listEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    select: { subjectId: true, createdAt: true },
  });
}
