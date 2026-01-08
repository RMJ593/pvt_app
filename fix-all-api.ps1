# Fix all /api/ prefixes in components
$files = Get-ChildItem -Path "resources\js\components" -Filter "*.jsx" -Recurse

$totalFixed = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove /api/ from all axios calls with backticks
    $content = $content -replace 'axios\.get\(`/api/', 'axios.get(`/'
    $content = $content -replace 'axios\.post\(`/api/', 'axios.post(`/'
    $content = $content -replace 'axios\.put\(`/api/', 'axios.put(`/'
    $content = $content -replace 'axios\.delete\(`/api/', 'axios.delete(`/'
    $content = $content -replace 'axios\.patch\(`/api/', 'axios.patch(`/'
    
    # Remove /api/ from all axios calls with single quotes
    $content = $content -replace "axios\.get\('/api/", "axios.get('/"
    $content = $content -replace "axios\.post\('/api/", "axios.post('/"
    $content = $content -replace "axios\.put\('/api/", "axios.put('/"
    $content = $content -replace "axios\.delete\('/api/", "axios.delete('/"
    $content = $content -replace "axios\.patch\('/api/", "axios.patch('/"
    
    # Remove /api/ from all axios calls with double quotes
    $content = $content -replace 'axios\.get\("/api/', 'axios.get("/'
    $content = $content -replace 'axios\.post\("/api/', 'axios.post("/'
    $content = $content -replace 'axios\.put\("/api/', 'axios.put("/'
    $content = $content -replace 'axios\.delete\("/api/', 'axios.delete("/'
    $content = $content -replace 'axios\.patch\("/api/', 'axios.patch("/'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)"
        $totalFixed++
    }
}

Write-Host "`nDone! Fixed $totalFixed files."