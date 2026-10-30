$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Device
$watcher=New-Object System.Device.Location.GeoCoordinateWatcher
try {
  $watcher.Start($false)
  $limit=[DateTime]::UtcNow.AddSeconds(12)
  while($watcher.Position.Location.IsUnknown -and $watcher.Permission -ne 'Denied' -and [DateTime]::UtcNow -lt $limit){Start-Sleep -Milliseconds 200}
  if($watcher.Permission -eq 'Denied'){throw 'LOCATION_DENIED'}
  if($watcher.Position.Location.IsUnknown){throw 'LOCATION_UNAVAILABLE'}
  $p=$watcher.Position.Location
  @{latitude=$p.Latitude;longitude=$p.Longitude;accuracy=$p.HorizontalAccuracy} | ConvertTo-Json -Compress
} catch { @{error=$_.Exception.Message} | ConvertTo-Json -Compress;exit 1 }
finally {$watcher.Stop();$watcher.Dispose()}
