const admin = require("firebase-admin");
const fs = require("fs");

// Lee la credencial desde la variable de entorno (inyectada por el workflow)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function actualizarRanking() {
  console.log("Consultando Firestore - colección 'rankings'...");

  const snapshot = await db
    .collection("rankings")
    .orderBy("maxLevel", "desc")
    .limit(100)
    .get();

  const jugadores = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    jugadores.push({
      name: data.name || "Piloto_Toxic",
      maxLevel: data.maxLevel || 1,
      id: doc.id,
    });
  });

  const archivoRanking = {
    timestampGlobal: new Date().toISOString(),
    jugadores: jugadores,
  };

  fs.writeFileSync("ranking.json", JSON.stringify(archivoRanking, null, 2));
  console.log(`ranking.json actualizado con ${jugadores.length} jugadores.`);
}

actualizarRanking()
  .then(() => {
    console.log("Listo.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error actualizando el ranking:", err);
    process.exit(1);
  });
