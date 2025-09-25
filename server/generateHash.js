const bcrypt = require('bcryptjs');

async function genererHash() {
  // REMPLACEZ 'VotreMotDePasse123' par votre vrai mot de passe
  const motDePasse = 'passer';
  const hash = await bcrypt.hash(motDePasse, 10);
  console.log('HASH GÉNÉRÉ:');
  console.log(hash);
  console.log('\nCopiez ce hash dans votre requête SQL');
}

genererHash();