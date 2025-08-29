# PowerShell script to create extension package with auto version increment
$outputDir = "output"
$manifestPath = "manifest.json"

# Read current manifest content as text to preserve formatting
$manifestContent = Get-Content $manifestPath -Raw

# Extract current version using regex
if ($manifestContent -match '"version":\s*"([^"]+)"') {
    $currentVersion = $matches[1]
    $versionParts = $currentVersion.Split('.')
    $major = [int]$versionParts[0]
    $minor = [int]$versionParts[1]
    $patch = if ($versionParts.Length -gt 2) { [int]$versionParts[2] } else { 0 }
    
    # Increment patch version
    $patch++
    $newVersion = "$major.$minor.$patch"
    
    # Replace version in manifest content while preserving formatting
    $manifestContent = $manifestContent -replace '"version":\s*"[^"]+"', "`"version`": `"$newVersion`""
    
    # Save updated content
    Set-Content $manifestPath -Value $manifestContent -Encoding UTF8 -NoNewline
} else {
    Write-Error "Could not find version in manifest.json"
    exit 1
}

Write-Host "Updated version from $currentVersion to $newVersion"

# Create output directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Create versioned zip filename
$outputPath = "$outputDir\copy-as-extension-v$newVersion.zip"

# Remove existing zip if it exists
if (Test-Path $outputPath) {
    Remove-Item $outputPath
}

# Create zip with only the necessary files
Compress-Archive -Path "manifest.json", "background.js", "scripts/", "popup/", "images/", "settings.html", "settings.js" -DestinationPath $outputPath

Write-Host "Extension package created: $outputPath"
Write-Host "Version: $newVersion"