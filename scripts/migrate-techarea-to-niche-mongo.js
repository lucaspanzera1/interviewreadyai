// Script MongoDB para migração de techArea para niche
// Execute com: mongosh "mongodb://appuser:apppass@127.0.0.1:27017/treinavagaai?authSource=treinavagaai" --file migrate-techarea-to-niche.js

print("Iniciando migração: techArea -> niche");

// Encontrar usuários com techArea que não têm niche
const usersToMigrate = db.users.find({
  techArea: { $exists: true },
  niche: { $exists: false }
}).toArray();

print(`Encontrados ${usersToMigrate.length} usuários para migrar`);

// Migrar cada usuário
usersToMigrate.forEach(user => {
  db.users.updateOne(
    { _id: user._id },
    {
      $set: { niche: user.techArea },
      $unset: { techArea: "" }
    }
  );
  print(`Migrado usuário: ${user.name} (${user._id})`);
});

print("Migração concluída");

// Verificar se ainda há usuários com techArea
const remaining = db.users.countDocuments({ techArea: { $exists: true } });
print(`Usuários restantes com techArea: ${remaining}`);