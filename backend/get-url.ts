import { prisma } from './src/config/prisma'; 
prisma.barbearia.findFirst().then(b => { 
  if (b) {
    console.log('\n\n=== COPIE O LINK ABAIXO ===\n');
    console.log('http://localhost:5173/b/' + b.id); 
    console.log('\n===========================\n\n');
  }
  process.exit(0); 
});
