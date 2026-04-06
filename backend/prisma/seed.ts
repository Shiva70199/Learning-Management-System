import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Educational YouTube URLs aligned with titles. */
async function main() {
  await prisma.subject.create({
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

  await prisma.subject.create({
    data: {
      title: "Python Foundations",
      description: "Syntax, types, and your first scripts.",
      sections: {
        create: {
          title: "Start here",
          order: 0,
          videos: {
            create: {
              title: "Python in 100 seconds",
              description: "Ultra-fast overview of Python (Fireship).",
              youtubeUrl: "https://www.youtube.com/watch?v=HXV3zeQGqfc",
              order: 0,
              durationSeconds: 130,
            },
          },
        },
      },
    },
  });

  await prisma.subject.create({
    data: {
      title: "Git & version control",
      description: "Commits, branches, and collaboration basics.",
      sections: {
        create: {
          title: "Basics",
          order: 0,
          videos: {
            create: {
              title: "Git in 100 seconds",
              description: "What Git is and the core commands (Fireship).",
              youtubeUrl: "https://www.youtube.com/watch?v=hwP7WQkmECE",
              order: 0,
              durationSeconds: 120,
            },
          },
        },
      },
    },
  });

  await prisma.subject.create({
    data: {
      title: "SQL & databases",
      description: "Tables, queries, and relational thinking.",
      sections: {
        create: {
          title: "Introduction",
          order: 0,
          videos: {
            create: {
              title: "SQL basics in 8 minutes",
              description: "SELECT, INSERT, and relational tables (Programming with Mosh).",
              youtubeUrl: "https://www.youtube.com/watch?v=zpnHsWOt0-H",
              order: 0,
              durationSeconds: 480,
            },
          },
        },
      },
    },
  });

  await prisma.subject.create({
    data: {
      title: "Containers & Docker",
      description: "Package apps so they run the same everywhere.",
      sections: {
        create: {
          title: "Overview",
          order: 0,
          videos: {
            create: {
              title: "Docker in 100 seconds",
              description: "Images, containers, and why Docker matters (Fireship).",
              youtubeUrl: "https://www.youtube.com/watch?v=rOTqprHv1Cc",
              order: 0,
              durationSeconds: 120,
            },
          },
        },
      },
    },
  });

  const count = await prisma.subject.count();
  console.log("Seeded subjects. Total:", count);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
