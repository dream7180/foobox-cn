@echo off
rem switch to 1=github 2=gitee
set a=0
set b=0
set c=0
if exist .github set /a a=1
if exist .gitee set /a b=2
set /a c=%a%+%b%
if %c%==1 (
	rename .git .gitee
	rename .github .git
) else (
	if %c%==2 (
		rename .git .github
		rename .gitee .git
	)
)