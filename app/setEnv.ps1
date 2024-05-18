$myRelativePath = (Get-Item .).FullName + './.exemple.env'

$destinationPath = (Get-Item .).FullName + './.env'

Copy-Item -Path $myRelativePath -Destination $destinationPath -Verbose

$IpAddress = (Get-NetIPConfiguration |
  Where-Object {
    $_.IPv4DefaultGateway -ne $null -and 
    $_.NetAdapter.status -ne 'Disconnected'
  }
).IPv4Address.IPAddress

$ip = "http://$($IpAddress):3000"

Get-ChildItem $destinationPath -Recurse | ForEach {
      (Get-Content $_) | ForEach  {$_ -Replace "{{API_URL}}", $ip} | Set-Content $_
}