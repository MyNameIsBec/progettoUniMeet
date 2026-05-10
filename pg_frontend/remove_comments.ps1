$dir = "c:\Users\dario\Desktop\progettoUniMeet\pg_frontend\src"

Write-Host "Rimuovo commenti HTML..."
Get-ChildItem -Path $dir -Recurse -Filter *.html | ForEach-Object {
    $c = [System.IO.File]::ReadAllText($_.FullName)
    $nc = $c -replace '(?s)\s*<!--.*?-->', ''
    if ($c -ne $nc) {
        [System.IO.File]::WriteAllText($_.FullName, $nc)
    }
}

Write-Host "Rimuovo commenti SCSS..."
Get-ChildItem -Path $dir -Recurse -Filter *.scss | ForEach-Object {
    $c = [System.IO.File]::ReadAllText($_.FullName)
    # Rimuovi commenti a blocco
    $nc = $c -replace '(?s)/\*.*?\*/\r?\n?', ''
    # Rimuovi commenti a linea singola
    $nc = $nc -replace '(?m)^\s*//.*$\r?\n', ''
    if ($c -ne $nc) {
        [System.IO.File]::WriteAllText($_.FullName, $nc)
    }
}

Write-Host "Rimuovo commenti TS..."
Get-ChildItem -Path $dir -Recurse -Filter *.ts | ForEach-Object {
    $c = [System.IO.File]::ReadAllText($_.FullName)
    # Rimuovi commenti a blocco
    $nc = $c -replace '(?s)/\*.*?\*/\r?\n?', ''
    # Rimuovi commenti a linea singola (escludendo ///)
    $nc = $nc -replace '(?m)^\s*//(?!/).*$\r?\n', ''
    if ($c -ne $nc) {
        [System.IO.File]::WriteAllText($_.FullName, $nc)
    }
}

Write-Host "Fatto."
