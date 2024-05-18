$myRelativePath = (Get-Item .).FullName + './.exemple.env'

$destinationPath = (Get-Item .).FullName + './.env'

Copy-Item -Path $myRelativePath -Destination $destinationPath -Verbose