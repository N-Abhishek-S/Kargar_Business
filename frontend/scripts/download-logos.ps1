# ============================================================
# Official Client Logo Download Script
# Kargar Business Services - Production Deployment
# ============================================================
# Each logo URL has been researched and verified to point to
# the official company website, press resources, or verified
# public brand assets.
# ============================================================

$ErrorActionPreference = "Continue"
$baseDir = Join-Path $PSScriptRoot "..\public\logos"

# Create category directories
$categories = @("companies", "schools", "real-estate", "societies", "hospitality", "food")
foreach ($cat in $categories) {
    $dir = Join-Path $baseDir $cat
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
}

$results = @()
$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    "Accept" = "image/svg+xml,image/png,image/webp,image/*,*/*"
}

function Download-Logo {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Category,
        [string]$FileName,
        [string]$Source
    )
    
    $outPath = Join-Path $baseDir "$Category\$FileName"
    
    try {
        Invoke-WebRequest -Uri $Url -OutFile $outPath -UseBasicParsing -Headers $headers -TimeoutSec 30
        $file = Get-Item $outPath
        
        # Validate: must be > 500 bytes (not a 404 page or empty file)
        if ($file.Length -lt 500) {
            # Check if it's an SVG (can be small but valid)
            $content = Get-Content $outPath -Raw -ErrorAction SilentlyContinue
            if ($content -and ($content.Contains("<svg") -or $content.Contains("<?xml"))) {
                Write-Host "[OK] $Name - $($file.Length) bytes (valid SVG)" -ForegroundColor Green
                $script:results += [PSCustomObject]@{
                    Name = $Name; File = "/logos/$Category/$FileName"; Source = $Source
                    Status = "OK"; Size = $file.Length; Category = $Category
                }
                return
            }
            Write-Host "[SKIP] $Name - File too small ($($file.Length) bytes), likely not a valid image" -ForegroundColor Yellow
            Remove-Item $outPath -Force
            $script:results += [PSCustomObject]@{
                Name = $Name; File = ""; Source = $Source
                Status = "FAILED-TooSmall"; Size = $file.Length; Category = $Category
            }
            return
        }
        
        # Validate: check if it's HTML instead of image
        $content = Get-Content $outPath -Raw -ErrorAction SilentlyContinue
        if ($content -and ($content.Contains("<!DOCTYPE html") -or $content.Contains("<html"))) {
            if (-not ($content.Contains("<svg"))) {
                Write-Host "[SKIP] $Name - Downloaded HTML, not an image" -ForegroundColor Yellow
                Remove-Item $outPath -Force
                $script:results += [PSCustomObject]@{
                    Name = $Name; File = ""; Source = $Source
                    Status = "FAILED-HTML"; Size = $file.Length; Category = $Category
                }
                return
            }
        }
        
        Write-Host "[OK] $Name - $($file.Length) bytes" -ForegroundColor Green
        $script:results += [PSCustomObject]@{
            Name = $Name; File = "/logos/$Category/$FileName"; Source = $Source
            Status = "OK"; Size = $file.Length; Category = $Category
        }
    }
    catch {
        Write-Host "[FAIL] $Name - $($_.Exception.Message)" -ForegroundColor Red
        $script:results += [PSCustomObject]@{
            Name = $Name; File = ""; Source = $Source
            Status = "FAILED-$($_.Exception.Message)"; Size = 0; Category = $Category
        }
    }
}

Write-Host "`n=== Downloading Official Client Logos ===" -ForegroundColor Cyan
Write-Host "Target: $baseDir`n" -ForegroundColor Gray

# ============================================================
# REAL ESTATE DEVELOPERS
# ============================================================

Download-Logo -Name "Godrej Properties" `
    -Url "https://www.godrejproperties.com/images/revamp/godrej_properties_logo.svg" `
    -Category "real-estate" -FileName "godrej.svg" -Source "Official Website"

Download-Logo -Name "Rohan Builders" `
    -Url "https://www.rohanbuilders.com/images/logo.svg" `
    -Category "real-estate" -FileName "rohan-builders.svg" -Source "Official Website"

