import 'dotenv/config';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/infrastructure/prisma-client/client';

const USER_COUNT = 25;
const TICKET_COUNT = 1000;
const DEFAULT_PASSWORD = 'Password123!';

const GAME_TYPES = ['Lotería', 'Rifa', 'Sorteo', 'Boleta', 'Juego ocasional'] as const;
const STATUSES = ['Pendiente', 'Ganado', 'Perdido'] as const;

const PLACES = [
  'Tienda La Esquina',
  'Supermercado Éxito',
  'Estación de servicio Texaco',
  'Centro Comercial Santafé',
  'Plaza Minorista',
  'Carrera 70',
  'Mall Vizcaya',
  'Tienda de barrio',
  'Casino del Parque',
  'Por internet',
];

const LOTTERY_TITLES = [
  'Lotería de Medellín',
  'Lotería de Bogotá',
  'Lotería del Valle',
  'Baloto',
  'Lotería de Boyacá',
  'Mi Lotería',
  'Lotería de la Cruz Roja',
  'Chontico Día',
  'Súper Astro',
  'Pijao',
];

const titleFor = (gameType: string): string => {
  if (gameType === 'Lotería') return faker.helpers.arrayElement(LOTTERY_TITLES);
  if (gameType === 'Rifa') return `Rifa ${faker.commerce.productName()}`;
  if (gameType === 'Sorteo') return `Sorteo ${faker.company.name()}`;
  if (gameType === 'Boleta') return `Boleta ${faker.music.genre()} ${faker.location.city()}`;
  return `Juego ocasional ${faker.word.adjective()}`;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');
  faker.seed(42);

  // console.log('🧹 Limpiando datos previos (tickets + users)...');
  // await prisma.ticket.deleteMany();
  // await prisma.user.deleteMany();

  console.log(`🔐 Hasheando contraseña por defecto ("${DEFAULT_PASSWORD}")...`);
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  console.log(`👥 Creando ${USER_COUNT} usuarios (1 admin + ${USER_COUNT - 1} users)...`);

  const usersData: Array<{
    name: string;
    email: string;
    passwordHash: string;
    role: string;
  }> = [
    {
      name: 'Admin Principal',
      email: 'admin@miboleta.com',
      passwordHash,
      role: 'admin',
    },
    {
      name: 'Demo Estudiante',
      email: 'demo@miboleta.com',
      passwordHash,
      role: 'user',
    },
  ];

  for (let i = 0; i < USER_COUNT - 2; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    usersData.push({
      name: `${firstName} ${lastName}`,
      email: faker.internet
        .email({ firstName, lastName, provider: 'miboleta.test' })
        .toLowerCase(),
      passwordHash,
      role: 'user',
    });
  }

  await prisma.user.createMany({ data: usersData });
  const users = await prisma.user.findMany({ select: { id: true } });
  console.log(`   ✓ ${users.length} usuarios creados`);

  console.log(`🎟️  Creando ${TICKET_COUNT} tickets...`);

  const ticketsData: Array<{
    userId: string;
    title: string;
    gameType: string;
    gameNumber: string | null;
    gameDate: Date;
    amount: number | null;
    place: string | null;
    status: string;
    notes: string | null;
  }> = [];

  for (let i = 0; i < TICKET_COUNT; i++) {
    const owner = users[i % users.length];
    const gameType = faker.helpers.arrayElement(GAME_TYPES);
    const status = faker.helpers.weightedArrayElement([
      { value: 'Pendiente', weight: 5 },
      { value: 'Perdido', weight: 3 },
      { value: 'Ganado', weight: 2 },
    ]);

    const isFuture = status === 'Pendiente' && faker.datatype.boolean({ probability: 0.6 });
    const gameDate = isFuture
      ? faker.date.between({ from: new Date(), to: faker.date.future({ years: 1 }) })
      : faker.date.between({
          from: faker.date.past({ years: 2 }),
          to: new Date(),
        });

    ticketsData.push({
      userId: owner.id,
      title: titleFor(gameType),
      gameType,
      gameNumber: faker.datatype.boolean({ probability: 0.75 })
        ? faker.string.numeric({ length: { min: 3, max: 6 } })
        : null,
      gameDate,
      amount: faker.datatype.boolean({ probability: 0.8 })
        ? Number(
            faker.number
              .float({ min: 1000, max: 500000, fractionDigits: 2 })
              .toFixed(2)
          )
        : null,
      place: faker.datatype.boolean({ probability: 0.9 })
        ? faker.helpers.arrayElement(PLACES)
        : null,
      status,
      notes: faker.datatype.boolean({ probability: 0.4 })
        ? faker.lorem.sentence({ min: 5, max: 15 })
        : null,
    });
  }

  const BATCH_SIZE = 200;
  for (let i = 0; i < ticketsData.length; i += BATCH_SIZE) {
    const batch = ticketsData.slice(i, i + BATCH_SIZE);
    await prisma.ticket.createMany({ data: batch });
    console.log(`   · ${Math.min(i + BATCH_SIZE, ticketsData.length)} / ${ticketsData.length}`);
  }

  const totalTickets = await prisma.ticket.count();
  console.log(`   ✓ ${totalTickets} tickets creados`);

  console.log('');
  console.log('✅ Seed completado');
  console.log('───────────────────────────────────────────');
  console.log('Credenciales de prueba:');
  console.log(`  Admin → admin@miboleta.com / ${DEFAULT_PASSWORD}`);
  console.log(`  User  → demo@miboleta.com  / ${DEFAULT_PASSWORD}`);
  console.log('───────────────────────────────────────────');
}

main()
  .catch((err) => {
    console.error('❌ Seed falló:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
