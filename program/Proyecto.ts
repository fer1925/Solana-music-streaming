import * as anchor from "@coral-xyz/anchor";
import { web3 } from "@coral-xyz/anchor";

describe("Music Streaming", () => {

  it("Crear streaming y leer datos", async () => {

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.MusicStreaming;

    const [streamingPda] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("streaming"),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    console.log("DIRECCIÓN DEL STREAMING (PDA):", streamingPda.toBase58());

    // Crear streaming
    const txHash = await program.methods
      .crearStreaming("Solana Music")
      .accounts({
        owner: provider.wallet.publicKey,
        streming: streamingPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Tx:", txHash);

    await provider.connection.confirmTransaction(txHash);

    console.log("Streaming creado correctamente");

    // Agregar canción
    const txCancion = await program.methods
      .agregarCancion("Believer", "Rock", "Imagine Dragons")
      .accounts({
        owner: provider.wallet.publicKey,
        streaming: streamingPda,
      })
      .rpc();

    await provider.connection.confirmTransaction(txCancion);

    console.log("Canción agregada");

    // Leer datos on-chain
    const streaming = await program.account.streming.fetch(streamingPda);

    console.log("Datos on-chain:");
    console.log("Owner:", streaming.owner.toString());
    console.log("Nombre:", streaming.nombre);

    const cancionesLegibles = streaming.canciones.map((c: any) => ({
      nombre: c.nombre,
      genero: c.genero,
      artista: c.artista,
      disponible: c.disponible
    }));

    console.log("Canciones:", cancionesLegibles);

    // Verificación
    if (streaming.nombre !== "Solana Music") {
      throw new Error("El nombre del streaming no coincide");
    }

  });

});
