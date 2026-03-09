//////////////////// Imports ////////////////////
import { PublicKey } from "@solana/web3.js";

////////////////// Constantes ////////////////////
const NOMBRE_STREAMING = "SolanaMusic";
const owner = pg.wallet.publicKey;

//////////////////// Logs base ////////////////////
console.log("My address:", owner.toBase58());
const balance = await pg.connection.getBalance(owner);
console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

//////////////////// PDA Streaming ////////////////////
// En Rust: seeds = [b"streaming", owner.key().as_ref()]
function pdaStreaming(ownerPk: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("streaming"), ownerPk.toBuffer()],
    pg.PROGRAM_ID
  );
}

//////////////////// Helpers ////////////////////
async function fetchStreaming(pda_streaming: PublicKey) {
  return await pg.program.account.streming.fetch(pda_streaming);
}

function printCanciones(streamingAccount: any) {
  const canciones = streamingAccount.canciones as any[];

  if (!canciones || canciones.length === 0) {
    console.log("No hay canciones en el streaming");
    return;
  }

  console.log(`Canciones (${canciones.length}):`);

  for (let i = 0; i < canciones.length; i++) {
    const c = canciones[i];

    console.log(
      `#${i + 1} -> nombre="${c.nombre}", genero="${c.genero}", artista="${c.artista}", disponible=${c.disponible}`
    );
  }
}

//////////////////// Instrucciones ////////////////////

async function crearStreaming(nombreStreaming: string) {

  const [pda_streaming] = pdaStreaming(owner);

  try {
    const existing = await fetchStreaming(pda_streaming);

    console.log("Streaming ya existe en:", pda_streaming.toBase58());
    console.log("Owner guardado:", existing.owner.toBase58());
    console.log("Nombre guardado:", existing.nombre);

    return;

  } catch (_) {

  }

  const txHash = await pg.program.methods
    .crearStreaming(nombreStreaming)
    .accounts({
      owner: owner,
      streming: pda_streaming,
    })
    .rpc();

  console.log("crearStreaming tx:", txHash);
  console.log("Streaming PDA:", pda_streaming.toBase58());

  const streamingAccount = await fetchStreaming(pda_streaming);

  console.log("Estado inicial:");
  console.log("Owner:", streamingAccount.owner.toBase58());
  console.log("Nombre:", streamingAccount.nombre);

  printCanciones(streamingAccount);
}

async function agregarCancion(nombre: string, genero: string, artista: string) {

  const [pda_streaming] = pdaStreaming(owner);

  const txHash = await pg.program.methods
    .agregarCancion(nombre, genero, artista)
    .accounts({
      owner: owner,
      streaming: pda_streaming,
    })
    .rpc();

  console.log("agregarCancion tx:", txHash);

  const streamingAccount = await fetchStreaming(pda_streaming);

  printCanciones(streamingAccount);
}

async function eliminarCancion(nombre: string) {

  const [pda_streaming] = pdaStreaming(owner);

  const txHash = await pg.program.methods
    .eliminarCancion(nombre)
    .accounts({
      owner: owner,
      streaming: pda_streaming,
    })
    .rpc();

  console.log("eliminarCancion tx:", txHash);

  const streamingAccount = await fetchStreaming(pda_streaming);

  printCanciones(streamingAccount);
}

async function alternarCancion(nombre: string) {

  const [pda_streaming] = pdaStreaming(owner);

  const txHash = await pg.program.methods
    .alternarCancion(nombre)
    .accounts({
      owner: owner,
      streaming: pda_streaming,
    })
    .rpc();

  console.log("alternarCancion tx:", txHash);

  const streamingAccount = await fetchStreaming(pda_streaming);

  printCanciones(streamingAccount);
}

async function verCancionesFetch() {

  const [pda_streaming] = pdaStreaming(owner);

  const streamingAccount = await fetchStreaming(pda_streaming);

  console.log("Streaming PDA:", pda_streaming.toBase58());
  console.log("Owner:", streamingAccount.owner.toBase58());
  console.log("Nombre:", streamingAccount.nombre);

  printCanciones(streamingAccount);
}

//////////////////// Demo runner ////////////////////

await crearStreaming(NOMBRE_STREAMING);

await agregarCancion("Believer", "Rock", "Imagine Dragons");
await agregarCancion("Starboy", "Pop", "The Weeknd");

await alternarCancion("Starboy");

await eliminarCancion("Believer");

await verCancionesFetch();
