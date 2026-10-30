!macro customUnInstall
  nsExec::ExecToLog 'schtasks.exe /Delete /TN "Sakinah Prayer Background" /F'
!macroend
