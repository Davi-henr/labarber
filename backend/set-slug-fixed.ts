import { prisma } from './src/config/prisma'; 
prisma.barbearia.updateMany({data: {slug: 'la-barber-original'}}).then(() => process.exit(0));
