param(
  [Parameter(Mandatory=$true)][ValidateSet('status','enable','disable')][string]$Mode,
  [string]$Executable,
  [string]$Entry,
  [string]$WorkingDirectory
)
$ErrorActionPreference='Stop'
$taskName='Sakinah Prayer Background'
$existing=Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if($Mode -eq 'status'){
  if($existing -and $existing.State -ne 'Disabled'){'true'}else{'false'}
  exit 0
}
if($Mode -eq 'disable'){
  if($existing){Unregister-ScheduledTask -TaskName $taskName -Confirm:$false}
  Remove-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'Sakinah.Local.Prayer' -ErrorAction SilentlyContinue
  'false'
  exit 0
}
if(-not $Executable -or -not (Test-Path -LiteralPath $Executable)){throw 'Sakinah executable is missing'}
if($Entry -and -not (Test-Path -LiteralPath $Entry)){throw 'Sakinah entry file is missing'}
if(-not $WorkingDirectory -or -not (Test-Path -LiteralPath $WorkingDirectory)){throw 'Sakinah working directory is missing'}
$arguments=if($Entry){'"'+$Entry+'" --no-open'}else{'--no-open'}
$action=New-ScheduledTaskAction -Execute $Executable -Argument $arguments -WorkingDirectory $WorkingDirectory
$user=[Security.Principal.WindowsIdentity]::GetCurrent().Name
$trigger=New-ScheduledTaskTrigger -AtLogOn -User $user
$principal=New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
$settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero)
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Remove-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'Sakinah.Local.Prayer' -ErrorAction SilentlyContinue
'true'
