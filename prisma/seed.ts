import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tickets = [
  {
    title: "Ticket 1",
    content: "First ticket from DB.",
    status: "CONCLUÍDO" as const,
    deadline: new Date().toISOString().split("T")[0],
  },
  {
    title: "Ticket 2",
    content: "Second ticket from DB.",
    status: "ABERTO" as const,
    deadline: new Date().toISOString().split("T")[0],
  },
  {
    title: "Ticket 3",
    content: "Third ticket from DB.",
    status: "EM_ANDAMENTO" as const,
    deadline: new Date().toISOString().split("T")[0],
  },
];

const seed = async () => {
  const t0 = performance.now();
  console.log("DB Seed: Started ...");

  await prisma.ticket.deleteMany();

  await prisma.ticket.createMany({
    data: tickets,
  });

  const t1 = performance.now();
  console.log(`DB Seed: Finished (${t1 - t0}ms)`);
};

seed();
