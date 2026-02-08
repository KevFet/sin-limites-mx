# Guía de Despliegue a Vercel 🚀

He preparado todo para que tu aplicación **Sin Límites MX** esté en línea en menos de 5 minutos. Sigue estos pasos:

### 1. Sube tu código a GitHub
Como ya inicialicé el repositorio git localmente, solo necesitas crear un repositorio nuevo en tu cuenta de GitHub y ejecutar estos comandos en la terminal:

```bash
cd /Users/kevin/.gemini/antigravity/scratch/sin-limites-mx
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### 2. Conecta con Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión.
2. Haz clic en **"Add New"** > **"Project"**.
3. Importa el repositorio que acabas de subir.

### 3. Configura las Variables de Entorno (IMPORTANTE)
En el paso de "Configure Project" en Vercel, busca la sección **Environment Variables** y añade las siguientes (copia los valores de tu archivo `.env.local` que ya configuré):

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kxkaqeoqfinqkvekceqo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...hrqVGejQG2krKoFsB9HOqW9BDuNKfoUeo32Wqr9WldE` (USA LA CLAVE LARGA QUE TE PASÉ) |

### 4. ¡Despliega!
Haz clic en **"Deploy"**. Vercel compilará la aplicación y te dará una URL (ej: `sin-limites-mx.vercel.app`) donde ya podrás jugar con tus amigos desde cualquier celular.

---
> [!TIP]
> Si quieres probarlo localmente antes de subirlo, solo corre `npm run dev`.
