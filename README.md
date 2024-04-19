# Draw Duo

## Description

Draw Duo is a drawing game that allows two players to collaborate on a drawing. The game is played in real-time, each player will focus on a different part of the drawing, trying to recreate a reference image. The players will have a limited amount of time to draw their part of the image, and the game will end when each player finishes its part. The game will then display the reference image and the players' drawing side by side, allowing them to compare their work.

There's an alternative mode where the players will have to draw the entire image, and they will be able to compare their work at the end of the game.

## Tech stack

- [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) for real-time capabilities
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env.local` file in the root directory and add the following environment variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Init and link your Supabase project:

```
supabase init
supabase link
```

5. Apply migrations if needed:

```
supabase db reset
```

6. Run the development server with `npm run dev`
7. Open [http://localhost:5173/](http://localhost:5173/) in your browser
8. Have fun!
