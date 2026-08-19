import { prisma } from './src/config/prisma';
import { hash } from 'bcryptjs';



async function main() {
  console.log('Criando Super Admin...');
  const superAdminPassword = await hash('master123', 8);
  await prisma.superAdmin.upsert({
    where: { email: 'master@labarber.com.br' },
    update: {},
    create: {
      email: 'master@labarber.com.br',
      senha_hash: superAdminPassword,
    },
  });

  console.log('Criando Barbearia Teste...');
  const barbearia = await prisma.barbearia.create({
    data: {
      nome: 'La Barber Original',
    },
  });

  console.log('Criando admin da barbearia...');
  const adminPassword = await hash('admin', 8);
  await prisma.usuario.create({
    data: {
      nome: 'Admin',
      login: 'admin',
      senha_hash: adminPassword,
      role: 'ADMIN',
      barbearia_id: barbearia.id,
      permissoes: {
        dashboard: true,
        agenda: true,
        clientes: true,
        servicos: true,
        equipe: true,
        escala: true,
        configuracoes: true,
        portfolio: true,
      }
    },
  });

  console.log('Seed completo!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
