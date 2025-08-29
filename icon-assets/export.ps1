param([string]$OutDir = "icons")
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$smallSizes = @(16,19,32,38,48)
foreach ($sz in $smallSizes) {
  inkscape "svg/icon-small.svg" --export-type=png --export-filename="$OutDir/icon-$($sz).png" -w $sz -h $sz
}

$largeSizes = @(64,128,256)
foreach ($sz in $largeSizes) {
  inkscape "svg/icon-large.svg" --export-type=png --export-filename="$OutDir/icon-$($sz).png" -w $sz -h $sz
}

inkscape "svg/store-logo.svg" --export-type=png --export-filename="$OutDir/store-logo-512.png" -w 512 -h 512
Write-Host "Exported PNGs to $OutDir"
