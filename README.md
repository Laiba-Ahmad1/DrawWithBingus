# 🐱 drawWithBingus

> 🚧 **Under Construction** 🚧
> This project is a work in progress — things will change and break.

## What is this?

A drawing contest website where you race against the clock — and against **Bingus**, a cat 🐱, to sketch a random prompt.

- You get a **random prompt** each time you play
- You have **90 seconds** to draw it on a canvas
- **Bingus's drawing** is a pre-made image for that same prompt (drawn from our own 2D animation art, no AI generation)
- Once submitted, your drawing goes into a public **gallery**
- Other users can **vote and comment** on submissions whenever they're online — no live judging, just async community feedback

## How it works

1. Start a challenge → get a random prompt
2. Draw on the canvas before the 90-second timer runs out (auto-submits at 0)
3. Your drawing is uploaded and saved alongside Bingus's drawing for that prompt
4. Browse the gallery, vote, and comment on other people's submissions

## Tech

- **Frontend:** Next.js (App Router), Tailwind CSS
- **Drawing:** HTML5 Canvas (mouse + touch support)
- **Image storage:** Cloudinary (unsigned upload)
- **Auth:** Shared with the existing login/signup setup

## Status

| Feature                               | Status             |
| ------------------------------------- | ------------------ | ---------------- |
| Auth (login/signup)                   | ✅ Done            |
| Shared auth layout `(auth)/layout.js` | ✅ Done            |
| Random prompt system                  | ✅ Done            |
| Canvas drawing + 90s timer            | ✅ Done            |
| Cloudinary upload                     |                    | 🚧 Not built yet |
| Submission API (`/api/submissions`)   | 🚧 Not built yet   |
| Gallery / voting / comments           | 🚧 Not built yet   |
| Bingus's drawings per prompt          | 🚧 Not sourced yet |

## Setup

```bash
npm install
```

Add these to your `.env.local`:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

```bash
npm run dev
```

---

_More to come as this gets built out._
