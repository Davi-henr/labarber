import { prisma } from '../../config/prisma';
import { hash } from 'bcryptjs';

async function main() {
  const email = 'davi@labarber.com';
  const senha = 'Master@2026';

  const superAdminExists = await prisma.superAdmin.findUnique({
    where: { email },
  });

  if (!superAdminExists) {
    const senha_hash = await hash(senha, 8);

    await prisma.superAdmin.create({
      data: {
        email,
        senha_hash,
      },
    });

    console.log(`Super Admin ${email} created successfully.`);
  } else {
    console.log(`Super Admin ${email} already exists.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
