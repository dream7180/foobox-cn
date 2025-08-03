Unicode true

# Include
!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "GetUserLevel.nsh"

#Var
Var ProfileDir
Var CfgCheckbox
Var noAdmin
Var noConfig
Var initDestination
Var FontDir

#APP
!define FBOX_VER "8.5"
!define BUILD_NUM "1"

# Setup
Name "foobox"
OutFile "foobox_x64.cn.v${FBOX_VER}-win7-${BUILD_NUM}.exe"
# VerInfo
VIProductVersion "${FBOX_VER}.0.${BUILD_NUM}.win7"
VIAddVersionKey "ProductName" "foobox"
VIAddVersionKey "FileDescription" "foobox DUI theme for foobar2000"
VIAddVersionKey "LegalCopyright" "https://github.com/dream7180"
VIAddVersionKey "FileVersion" "${FBOX_VER}"
VIAddVersionKey  "ProductVersion" "${FBOX_VER}"

# Compile
SetCompressor /SOLID lzma
SetCompressorDictSize 32
SetDatablockOptimize on
SetOverwrite try
SetFont "Microsoft Yahei" 9

# Runtime
Caption "安装 foobox 主题 v${FBOX_VER}  到 foobar2000 (x64) [Windows 7 专用版]"
RequestExecutionLevel highest
ShowInstDetails show
DirText "安装程序会自动检测 foobar2000 的安装路径，如果检测不到或要安装到别的 foobar2000 所在目录，请点击 [浏览(B)...] 并选择合适的文件夹。" "" "" "选择 foobar2000 的根目录来安装 $(^NameDA):"
BrandingText "NSIS v3"

# --- MUI Settings Start ---
ReserveFile ".\common\installer\install8.ico"
ReserveFile ".\common\installer\foobox8.bmp"

# MUI
!define MUI_UI_COMPONENTSPAGE_SMALLDESC "${NSISDIR}\Contrib\UIs\modern_smalldesc.exe"
!define MUI_COMPONENTSPAGE_SMALLDESC

# Icon
!define MUI_ICON ".\common\installer\install8.ico"
# Bitmap
!define MUI_WELCOMEFINISHPAGE_BITMAP ".\common\installer\foobox8.bmp"

# - InstallPage -
!define MUI_ABORTWARNING

!define MUI_WELCOMEPAGE_TEXT "\
foobox 是音频播放器 foobar2000 的定制主题，基于默认用户界面 (DUI) 及 JSplitter (Spider Monkey Panel 版) 组件，符合主流软件的审美，扩展功能丰富并保持软件的流畅运行.$\n$\n\
安装 foobox 到 foobar2000 前您应该已安装有 foobar2000 播放器 (64 位版). $\n$\n\
本安装包使用旧版的 JSPlitter(3.6.1.10)，为 Windows 7 专用."

!define MUI_WELCOMEPAGE_LINK "下载 foobar2000 汉化版 by Asion"
!define MUI_WELCOMEPAGE_LINK_LOCATION "https://www.cnblogs.com/asionwu"
!insertmacro MUI_PAGE_WELCOME

# DirectoryPage
!define MUI_PAGE_CUSTOMFUNCTION_PRE Check_Dir
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE Dir_Leave
!define MUI_TEXT_DIRECTORY_SUBTITLE "选择 foobar2000.exe 程序所在的目录来安装 $(^NameDA)。"
!insertmacro MUI_PAGE_DIRECTORY

#extra option page
Page Custom OptionsPageCreate OptionsPageLeave
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE Inst_pre
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_INSTFILES
!define MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) 已经成功安装到 foobar2000。$\r$\nfoobox 的文件和所需组件位于 foobar2000 的程序和用户数据目录，卸载 foobar2000 时可以一并移除。$\r$\n$\r$\n点击 [完成(F)] 关闭安装程序。"
!define MUI_FINISHPAGE_LINK "访问 github 上的 foobox 项目"
!define MUI_FINISHPAGE_LINK_LOCATION "https://github.com/dream7180/foobox-cn"
!insertmacro MUI_PAGE_FINISH
#language
!insertmacro MUI_LANGUAGE "SimpChinese"

