#!/usr/bin/env pwsh
# Create a GitHub Release with the APK as a downloadable asset.
#
# Requires a GitHub Personal Access Token (PAT) with `repo` scope.
# Get one: https://github.com/settings/tokens/new
#   - Note: "Text Looter releases"
#   - Expiration: 90 days (or no expiration)
#   - Scopes: `repo` (full)
#   - Generate token, copy it
#
# Usage:
#   $env:GITHUB_TOKEN = "ghp_xxxxxxxxxxxx"
#   pwsh scripts/create-release.ps1 -Version 0.1.3 -Notes "Bug fix release"
#
# Or with a one-liner:
#   pwsh scripts/create-release.ps1 -Version 0.1.3 -Token ghp_xxx -Notes "..."

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [string]$Token = $env:GITHUB_TOKEN,

    [string]$RepoOwner = "rekwest85",

    [string]$RepoName = "text-looter",

    [string]$Notes = "",

    [string]$NotesFile = "",

    [switch]$Prerelease,

    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# ─── Sanity checks ────────────────────────────────────────────────────────────

if (-not $Token) {
    Write-Host ""
    Write-Host "ERROR: No GitHub token. Set it with:" -ForegroundColor Red
    Write-Host '  $env:GITHUB_TOKEN = "ghp_xxxxxxxxxxxx"' -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Get a token at: https://github.com/settings/tokens/new" -ForegroundColor Yellow
    Write-Host "  - Note: Text Looter releases" -ForegroundColor Yellow
    Write-Host "  - Scopes: repo" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

$tag = if ($Version.StartsWith("v")) { $Version } else { "v$Version" }
$apkSrc = "releases/$Version/text-looter-$Version.apk"
if (-not (Test-Path $apkSrc)) {
    Write-Host "ERROR: APK not found at $apkSrc" -ForegroundColor Red
    Write-Host "Build it first:  npm run android:apk" -ForegroundColor Yellow
    Write-Host "Then copy to:   releases/$Version/text-looter-$Version.apk" -ForegroundColor Yellow
    exit 1
}

if (-not $Notes -and $NotesFile -and (Test-Path $NotesFile)) {
    $Notes = Get-Content -LiteralPath $NotesFile -Raw
}

if (-not $Notes) {
    $Notes = "Release $tag"
}

# ─── GitHub API base ─────────────────────────────────────────────────────────

$api = "https://api.github.com"
$auth = "token $Token"
$headers = @{
    Authorization        = $auth
    Accept               = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
    "User-Agent"         = "text-looter-rpg"
}

function Invoke-GhApi {
    param([string]$Method, [string]$Path, [string]$Body = $null)
    $full = "$api$Path"
    $params = @{
        Method  = $Method
        Uri     = $full
        Headers = $headers
    }
    if ($Body) { $params.Body = $Body; $params.ContentType = "application/json" }
    return Invoke-RestMethod @params
}

# ─── Check that the tag exists locally and on remote ─────────────────────────

Write-Host "[1/4] Verifying tag $tag exists..." -ForegroundColor Cyan
$tagExistsLocal = git tag -l $tag
$tagExistsRemote = $false
try {
    $null = Invoke-GhApi -Method GET -Path "/repos/$RepoOwner/$RepoName/git/refs/tags/$tag"
    $tagExistsRemote = $true
} catch {
    $tagExistsRemote = $false
}

if (-not $tagExistsLocal -and -not $tagExistsRemote) {
    Write-Host "ERROR: Tag $tag doesn't exist locally or on remote." -ForegroundColor Red
    Write-Host "Create it with:  git tag -a $tag -m '<message>' && git push origin $tag" -ForegroundColor Yellow
    exit 1
}

if ($tagExistsLocal -and -not $tagExistsRemote) {
    Write-Host "  Pushing tag to remote..." -ForegroundColor Yellow
    git push origin $tag | Out-Null
}

# ─── Create or update the release ─────────────────────────────────────────────

Write-Host "[2/4] Creating release for $tag..." -ForegroundColor Cyan
$relBody = @{
    tag_name         = $tag
    name             = "Text Looter RPG $tag"
    body             = $Notes
    draft            = $false
    prerelease       = [bool]$Prerelease
    generate_release_notes = $false
} | ConvertTo-Json -Depth 4

$release = $null
try {
    $release = Invoke-GhApi -Method POST -Path "/repos/$RepoOwner/$RepoName/releases" -Body $relBody
    Write-Host "  Release created: $($release.html_url)" -ForegroundColor Green
} catch {
    $errResp = $_.Exception.Response
    if ($errResp.StatusCode -eq 422) {
        # Already exists — fetch it
        Write-Host "  Release already exists, updating..." -ForegroundColor Yellow
        $existing = Invoke-GhApi -Method GET -Path "/repos/$RepoOwner/$RepoName/releases/tags/$tag"
        $release = Invoke-GhApi -Method PATCH -Path "/repos/$RepoOwner/$RepoName/releases/$($existing.id)" -Body $relBody
        Write-Host "  Release updated: $($release.html_url)" -ForegroundColor Green
    } else {
        throw
    }
}

# ─── Delete old APK assets (if re-uploading) ─────────────────────────────────

Write-Host "[3/4] Cleaning old assets..." -ForegroundColor Cyan
foreach ($asset in $release.assets) {
    if ($asset.name -like "*.apk") {
        Write-Host "  Deleting old asset: $($asset.name)" -ForegroundColor Yellow
        try {
            Invoke-GhApi -Method DELETE -Path "/repos/$RepoOwner/$RepoName/releases/assets/$($asset.id)" | Out-Null
        } catch { }
    }
}

# ─── Upload the APK ──────────────────────────────────────────────────────────

if ($DryRun) {
    Write-Host "[4/4] DRY RUN: would upload $apkSrc" -ForegroundColor Cyan
    exit 0
}

Write-Host "[4/4] Uploading APK..." -ForegroundColor Cyan
$apkName = "text-looter-$Version.apk"

# Step 1: Get an upload URL
$uploadUrl = $release.upload_url -replace "\{\?name,label\}", "?name=$apkName"

$apkBytes = [System.IO.File]::ReadAllBytes($apkSrc)
$apkSize = $apkBytes.Length
$apkBase64 = [Convert]::ToBase64String($apkBytes)

$uploadHeaders = @{
    Authorization        = $auth
    Accept               = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
    "User-Agent"         = "text-looter-rpg"
    "Content-Type"       = "application/vnd.android.package-archive"
}

$upload = Invoke-RestMethod -Method POST -Uri $uploadUrl -Headers $uploadHeaders -Body $apkBytes

Write-Host ""
Write-Host "DONE." -ForegroundColor Green
Write-Host "  Release: $($release.html_url)" -ForegroundColor Green
Write-Host "  APK:     $($upload.browser_download_url)" -ForegroundColor Green
Write-Host "  Size:    $([math]::Round($apkSize / 1MB, 2)) MB" -ForegroundColor Green
Write-Host ""
Write-Host "Users can now download the APK from the Releases page." -ForegroundColor Cyan
