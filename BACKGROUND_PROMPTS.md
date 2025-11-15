# Background Image Generation Prompts for Space Adventure

These prompts are designed for AI image generators (Midjourney, DALL-E, Stable Diffusion, etc.) to create backgrounds that match the retro space shooter aesthetic of the game.

## Main Game Background (Current: space-bg.jpg)

### Option 1: Classic Retro Space
```
A retro 1980s arcade space background, deep space with twinkling stars, pixelated nebula clouds in purple and blue, retro CRT scanlines effect, dark navy blue and black color scheme, nostalgic arcade game aesthetic, 16-bit style, 4K resolution, cinematic lighting
```

### Option 2: Alien Invasion Theme
```
Retro space shooter background, alien planet surface with glowing craters, purple and green alien atmosphere, pixelated stars in the distance, 1980s arcade game style, dark with neon accents, nostalgic gaming aesthetic, high resolution
```

### Option 3: Deep Space Nebula
```
Vintage arcade game background, swirling space nebula in magenta and cyan, twinkling pixel stars, retro CRT monitor glow, dark space with colorful cosmic clouds, 8-bit aesthetic, nostalgic arcade feel, cinematic composition
```

### Option 4: Space Station View
```
Retro space station interior view, looking out into deep space, glowing control panels in the foreground, stars and distant planets visible, 1980s sci-fi arcade game style, dark with neon blue and green accents, pixelated aesthetic
```

## Alternative Background Styles

### Dark & Moody (Hard Difficulty)
```
Dark space background with menacing alien ships silhouettes, red warning lights, ominous purple nebula, retro arcade game style, high contrast, dramatic lighting, 1980s gaming aesthetic, cinematic
```

### Bright & Energetic (Easy Difficulty)
```
Colorful retro space background, bright stars and friendly alien planets, cheerful blue and purple nebula clouds, 1980s arcade game aesthetic, optimistic and fun, pixelated style, nostalgic gaming feel
```

### Neon Cyberpunk Space
```
Cyberpunk retro space background, neon pink and cyan stars, holographic grid overlay, 1980s synthwave aesthetic, dark space with vibrant neon accents, retro-futuristic arcade game style, high resolution
```

### Classic Arcade Cabinet
```
1980s arcade cabinet screen background, classic space shooter game background, pixelated stars and planets, retro CRT monitor aesthetic, nostalgic arcade feel, authentic vintage gaming look, high detail
```

## Technical Specifications

### Recommended Settings:
- **Aspect Ratio**: 16:9 or 21:9 (for wide screens)
- **Resolution**: 3840x2160 (4K) or higher
- **Style**: Retro, pixelated, 8-bit/16-bit aesthetic
- **Color Palette**: 
  - Primary: Deep navy blue (#0F172A), black (#000000)
  - Accents: Yellow (#FBBF24), red (#EF4444), purple (#A855F7), green (#10B981), blue (#3B82F6)
- **Mood**: Nostalgic, retro-futuristic, space adventure

### Color Harmony Notes:
- Background should be dark enough to make game elements (yellow borders, colored cells) pop
- Avoid too many bright elements that compete with game UI
- Maintain contrast for readability
- Use subtle gradients and textures

## Prompt Variations by Game Mode

### Local Game Background
```
Cozy retro space background, warm starfield, friendly alien constellations, 1980s arcade game aesthetic, inviting and playful, pixelated stars, nostalgic gaming feel, comfortable atmosphere
```

### Online Multiplayer Background
```
Dynamic retro space background, multiple alien ships in formation, active space battlefield, 1980s arcade game style, competitive atmosphere, pixelated aesthetic, energetic and engaging
```

### AI Game Background
```
Futuristic retro space background, AI-controlled alien fleet, glowing data streams, 1980s sci-fi arcade aesthetic, technological and mysterious, pixelated style, high-tech gaming feel
```

## Advanced Prompt Techniques

### For Midjourney:
```
/imagine prompt: retro 1980s arcade space background, deep space with twinkling stars, pixelated nebula, CRT scanlines, dark navy blue, nostalgic gaming aesthetic, 16-bit style --ar 16:9 --v 6 --style raw
```

### For DALL-E 3:
```
A retro 1980s arcade game background showing deep space with twinkling stars, pixelated nebula clouds in purple and blue, retro CRT scanlines effect, dark navy blue and black color scheme, nostalgic arcade game aesthetic, 16-bit pixel art style, cinematic lighting, 4K resolution
```

### For Stable Diffusion:
```
retro 1980s arcade space background, deep space, twinkling stars, pixelated nebula, purple blue, CRT scanlines, dark navy, nostalgic arcade, 16-bit style, cinematic lighting, 4k, masterpiece, best quality
Negative prompt: modern, realistic, photorealistic, 3d render, smooth gradients
```

## Background Replacement Instructions

1. Generate image using one of the prompts above
2. Save as `space-bg.jpg` in the `public/` folder
3. Ensure file size is optimized (under 500KB recommended)
4. Test on different screen sizes to ensure readability
5. Adjust opacity/overlay if needed in game components

## Current Background Reference

The game currently uses `/space-bg.jpg` which is referenced in:
- `LocalGame.jsx` (line 159)
- `GameModeSelector.jsx` (line 65)
- `OnlineGame.jsx` (similar pattern)

You can create multiple backgrounds and switch them based on:
- Game difficulty
- Game mode
- Time of day (if adding day/night mode)
- Player preferences

