# Save this as fix-api-v2.ps1
$files = Get-ChildItem -Path "resources\js\components" -Filter "*.jsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove /api/ from all axios calls
    $content = $content -replace "axios\.get\(`/api/", "axios.get(\`/"
    $content = $content -replace "axios\.post\(`/api/", "axios.post(\`/"
    $content = $content -replace "axios\.put\(`/api/", "axios.put(\`/"
    $content = $content -replace "axios\.delete\(`/api/", "axios.delete(\`/"
    $content = $content -replace "axios\.patch\(`/api/", "axios.patch(\`/"
    
    $content = $content -replace 'axios\.get\(`/api/', 'axios.get(`/'
    $content = $content -replace 'axios\.post\(`/api/', 'axios.post(`/'
    $content = $content -replace 'axios\.put\(`/api/', 'axios.put(`/'
    $content = $content -replace 'axios\.delete\(`/api/', 'axios.delete(`/'
    $content = $content -replace 'axios\.patch\(`/api/', 'axios.patch(`/'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "`nDone!"