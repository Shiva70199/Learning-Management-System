import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** YouTube IDs aligned with lesson titles (educational, on-topic). */
async function main() {
  const subject = await prisma.subject.create({
    data: {
      title: "Web Foundations",
      description: "HTML, CSS, and JavaScript essentials.",
      sections: {
        create: [
          {
            title: "Getting started",
            order: 0,
            videos: {
              create: [
                {
                  title: "HTML in 100 seconds",
                  description: "Quick mental model of HTML tags and structure (Fireship).",
                  youtubeUrl: "https://www.youtube.com/watch?v=okpls3VIY2Y",
                  order: 0,
                  durationSeconds: 145,
                },
                {
                  title: "VS Code for beginners",
                  description: "Install VS Code, extensions, and a productive setup (Traversy Media).",
                  youtubeUrl: "https://www.youtube.com/watch?v=VqCgcpAypFQ",
                  order: 1,
                  durationSeconds: 810,
                },
              ],
            },
          },
          {
            title: "Core concepts",
            order: 1,
            videos: {
              create: [
                {
                  title: "How does the Internet work?",
                  description: "IP, DNS, HTTP — how data reaches your browser (freeCodeCamp).",
                  youtubeUrl: "https://www.youtube.com/watch?v=7_LPdttKXPg",
                  order: 0,
                  durationSeconds: 480,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.subject.create({
    data: {
      title: "React Patterns",
      description: "Components, hooks, and data flow.",
      sections: {
        create: {
          title: "Introduction",
          order: 0,
          videos: {
            create: {
              title: "Learn React with Mosh — introduction",
              description: "First steps with React: components, JSX, and project structure.",
              youtubeUrl: "https://www.youtube.com/watch?v=SqcY0ogQZKY",
              order: 0,
              durationSeconds: 720,
            },
          },
        },
      },
    },
  });

  console.log("Seeded subjects, first id:", subject.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
