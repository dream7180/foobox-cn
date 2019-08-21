@Echo Off
Title Mp3Tag 
Pushd %~dp0
if /i "%PROCESSOR_IDENTIFIER:~0,3%" == "X86" goto x86
if /i "%PROCESSOR_IDENTIFIER:~0,3%" NEQ "X86" goto x64
:x86
regsvr32 /s Mp3tagShell32.dll
exit
:x64
regsvr32 /s Mp3tagShell64.dll
exit