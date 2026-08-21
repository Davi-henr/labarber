import { prisma } from './src/config/prisma';
prisma.superAdmin.findMany().then(console.log).finally(() => process.exit(0));
