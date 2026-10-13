$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression
$assetDir = $PSScriptRoot
$utf8 = [System.Text.UTF8Encoding]::new($false)
function Write-Json($path, $data) {
    [System.IO.File]::WriteAllText($path, (($data | ConvertTo-Json -Depth 12) + "`n"), $utf8)
}
function Hash-Stream($stream) {
    $algorithm = [System.Security.Cryptography.SHA256]::Create()
    try { return [System.Convert]::ToHexString($algorithm.ComputeHash($stream)).ToLowerInvariant() }
    finally { $algorithm.Dispose() }
}
$pngFiles = @(Get-ChildItem -LiteralPath $assetDir -Recurse -File -Filter '*.png' | Sort-Object FullName)
if ($pngFiles.Count -ne 6) { throw "Expected four final images and two reference PNGs; found $($pngFiles.Count)" }
$imageRows = @()
foreach ($file in $pngFiles) {
    $relative = [System.IO.Path]::GetRelativePath($assetDir, $file.FullName).Replace('\', '/')
    $bitmap = [System.Drawing.Image]::FromFile($file.FullName)
    try {
        if ($bitmap.RawFormat.Guid -ne [System.Drawing.Imaging.ImageFormat]::Png.Guid) { throw "Not PNG: $relative" }
        if ($bitmap.Width -lt 1000 -or $bitmap.Height -lt 700) { throw "Unexpected dimensions: $relative" }
        $imageRows += [ordered]@{
            file = $relative; width = $bitmap.Width; height = $bitmap.Height
            bytes = $file.Length; sha256 = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
            role = $(if ($relative.StartsWith('references/')) { 'reference only' } else { 'selected concept draft' })
            decoded = $true
        }
    } finally { $bitmap.Dispose() }
}
$provenance = Get-Content -LiteralPath (Join-Path $assetDir 'provenance.json') -Raw | ConvertFrom-Json
foreach ($source in $provenance.inputs) {
    $actualHash = (Get-FileHash -LiteralPath (Join-Path $assetDir $source.file) -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualHash -ne $source.sha256) { throw "Input provenance hash mismatch: $($source.file)" }
}
foreach ($item in $provenance.workflow) {
    $actualHash = (Get-FileHash -LiteralPath (Join-Path $assetDir $item.saved_file) -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualHash -ne $item.sha256) { throw "Output provenance hash mismatch: $($item.saved_file)" }
}
Write-Json (Join-Path $assetDir 'image_verification.json') ([ordered]@{ ticket = 'T023'; decoded_pngs = $imageRows.Count; images = $imageRows })
$excluded = @('festival_phase2_handoff_v01.zip', 'package_verification.json', 'manifest.json')
$payload = @(Get-ChildItem -LiteralPath $assetDir -Recurse -File | Where-Object { $_.Name -notin $excluded } | Sort-Object FullName)
$manifestRows = @($payload | ForEach-Object { [ordered]@{
    file = [System.IO.Path]::GetRelativePath($assetDir, $_.FullName).Replace('\', '/')
    bytes = $_.Length; sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
} })
Write-Json (Join-Path $assetDir 'manifest.json') ([ordered]@{ ticket = 'T023'; files = $manifestRows; excludes = $excluded })
$payload += Get-Item -LiteralPath (Join-Path $assetDir 'manifest.json')
if ($payload.Count -ne 16) { throw "Expected 16 package files; found $($payload.Count)" }
$zipPath = Join-Path $assetDir 'festival_phase2_handoff_v01.zip'
$outStream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)
$archive = [System.IO.Compression.ZipArchive]::new($outStream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($file in $payload) {
        $relative = [System.IO.Path]::GetRelativePath($assetDir, $file.FullName).Replace('\', '/')
        $entry = $archive.CreateEntry($relative, [System.IO.Compression.CompressionLevel]::Optimal)
        $entryStream = $entry.Open()
        $inputStream = [System.IO.File]::OpenRead($file.FullName)
        try { $inputStream.CopyTo($entryStream) } finally { $inputStream.Dispose(); $entryStream.Dispose() }
    }
} finally { $archive.Dispose(); $outStream.Dispose() }
$inStream = [System.IO.File]::OpenRead($zipPath)
$archive = [System.IO.Compression.ZipArchive]::new($inStream, [System.IO.Compression.ZipArchiveMode]::Read)
$checked = @()
try {
    if ($archive.Entries.Count -ne $payload.Count) { throw 'ZIP member count mismatch' }
    foreach ($file in $payload) {
        $relative = [System.IO.Path]::GetRelativePath($assetDir, $file.FullName).Replace('\', '/')
        $entry = $archive.GetEntry($relative)
        if ($null -eq $entry -or $entry.Length -ne $file.Length) { throw "ZIP missing/size mismatch: $relative" }
        $entryStream = $entry.Open()
        try { $actualHash = Hash-Stream $entryStream } finally { $entryStream.Dispose() }
        $expectedHash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actualHash -ne $expectedHash) { throw "ZIP hash mismatch: $relative" }
        $checked += [ordered]@{ file = $relative; bytes = $file.Length; sha256 = $actualHash; pass = $true }
    }
} finally { $archive.Dispose(); $inStream.Dispose() }
Write-Json (Join-Path $assetDir 'package_verification.json') ([ordered]@{
    ticket = 'T023'; result = 'PASS'; entries_checked = $checked.Count
    zip_bytes = (Get-Item -LiteralPath $zipPath).Length
    zip_sha256 = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
    members = $checked
})
Write-Output "PASS: $($imageRows.Count) PNGs decoded, provenance hashes valid, $($checked.Count) ZIP entries verified."
$imageRows | ForEach-Object { [pscustomobject]$_ } | Select-Object file, width, height, bytes | Format-Table -AutoSize