# --- Install Section ---
Section "foobox 主题和所需组件" fooboxCore
    SectionIn RO
	
	Delete "$INSTDIR\themes\foobox*.fth"
	
	SetOutPath "$INSTDIR\themes"
	File ".\cn\xcommon\themes\*.*"
	File ".\cn\x64\themes\*.*"
	
	SetOutPath "$ProfileDir\foobox"
	File /r ".\cn\xcommon\foobox\*.*"
	
	SetOutPath "$ProfileDir\user-components-x64\foo_enhanced_spectrum_analyzer"
	File ".\cn\x64\profile\user-components-x64\foo_enhanced_spectrum_analyzer\foo_enhanced_spectrum_analyzer.dll"
	
	SetOutPath "$ProfileDir\user-components-x64\foo_playcount"
	File ".\cn\x64\profile\user-components-x64\foo_playcount\foo_playcount.dll"
	
	SetOutPath "$ProfileDir\user-components-x64\foo_uie_jsplitter"
	File ".\cn\win7\jsplitter-x64\*.*"
	
	SetOutPath "$ProfileDir\user-components-x64\foo_uie_eslyric"
	File /r ".\cn\xcommon\foo_uie_eslyric\*.*"
	
	SetOutPath "$ProfileDir\user-components-x64\foo_uie_jsplitter"
	File /r ".\common\foo_uie_jsplitter\*.*"

	SetOutPath "$ProfileDir\user-components-x64\foo_uie_eslyric"
	File ".\common\eslyric\x64\legacy\foo_uie_eslyric.dll"
	
	SetOutPath "$ProfileDir\user-components-x64\foo_openhacks"
	File ".\common\foo_openhacks\x64\foo_openhacks.dll"
	
	SetOutPath "$ProfileDir\configuration"
	File ".\common\foo_openhacks\x64\foo_openhacks.dll.cfg"

	SetOutPath "$ProfileDir\foobox\script\html"
	File ".\common\scriptWin7\styles.css"
	
	SetOutPath "$ProfileDir\user-components-x64\foo_uie_jsplitter\samples\packages"
	File /r ".\cn\xcommon\biography-package\*.*"
	
	${If} $noConfig = 0
		SetOutPath "$ProfileDir"
		File ".\cn\x64\profile\theme.fth"
	${EndIf}
	; install font
	Call CheckFontA
	${If} $FontDir != "NOINST"
		Call CheckFontU
	${EndIf}
	;MessageBox MB_OK "Fontdir is $FontDir."
	${If} $FontDir != "NOINST"
		SetOutPath "$FontDir"
		File ".\common\fontawesome-webfont.ttf"
	
		System::Call "gdi32::AddFontResource(t '$FontDir\fontawesome-webfont.ttf')"

		Push '$FontDir\fontawesome-webfont.ttf'
		Call GetFontName
		Pop $R0

		${If} $R0 != 'error'
			${If} $noAdmin = 0
				WriteRegStr HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" '$R0 (TrueType)' 'fontawesome-webfont.ttf'
			${Else}
				WriteRegStr HKCU "SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" '$R0 (TrueType)' '$FontDir\fontawesome-webfont.ttf'
			${EndIf}
		${Else}
			System::Call "gdi32::RemoveFontResource(t '$FontDir\fontawesome-webfont.ttf')"
		${EndIf} 
	${EndIf}
SectionEnd

Section "文件格式图标" Icons
	SetOutPath "$INSTDIR\icons"
	File /r ".\common\icons\*.*"
SectionEnd

Section /o "写入 Last.fm 到 hosts" LastfmHosts
	SetOutPath "$INSTDIR"
	File ".\common\lastfmhosts.bat"
	nsExec::Exec "$INSTDIR\lastfmhosts.bat"
SectionEnd

Section -Post
    # 获取安装目录读写权限
    AccessControl::GrantOnFile "$INSTDIR" "(BU)" "FullAccess"
	Delete "$INSTDIR\lastfmhosts.bat"
SectionEnd

Function .onInit
	System::Call 'SHCore::SetProcessDpiAwareness(i 1)i.R0'
	StrCpy $InstDir $initDestination
	
	# 创建互斥防止重复运行
    System::Call `kernel32::CreateMutex(i0,i0,t"foobox_installer")i.r1?e`
    Pop $R0
    StrCmp $R0 0 +3
    MessageBox MB_OK|MB_ICONEXCLAMATION "安装程序已经运行!"
    Abort
FunctionEnd

Function .onVerifyInstDir
	IfFileExists $INSTDIR\foobar2000.exe PathGood
    Abort
	PathGood:
	IfFileExists $INSTDIR\vcruntime140_1.dll +3 0
	MessageBox MB_OK|MB_ICONEXCLAMATION "检测到该版本的 foobar2000 为 32 位程序，不适合本安装!"
	Abort
