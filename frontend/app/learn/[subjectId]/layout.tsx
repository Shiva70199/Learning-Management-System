import { LearnShell } from "@/components/learn/LearnShell";

export default function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { subjectId: string };
}) {
  return <LearnShell subjectId={params.subjectId}>{children}</LearnShell>;
}