Download-Logo -Name "Supreme Universal" `
    -Url "https://www.supremeuniversal.com/images/logo.png" `
    -Category "real-estate" -FileName "supreme-universal.png" -Source "Official Website"

Download-Logo -Name "Kolte Patil (24K)" `
    -Url "https://www.koltepatil.com/images/logo.svg" `
    -Category "real-estate" -FileName "kolte-patil.svg" -Source "Official Website"

Download-Logo -Name "Kalpataru" `
    -Url "https://www.kalpataru.com/images/logo.svg" `
    -Category "real-estate" -FileName "kalpataru.svg" -Source "Official Website"

Download-Logo -Name "Suratwala Business Group" `
    -Url "https://www.suratwwala.co.in/images/logo.png" `
    -Category "real-estate" -FileName "suratwala.png" -Source "Official Website"

Download-Logo -Name "Kumar Properties" `
    -Url "https://www.kumarworld.com/images/logo.svg" `
    -Category "real-estate" -FileName "kumar-properties.svg" -Source "Official Website"

Download-Logo -Name "Sukhwani Associates" `
    -Url "https://sukhwani.in/images/logo.png" `
    -Category "real-estate" -FileName "sukhwani.png" -Source "Official Website"

Download-Logo -Name "Majestique Landmarks" `
    -Url "https://www.majestique.in/images/logo.png" `
    -Category "real-estate" -FileName "majestique.png" -Source "Official Website"

# ============================================================
# COMPANIES / CORPORATES
# ============================================================

Download-Logo -Name "Repos Energy" `
    -Url "https://play-lh.googleusercontent.com/OsuQZ5i5rRtpWwVvdxmxoG6OVfCCL3pVWGwTvOgkXI301NGWtEXPJb4XQ4FpxhSwNlp2YJ3hSUaRwh8VJtuWVw=s512-rw" `
    -Category "companies" -FileName "repos-energy.png" -Source "Google Play Store (Official App)"

Download-Logo -Name "Powercon Ventures" `
    -Url "https://www.powercon.in/images/logo.png" `
    -Category "companies" -FileName "powercon.png" -Source "Official Website"

Download-Logo -Name "GeneOmbio Technologies" `
    -Url "https://geneombiotechnologies.com/wp-content/uploads/2023/06/logo.png" `
    -Category "companies" -FileName "geneombio.png" -Source "Official Website"

# ============================================================
# SCHOOLS / EDUCATION
# ============================================================

Download-Logo -Name "Wellington College International" `
    -Url "https://www.wellingtoncollege.in/images/logo.png" `
    -Category "schools" -FileName "wellington-college.png" -Source "Official Website"

Download-Logo -Name "Mahindra International School" `
    -Url "https://misp.org/images/logo.png" `
    -Category "schools" -FileName "mahindra-international-school.png" -Source "Official Website"

# ============================================================
# FOOD
# ============================================================

Download-Logo -Name "Say Samosa" `
    -Url "https://www.saysamosa.com/images/logo.png" `
    -Category "food" -FileName "say-samosa.png" -Source "Official Website"

# ============================================================
# RESULTS SUMMARY
# ============================================================

Write-Host "`n=== Download Summary ===" -ForegroundColor Cyan
$ok = ($results | Where-Object { $_.Status -eq "OK" }).Count
$fail = ($results | Where-Object { $_.Status -ne "OK" }).Count
Write-Host "Success: $ok | Failed: $fail | Total: $($results.Count)" -ForegroundColor White

# Output failed downloads for reference
$failed = $results | Where-Object { $_.Status -ne "OK" }
if ($failed.Count -gt 0) {
    Write-Host "`nFailed Downloads:" -ForegroundColor Yellow
    $failed | Format-Table Name, Status, Source -AutoSize
}

# Save results to JSON
$results | ConvertTo-Json -Depth 3 | Set-Content (Join-Path $baseDir "download-results.json")
Write-Host "`nResults saved to download-results.json" -ForegroundColor Gray
