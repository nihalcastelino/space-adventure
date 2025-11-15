# Image Optimization Guide for Windows

How to optimize background images for Space Adventure without losing visual quality.

## Quick Methods (No Installation Required)

### Method 1: Using Paint.NET (Free, Recommended)

1. **Download Paint.NET** (free from Microsoft Store or paint.net)
2. **Open your image** in Paint.NET
3. **Resize if needed**: Image → Resize
   - For 4K: 3840x2160
   - For Full HD: 1920x1080
   - Maintain aspect ratio
4. **Save as JPEG**:
   - File → Save As → Choose JPEG
   - Quality slider: **85-90%** (sweet spot for size/quality)
   - Click Save
5. **Result**: Usually reduces file size by 60-80% with minimal quality loss

### Method 2: Using Windows Photos App (Built-in)

1. Open image in **Photos** app
2. Click **Edit** (or Ctrl+E)
3. Make any adjustments needed
4. Click **Save a copy** (Ctrl+S)
5. **Note**: Limited compression control, but works in a pinch

### Method 3: Using PowerShell (Built-in, Advanced)

```powershell
# Install ImageMagick first (see below), then:
magick input.jpg -quality 85 -strip -interlace Plane output.jpg

# Or for PNG to JPEG conversion:
magick input.png -quality 85 output.jpg
```

## Best Free Tools for Windows

### 1. **ImageMagick** (Command Line - Most Powerful)
- **Download**: https://imagemagick.org/script/download.php
- **Install**: Choose "Install legacy utilities" during setup
- **Usage**:
```powershell
# Optimize JPEG (recommended for backgrounds)
magick space-bg.jpg -quality 85 -strip -interlace Plane -resize 1920x1080> space-bg-optimized.jpg

# Convert PNG to optimized JPEG
magick space-bg.png -quality 85 -strip -interlace Plane space-bg.jpg

# Batch optimize all images in folder
Get-ChildItem *.jpg | ForEach-Object { magick $_.FullName -quality 85 -strip -interlace Plane "optimized_$($_.Name)" }
```

### 2. **Squoosh** (Online - Google's Tool)
- **URL**: https://squoosh.app/
- **Best for**: Quick one-off optimizations
- **Steps**:
  1. Drag image to browser
  2. Choose format: **MozJPEG** or **WebP**
  3. Adjust quality slider (85-90%)
  4. Download optimized image
- **Advantage**: No installation, works in browser

### 3. **TinyPNG / TinyJPG** (Online)
- **URL**: https://tinypng.com/
- **Best for**: Quick compression
- **Limits**: 5MB per image, 20 images per batch (free)
- **Result**: Usually 60-70% size reduction

### 4. **GIMP** (Free, Full-Featured)
- **Download**: https://www.gimp.org/
- **Steps**:
  1. File → Export As
  2. Choose JPEG
  3. Set Quality: **85-90**
  4. Enable "Show preview in image window"
  5. Adjust until satisfied
  6. Export

### 5. **XnConvert** (Free, Batch Processing)
- **Download**: https://www.xnview.com/en/xnconvert/
- **Best for**: Batch processing multiple images
- **Steps**:
  1. Add images
  2. Actions → Add → Image → Resize (if needed)
  3. Actions → Add → Image → Format → JPEG
  4. Output → Set quality: **85**
  5. Convert

## Recommended Settings for Game Backgrounds

### JPEG Settings (Best for Photos/Complex Images)
- **Quality**: 85-90% (sweet spot)
- **Progressive/Interlaced**: Enabled (faster loading)
- **Color Space**: sRGB
- **Strip Metadata**: Yes (removes EXIF data, saves space)

### WebP Settings (Modern Alternative)
- **Quality**: 85-90%
- **Format**: Lossy (for photos)
- **Advantage**: 25-35% smaller than JPEG at same quality
- **Browser Support**: All modern browsers (IE11+)

### PNG Settings (Only if needed for transparency)
- **Compression**: Maximum (9)
- **Color Depth**: 8-bit (if no transparency needed, use JPEG instead)
- **Optimize**: Use tools like OptiPNG or PNGGauntlet

## Step-by-Step: Optimize Your Background Image

### Using Paint.NET (Easiest Method)

1. **Open** `space-bg.jpg` in Paint.NET
2. **Check dimensions**: 
   - If larger than 3840x2160, resize to 3840x2160
   - If smaller, keep original size
3. **File → Save As**
4. **Choose JPEG** format
5. **Set Quality to 85%**
6. **Enable "Progressive"** if available
7. **Save** as `space-bg-optimized.jpg`
8. **Compare file sizes** - should be 60-80% smaller

### Using Squoosh (Online, No Installation)

1. Go to https://squoosh.app/
2. **Drag** your `space-bg.jpg` into browser
3. **Left side**: Original (shows file size)
4. **Right side**: 
   - Format: **MozJPEG**
   - Quality: **85**
