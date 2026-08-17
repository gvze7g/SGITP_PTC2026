param(
  [int]$Port = 4000
)

$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

foreach ($connection in $connections) {
  $processId = $connection.OwningProcess

  if ($processId -and $processId -ne $PID) {
    Write-Host "Freeing port $Port from process $processId"
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  }
}