FunctionEnd

Function Check_Dir
SetShellVarContext current
${If} $initDestination != ""
	StrCpy $InstDir $initDestination
${Else}
	SetRegView 64
	ReadRegStr $INSTDIR HKLM "Software\foobar2000" "InstallDir"
${EndIf}
FunctionEnd

Function Dir_Leave
	StrCpy $ProfileDir "$APPDATA\foobar2000-v2"
	IfFileExists $INSTDIR\portable_mode_enabled 0 +2
	StrCpy $ProfileDir "$InstDir\profile"
FunctionEnd

Function OptionsPageCreate
#Call CheckWinver
Call CheckUser
StrCpy $initDestination $InstDir ; If the user clicks BACK on the directory page we will remember their mode specific directory
!insertmacro MUI_HEADER_TEXT "选项及注意事项" "重要提示: 此版本需要 64 位的 foobar2000."
nsDialogs::Create 1018
${NSD_CreateLabel} 10u 0u 90% 10u "安装或升级 foobox 不会更改 foobar2000 的核心设置，可放心覆盖."

IfFileExists $INSTDIR\icons\*.* +3 0
	SectionSetFlags ${Icons} 0
	SectionSetText ${Icons} ""
	
${If} $noAdmin = 1
	SectionSetFlags ${LastfmHosts} 0
	SectionSetText ${LastfmHosts} ""
${EndIf}
${NSD_CreateCheckbox} 10u 30u 90% 10u "不安装主题配置文件"
Pop $CfgCheckbox
${If} $noConfig = 1
	${NSD_Check} $CfgCheckbox
${EndIf}
${NSD_CreateLabel} 20u 40u 90% 20u "如果勾选, theme.fth 文件将不会安装. 谨慎, 不确定勿勾选!"
;EnableWindow $CfgCheckbox 0
nsDialogs::Show
FunctionEnd

Function OptionsPageLeave
${NSD_GetState} $CfgCheckbox $0
${If} $0 = ${BST_CHECKED}
    StrCpy $noConfig 1
${Else}
	StrCpy $noConfig 0
${EndIf}
FunctionEnd

Function Inst_pre
ExecWait "$\"$INSTDIR\foobar2000.exe$\" /quiet /quit"
FunctionEnd

Function CheckUser
Pop $0
Pop $R0
ReadEnvStr $R0 "USERNAME"
${GetUserLevel} $0 $R0
${If} $0 != 2
	StrCpy $noAdmin 1
	StrCpy $FontDir "$PROFILE\AppData\Local\Microsoft\Windows\Fonts"
${Else}
	StrCpy $noAdmin 0
	StrCpy $FontDir "$FONTS"
${EndIf}
FunctionEnd

Function CheckFontA
Pop $0
ClearErrors
ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" "FontAwesome (TrueType)"
IfErrors INSTOK 0
${IF} $0 != ""
	StrCpy $FontDir "NOINST"
${ENDIF}
INSTOK:
FunctionEnd

Function CheckFontU
Pop $0
ClearErrors
ReadRegStr $0 HKCU "SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" "FontAwesome (TrueType)"
IfErrors INSTOK 0
${IF} $0 != ""
	StrCpy $FontDir "NOINST"
${ENDIF}
INSTOK:
FunctionEnd

Function GetFontName
    Exch $R0
    Push $R1
    Push $R2

    System::Call *(i${NSIS_MAX_STRLEN})i.R1
    System::Alloc ${NSIS_MAX_STRLEN}
    Pop $R2
    System::Call gdi32::GetFontResourceInfoW(wR0,iR1,iR2,i1)i.R0
    ${If} $R0 == 0
    StrCpy $R0 error
    ${Else} 
    System::Call *$R2(&w${NSIS_MAX_STRLEN}.R0)
    ${EndIf}
    System::Free $R1
    System::Free $R2

    Pop $R2
    Pop $R1
    Exch $R0
FunctionEnd

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
	!insertmacro MUI_DESCRIPTION_TEXT ${fooboxCore} "foobox DUI 主题的文件和所需组件."
	!insertmacro MUI_DESCRIPTION_TEXT ${Icons} "替换文件格式关联图标为 foobox 主题的图标."
	!insertmacro MUI_DESCRIPTION_TEXT ${LastfmHosts} "把 Last.fm 地址写入 hosts, 让简介面板能下载图片 (可用性不确定)."
!insertmacro MUI_FUNCTION_DESCRIPTION_END
