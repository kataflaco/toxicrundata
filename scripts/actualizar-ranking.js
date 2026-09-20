const fs = require("fs");

// 🔑 Credenciales de Supabase (misma publishable key que usás en Unity)
const SUPABASE_URL = "https://atkreaarnqsuzdcaxxry.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0a3JlYWFybnFzdXpkY2F4eHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MzQ0NjMsImV4cCI6MjEwNTQxMDQ2M30.O2zZYa1iggJF4UvbzupruSU9fBeRMEpiOlPaZcYMFU0";

async function actualizarRanking() {
  console.log("Consultando Supabase - tabla 'jugadores'...");

  const url = `${SUPABASE_URL}/rest/v1/jugadores?select=uid,nombre,nivel_maximo&order=nivel_maximo.desc&limit=100`;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase respondió ${res.status}: ${body}`);
  }

  const filas = await res.json();

  const jugadores = filas.map((fila) => ({
    name: fila.nombre || "Piloto_Toxic",
    maxLevel: fila.nivel_maximo || 0,
    id: fila.uid,
  }));

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
