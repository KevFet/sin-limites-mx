# Sin Límites MX 🇲🇽

Una aplicación web tipo 'Cards Against Humanity' personalizada con humor, slang y cultura mexicana. Construida con Next.js 14 y Supabase Realtime.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion.
- **Backend**: Supabase (Database + Realtime).
- **Icons**: Lucide React.

## Deployment on Vercel

Para desplegar este proyecto en Vercel, necesitas configurar las siguientes variables de entorno:

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | La URL de tu proyecto en Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4a2FxZW9xZmlucWt2ZWtjZXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjI2NjgsImV4cCI6MjA4NjEzODY2OH0.hrqVGejQG2krKoFsB9HOqW9BDuNKfoUeo32Wqr9WldE` |

### Pasos para el Deployment
1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ejecuta el script SQL que se encuentra en `supabase/schema.sql` en el SQL Editor de Supabase.
3. Habilita **Realtime** para las tablas `rooms`, `players` y `selections` en la configuración de Supabase.
4. Conecta tu repositorio a Vercel y añade las variables mencionadas arriba.

## Game Logic
- **LOBBY**: Crea una sala, comparte el código o el link de WhatsApp.
- **SELECTION**: Los jugadores eligen su respuesta. El Czar espera.
- **JUDGING**: El Czar elige la respuesta ganadora (anónima).
- **RESULTS**: Se muestran los puntajes y se rota el Czar para la siguiente ronda.

¡Disfruta el desmadre!
