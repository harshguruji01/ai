Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\harsh\.gemini\antigravity\brain\2ccfa95b-207b-48ac-8f30-d6e9a6e86e3f\.user_uploaded\media_1793286262873_e2e2c4d8.jpg"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found: $srcPath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Source Image loaded: $($srcImage.Width) x $($srcImage.Height)"

function Resize-Image {
    param(
        [System.Drawing.Image]$Image,
        [int]$Width,
        [int]$Height,
        [string]$DestPath,
        [bool]$ContainInSquare = $false,
        [string]$BgColorHex = "#0b0f19"
    )

    $dir = [System.IO.Path]::GetDirectoryName($DestPath)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $bmp = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($ContainInSquare) {
        $bgColor = [System.Drawing.ColorTranslator]::FromHtml($BgColorHex)
        $g.Clear($bgColor)
        
        # Calculate aspect ratio fit
        $ratioW = $Width / $Image.Width
        $ratioH = $Height / $Image.Height
        $ratio = [Math]::Min($ratioW, $ratioH) * 0.65  # 65% size in center
        
        $destW = [int]($Image.Width * $ratio)
        $destH = [int]($Image.Height * $ratio)
        $destX = [int](($Width - $destW) / 2)
        $destY = [int](($Height - $destH) / 2)
        
        $g.DrawImage($Image, $destX, $destY, $destW, $destH)
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
        $g.DrawImage($Image, 0, 0, $Width, $Height)
    }

    $g.Dispose()

    # Save as PNG
    $bmp.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Saved: $DestPath ($Width x $Height)"
}

# 1. Main Logo and Web Assets
Resize-Image -Image $srcImage -Width 1024 -Height 1024 -DestPath "logo.png"
Resize-Image -Image $srcImage -Width 1024 -Height 1024 -DestPath "public\logo.png"
Resize-Image -Image $srcImage -Width 1024 -Height 1024 -DestPath "www\logo.png"
Resize-Image -Image $srcImage -Width 512 -Height 512 -DestPath "public\icon.png"
Resize-Image -Image $srcImage -Width 1024 -Height 1024 -DestPath "ai.png"
Resize-Image -Image $srcImage -Width 1024 -Height 1024 -DestPath "public\ai.png"
Resize-Image -Image $srcImage -Width 1024 -Height 1024 -DestPath "www\ai.png"

# 2. Android Mipmap Icons
$mipmapConfigs = @(
    @{ Name = "mipmap-mdpi"; Size = 48; ForeSize = 108 },
    @{ Name = "mipmap-hdpi"; Size = 72; ForeSize = 162 },
    @{ Name = "mipmap-xhdpi"; Size = 96; ForeSize = 216 },
    @{ Name = "mipmap-xxhdpi"; Size = 144; ForeSize = 324 },
    @{ Name = "mipmap-xxxhdpi"; Size = 192; ForeSize = 432 }
)

foreach ($cfg in $mipmapConfigs) {
    $folder = "android\app\src\main\res\$($cfg.Name)"
    Resize-Image -Image $srcImage -Width $cfg.Size -Height $cfg.Size -DestPath "$folder\ic_launcher.png"
    Resize-Image -Image $srcImage -Width $cfg.Size -Height $cfg.Size -DestPath "$folder\ic_launcher_round.png"
    Resize-Image -Image $srcImage -Width $cfg.ForeSize -Height $cfg.ForeSize -DestPath "$folder\ic_launcher_foreground.png"
}

# 3. Android Splash Screens (Centered logo on sleek dark background)
Resize-Image -Image $srcImage -Width 512 -Height 512 -DestPath "android\app\src\main\res\drawable\splash.png" -ContainInSquare $true

$splashPortConfigs = @(
    @{ Name = "drawable-port-mdpi"; W = 320; H = 480 },
    @{ Name = "drawable-port-hdpi"; W = 480; H = 800 },
    @{ Name = "drawable-port-xhdpi"; W = 720; H = 1280 },
    @{ Name = "drawable-port-xxhdpi"; W = 960; H = 1600 },
    @{ Name = "drawable-port-xxxhdpi"; W = 1280; H = 1920 }
)

foreach ($cfg in $splashPortConfigs) {
    $folder = "android\app\src\main\res\$($cfg.Name)"
    Resize-Image -Image $srcImage -Width $cfg.W -Height $cfg.H -DestPath "$folder\splash.png" -ContainInSquare $true
}

$splashLandConfigs = @(
    @{ Name = "drawable-land-mdpi"; W = 480; H = 320 },
    @{ Name = "drawable-land-hdpi"; W = 800; H = 480 },
    @{ Name = "drawable-land-xhdpi"; W = 1280; H = 720 },
    @{ Name = "drawable-land-xxhdpi"; W = 1600; H = 960 },
    @{ Name = "drawable-land-xxxhdpi"; W = 1920; H = 1280 }
)

foreach ($cfg in $splashLandConfigs) {
    $folder = "android\app\src\main\res\$($cfg.Name)"
    Resize-Image -Image $srcImage -Width $cfg.W -Height $cfg.H -DestPath "$folder\splash.png" -ContainInSquare $true
}

$srcImage.Dispose()
Write-Host "All icons, logos, and splash screens successfully generated!"
