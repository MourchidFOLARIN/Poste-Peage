const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // 1. Créer ou mettre à jour un poste de péage de test
  const tollGate = await prisma.tollGate.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      name: 'Péage Principal - Poste 1',
      location: 'Cotonou - Route Nationale',
      status: 'ACTIVE'
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Péage Principal - Poste 1',
      location: 'Cotonou - Route Nationale',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Poste de péage créé/mis à jour :', tollGate.name);

  // 2. Créer ou mettre à jour un utilisateur de test
  const user = await prisma.user.upsert({
    where: { email: 'jean.dupont@example.com' },
    update: {
      name: 'Jean Dupont',
      phone: '+22997000000'
    },
    create: {
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      phone: '+22997000000',
      role: 'USER'
    }
  });

  console.log('✅ Utilisateur de test créé/mis à jour :', user.name, `(${user.email})`);

  // 2b. Créer l'administrateur du péage
  const admin = await prisma.user.upsert({
    where: { email: 'admin@peage.bj' },
    update: {
      role: 'ADMIN'
    },
    create: {
      name: 'Gestionnaire Admin',
      email: 'admin@peage.bj',
      phone: '+22990000000',
      role: 'ADMIN'
    }
  });

  console.log('✅ Compte Administrateur créé/mis à jour :', admin.name, `(${admin.email})`);

  // 3. Créer ou mettre à jour une carte RFID associée
  const cardUid = 'A1B2C3D4'; // UID RFID de démonstration
  const card = await prisma.card.upsert({
    where: { uid: cardUid },
    update: {
      balance: 5000.0,
      status: 'ACTIVE',
      userId: user.id
    },
    create: {
      uid: cardUid,
      balance: 5000.0,
      status: 'ACTIVE',
      userId: user.id
    }
  });

  console.log('✅ Carte RFID créée/mise à jour :', card.uid, `| Solde: ${card.balance} FCFA`);

  // 4. Créer une transaction d'exemple
  const sampleTransaction = await prisma.transaction.create({
    data: {
      cardUid: card.uid,
      userName: user.name,
      amount: 500.0,
      status: 'AUTHORIZED',
      tollGateId: tollGate.id
    }
  });

  console.log('✅ Transaction d\'exemple enregistrée (ID:', sampleTransaction.id, ')');

  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
