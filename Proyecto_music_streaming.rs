use anchor_lang::prelude::*;

declare_id!("7hAqagd9omCvuh972uYZR1CiU3CZmBaxd29tq8gPaeae");

#[program]
pub mod music_streaming {
    use super::*;

    pub fn crear_streaming(context: Context<NuevoStreaming>, nombre: String) -> Result<()> {
        let owner_id = context.accounts.owner.key();
        let canciones: Vec<Song> = vec![];

        context.accounts.streming.set_inner(Streming {
            owner: owner_id,
            nombre,
            canciones,
        });
        Ok(())
    }

    pub fn agregar_cancion(context: Context<NuevaCancion>, nombre: String, genero: String, artista: String) -> Result<()> {
        require!( 
            context.accounts.streaming.owner == context.accounts.owner.key(),
            Errores::NoEresElOwner
        );
        
        let cancion = Song {
            nombre,
            genero,
            artista,
            disponible: true,
        };

        context.accounts.streaming.canciones.push(cancion);

        Ok(())
    }

    pub fn ver_cancion(context: Context<NuevaCancion>) -> Result<()>{
        require!( 
            context.accounts.streaming.owner == context.accounts.owner.key(),
            Errores::NoEresElOwner
        );
        
        msg!("La lista de canciones es: {:#?}", context.accounts.streaming.canciones);

        Ok(())
    }
    
    pub fn eliminar_cancion(context: Context<NuevaCancion>, nombre:String) -> Result<()>{
        require!( 
            context.accounts.streaming.owner == context.accounts.owner.key(),
            Errores::NoEresElOwner
        );

        let canciones = &mut context.accounts.streaming.canciones;

        for i in 0..canciones.len() {
            if canciones[i].nombre == nombre {
                canciones.remove(i);
                msg!("Cancion {nombre} eliminada");
                return Ok(())
            }
        }

        Err(Errores::CancionNoExiste.into())
    }

    pub fn alternar_cancion(context:Context<NuevaCancion>, nombre:String) -> Result<()>{
        require!( 
            context.accounts.streaming.owner == context.accounts.owner.key(),
            Errores::NoEresElOwner
        );
        
        let canciones = &mut context.accounts.streaming.canciones;

        for i in 0..canciones.len() {
            let estado = canciones[i].disponible;

            if canciones[i].nombre == nombre {
                let nuevo_estado = !estado;
                canciones[i].disponible = nuevo_estado;

                msg!("El libro: {} ahora tiene un valor de disponibilidad: {}", nombre, nuevo_estado);
                return Ok(())
            }
        }

        Err(Errores::CancionNoExiste.into())
    }
}

#[error_code]
pub enum Errores {
    #[msg("Error, no eres el propietario de la cuenta.")]
    NoEresElOwner,
    
    #[msg("Error, la cancion proporcionado no existe.")]
    CancionNoExiste,
}


#[account]
#[derive(InitSpace)]
pub struct Streming {
    owner: Pubkey, 

    #[max_len(60)]
    nombre: String,

    #[max_len(10)]
    canciones: Vec<Song>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace, PartialEq, Debug)]
pub struct Song {
    #[max_len(60)]
    nombre: String,

    #[max_len(20)]
    genero: String,

    #[max_len(30)]
    artista: String,

    disponible: bool,
}

#[derive(Accounts)]
pub struct NuevoStreaming<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        space = Streming::INIT_SPACE + 8,
        seeds = [b"streaming", owner.key().as_ref()],
        bump
    )]
    pub streming: Account<'info, Streming>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)] 
pub struct NuevaCancion<'info> {
    pub owner: Signer<'info>,
    
    #[account(mut)]
    pub streaming: Account<'info, Streming>,
}
