import bcrypt from 'bcryptjs';

async function verify() {
  const hash = '$2b$08$9MHb/TjydY7qGcdVtD8tEOgB9S41egih4v0OzNADlkMWZMkkORB.S';
  const match = await bcrypt.compare('Davi01042002.', hash);
  console.log('Match:', match);
}
verify();