5. **Compare** side-by-side
6. **Download** optimized version
7. **Replace** original if satisfied

## Target File Sizes

| Resolution | Target Size | Max Size |
|------------|-------------|----------|
| 1920x1080 (Full HD) | 200-400 KB | 500 KB |
| 2560x1440 (2K) | 400-700 KB | 1 MB |
| 3840x2160 (4K) | 800 KB - 1.5 MB | 2 MB |

**Note**: Backgrounds can be slightly larger since they load once, but keep under 2MB for good performance.

## Advanced: Batch Optimization Script

### PowerShell Script (Save as `optimize-images.ps1`)

```powershell
# Requires ImageMagick to be installed
# Usage: .\optimize-images.ps1

$quality = 85
$maxWidth = 3840
$maxHeight = 2160

Get-ChildItem -Path ".\public" -Filter "*.jpg","*.png" | ForEach-Object {
    $inputFile = $_.FullName
    $outputFile = $inputFile -replace '\.(jpg|png)$', '-optimized.jpg'
    
    Write-Host "Optimizing: $($_.Name)"
    
    # Resize if larger than max dimensions, then optimize
    magick $inputFile `
        -resize "${maxWidth}x${maxHeight}>" `
        -quality $quality `
        -strip `
        -interlace Plane `
        $outputFile
    
    $originalSize = (Get-Item $inputFile).Length / 1MB
    $newSize = (Get-Item $outputFile).Length / 1MB
    $savings = (1 - ($newSize / $originalSize)) * 100
    
    Write-Host "  Original: $([math]::Round($originalSize, 2)) MB"
    Write-Host "  Optimized: $([math]::Round($newSize, 2)) MB"
    Write-Host "  Savings: $([math]::Round($savings, 1))%"
    Write-Host ""
}
```

## Quick Comparison Tool

### Using PowerShell (Built-in)

```powershell
# Compare file sizes
$original = Get-Item "space-bg.jpg"
$optimized = Get-Item "space-bg-optimized.jpg"

Write-Host "Original: $([math]::Round($original.Length / 1MB, 2)) MB"
Write-Host "Optimized: $([math]::Round($optimized.Length / 1MB, 2)) MB"
Write-Host "Savings: $([math]::Round((1 - ($optimized.Length / $original.Length)) * 100, 1))%"
```

## Best Practices

1. **Always keep original**: Save optimized version with different name first
2. **Test in browser**: Load optimized image in game to verify quality
3. **Progressive JPEG**: Better perceived performance (loads in stages)
4. **Strip metadata**: Removes EXIF data (camera info, GPS, etc.) - saves space
5. **Right format**: 
   - **JPEG**: Photos, complex images, backgrounds
   - **WebP**: Modern alternative (better compression)
   - **PNG**: Only if you need transparency

## Format Comparison

| Format | Best For | Typical Size | Browser Support |
|-------|----------|--------------|-----------------|
| JPEG (85%) | Photos, backgrounds | 100% | Universal |
| WebP (85%) | Modern alternative | 70-75% of JPEG | Modern browsers |
| PNG-8 | Simple graphics | 200-300% of JPEG | Universal |
| PNG-24 | Transparency needed | 300-500% of JPEG | Universal |

## Quick Win: One-Click Solution

**Fastest method for single image:**
1. Go to https://squoosh.app/
2. Drag your image
3. Set quality to 85
4. Download
5. Done! (Usually 60-70% size reduction)

## Troubleshooting

### Image looks blurry after optimization
- **Solution**: Increase quality to 90-95%
- **Or**: Use WebP format at 85% (better quality at same size)

### File size still too large
- **Check dimensions**: Resize to max 3840x2160
- **Try WebP**: 25-35% smaller than JPEG
- **Strip metadata**: Can save 5-10%
- **Reduce quality slightly**: 80-85% is usually fine for backgrounds

### Need to batch process
- **Use**: XnConvert or ImageMagick PowerShell script
- **Or**: Squoosh CLI (command line version)

## Recommended Workflow

1. **Generate** background with AI tool
2. **Download** original (usually 5-10MB)
3. **Optimize** using Squoosh or Paint.NET
4. **Target**: Under 2MB, quality 85%
5. **Test** in game to verify quality
6. **Replace** original if satisfied

## Tools Summary

| Tool | Type | Best For | Difficulty |
|------|------|----------|------------|
| **Squoosh** | Online | Quick optimization | ⭐ Easy |
| **Paint.NET** | Desktop | Single images | ⭐ Easy |
| **TinyPNG** | Online | Batch (20 images) | ⭐ Easy |
| **ImageMagick** | CLI | Advanced/batch | ⭐⭐⭐ Advanced |
| **XnConvert** | Desktop | Batch processing | ⭐⭐ Medium |

**Recommendation**: Start with **Squoosh** for quick results, use **Paint.NET** for more control.

