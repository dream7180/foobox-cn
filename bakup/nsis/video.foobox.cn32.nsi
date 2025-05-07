Unicode true

# Include
!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "GetUserLevel.nsh"

#Var
Var PortableMode
Var ProfileDir
Var VersionCheckbox
Var CfgCheckbox
Var noAdmin
Var noConfig
Var initDestination
Var initVersion

#APP
!define /date ComplieTime "%y%m%d"
!define FBOX_VER "8"
!define VER_DATE "20${ComplieTime}"
!define BUILD_NUM "1"

# Setup
Name "foobox 视频面板"
OutFile "foobox8-video_x86.cn.${VER_DATE}.exe"
# VerInfo
VIProductVersion "${VER_DATE}.0.0.${BUILD_NUM}"
VIAddVersionKey "ProductName" "foobox video"
VIAddVersionKey "FileDescription" "video panels for foobox theme of foobar2000"
VIAddVersionKey "LegalCopyright" "https://github.com/dream7180"
VIAddVersionKey "FileVersion" "${VER_DATE}"
VIAddVersionKey  "ProductVersion" "${VER_DATE}.0"

# Compile
SetCompressor /SOLID lzma
SetCompressorDictSize 32
SetDatablockOptimize on
SetOverwrite try
SetFont "Microsoft Yahei" 9

# Runtime
Caption "安装视频组件和布局到 foobox v${FBOX_VER} 主题"
RequestExecutionLevel highest
ShowInstDetails show
DirText "安装程序会自动检测 foobar2000 的安装路径，如果检测不到或要安装到别的 foobar2000 所在目录，请点击 [浏览(B)...] 并选择合适的文件夹。" "" "" "选择 foobar2000 的根目录来安装 $(^NameDA):"
BrandingText "NSIS v3"

# --- MUI Settings Start ---
ReserveFile ".\common\installer\installer.ico"
ReserveFile ".\common\installer\boxvideo.bmp"

# MUI
!define MUI_UI_COMPONENTSPAGE_SMALLDESC "${NSISDIR}\Contrib\UIs\modern_smalldesc.exe"
!define MUI_COMPONENTSPAGE_SMALLDESC

# Icon
!define MUI_ICON ".\common\installer\installer.ico"
# Bitmap
!define MUI_WELCOMEFINISHPAGE_BITMAP ".\common\installer\boxvideo.bmp"

# - InstallPage -
!define MUI_ABORTWARNING

!define MUI_WELCOMEPAGE_TEXT "\
本程序将安装额外的视频面板及其支持组件到集成有 foobox 主题 (x86) 的 foobar2000 音频播放器.$\n$\n\
本程序不包含 foobar2000 程序及 foobox 主题，安装前您应该已安装有 foobar2000 播放器 (x86版) 并整合了 foobox 主题."

!define MUI_WELCOMEPAGE_LINK "访问 github 上的 foobox 项目"
!define MUI_WELCOMEPAGE_LINK_LOCATION "https://github.com/dream7180/foobox-cn"
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
!define MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) 已经成功安装到 foobar2000。$\r$\n文件和组件位于 foobar2000 的程序和用户数据目录，卸载 foobar2000 时可以一并移除。$\r$\n$\r$\n你现在可以在 foobar2000 主菜单“视图 - 布局 - 快速设置”里找到带视频面板的布局。$\r$\n$\r$\n点击 [完成(F)] 关闭安装程序。"
!define MUI_FINISHPAGE_LINK "访问 github 上的 foobox 项目"
!define MUI_FINISHPAGE_LINK_LOCATION "https://github.com/dream7180/foobox-cn"
!insertmacro MUI_PAGE_FINISH
#language
!insertmacro MUI_LANGUAGE "SimpChinese"

# --- Install Section ---

Section "foo_input_ffmpeg 解码器封装组件" fooffmpeg
	SectionIn RO
	SetOutPath "$ProfileDir\user-components\foo_input_ffmpeg"
	File ".\cn\vx86\profile\user-components\foo_input_ffmpeg\*.*"
	${If} $noConfig = 0
		SetOutPath "$ProfileDir\configuration"
		File ".\cn\vxcommon\profile\configuration\foo_input_ffmpeg.dll.cfg"
	${EndIf}
	SetOutPath "$INSTDIR\encoders\ffmpeg"
	File /r ".\common\vx86\profile\foo_youtube\ffmpeg\*.*"
	Delete "$INSTDIR\themes\foobox*.fth"
SectionEnd

Section "视频面板 foo-youtube" VideoYoutube
	;SectionIn 2
	
	;remove old version files
	#IfFileExists "$INSTDIR\encoders\LAVFilters" 0 +6
	#${If} $noAdmin = 0
	#	UnRegDLL "$INSTDIR\encoders\LAVFilters\LAVSplitter.ax"
	#	UnRegDLL "$INSTDIR\encoders\LAVFilters\LAVVideo.ax"
	#	UnRegDLL "$INSTDIR\encoders\LAVFilters\LAVAudio.ax"
	#${EndIf}
	#RMDir /r "$INSTDIR\encoders"
	#RMDir /r "$ProfileDir\foo_youtube"
	;install new file
	SetOutPath "$ProfileDir\user-components\foo_youtube"
	File ".\common\vx86\profile\user-components\foo_youtube\*.*"
	File ".\common\vxcommon\foo_youtube\*.*"
	${If} $noConfig = 0
		SetOutPath "$ProfileDir"
		File ".\cn\vx86\profile\theme.fth"
		SetOutPath "$ProfileDir\configuration"
		${If} $noAdmin = 0
			File /oname=foo_youtube.dll.cfg ".\cn\vxcommon\profile\configuration\foo_youtube_admin.dll.cfg"
		${Else}
			File /oname=foo_youtube.dll.cfg ".\cn\vxcommon\profile\configuration\foo_youtube_noadmin.dll.cfg"
		${EndIf}
	${EndIf}
	SetOutPath "$INSTDIR\themes"
	File ".\cn\vx86\themes\foobox8 + 简介 + 视频(youtube).fth"
	File ".\cn\vx86\themes\foobox8 + 视频(youtube).fth"
	SetOutPath "$ProfileDir\foo_youtube"
	File /r ".\common\vx86\profile\foo_youtube\*.*"
	File /r ".\cn\vx86\profile\foo_youtube\*.*"
	File ".\common\vxcommon\youtube-dl.exe"
	${If} $noAdmin = 0
		ExecWait '"$SYSDIR\regsvr32.exe" /s "$ProfileDir\foo_youtube\LAVFilters\LAVSplitter.ax"'
		ExecWait '"$SYSDIR\regsvr32.exe" /s "$ProfileDir\foo_youtube\LAVFilters\LAVVideo.ax"'
		ExecWait '"$SYSDIR\regsvr32.exe" /s "$ProfileDir\foo_youtube\LAVFilters\LAVAudio.ax"'
	${EndIf}
	SetOutPath "$INSTDIR"
	${If} $PortableMode = 0
        File "/oname=LavFilters助手.bat" ".\cn\vxcommon\lavassist\LavFilters助手_0.bat"
	${ElseIf} $PortableMode = 1
        File "/oname=LavFilters助手.bat" ".\cn\vxcommon\lavassist\LavFilters助手_1.bat"
	${Else}
		File "/oname=LavFilters助手.bat" ".\cn\vxcommon\lavassist\LavFilters助手_2.bat"
    ${EndIf}
SectionEnd

Section /o "视频面板 foo-mpv" VideoMPV
	SetOutPath "$ProfileDir\user-components\foo_mpv"
	File /r ".\cn\vx86\profile\user-components\foo_mpv\*.*"
	${If} $noConfig = 0
		SetOutPath "$ProfileDir\configuration"
		File ".\cn\vxcommon\profile\configuration\foo_mpv.dll.cfg"
	${EndIf}
	SetOutPath "$INSTDIR\themes"
	File ".\cn\vx86\themes\foobox8 + 简介 + 视频(mpv).fth"
	File ".\cn\vx86\themes\foobox8 + 视频(mpv).fth"
	SetOutPath "$ProfileDir\mpv"
	File /r ".\cn\vxcommon\profile\mpv\*.*"
SectionEnd

/*
Section -Post
    # 获取安装目录读写权限
    AccessControl::GrantOnFile "$INSTDIR" "(BU)" "FullAccess"
	Delete "$INSTDIR\lastfmhosts.bat"
SectionEnd
*/
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
FunctionEnd

Function Check_Dir
SetShellVarContext current
${If} $initDestination != ""
	StrCpy $InstDir $initDestination
${Else}
	ReadRegStr $INSTDIR HKLM "Software\foobar2000" "InstallDir"
${EndIf}
FunctionEnd

Function Dir_Leave
	StrCpy $PortableMode 0
	IfFileExists $INSTDIR\portable_mode_enabled 0 +2
	StrCpy $PortableMode 1
	${If} $PortableMode = 0
		StrCpy $ProfileDir "$APPDATA\foobar2000-v2"
	${Else}
		StrCpy $ProfileDir "$InstDir\profile"
	${EndIf}
FunctionEnd

Function OptionsPageCreate
Call CheckUser
StrCpy $initDestination $InstDir ; If the user clicks BACK on the directory page we will remember their mode specific directory
!insertmacro MUI_HEADER_TEXT "选项及注意事项" "重要提示: 务必先安装 32 位版本的 foobar2000 及 foobox 主题."
nsDialogs::Create 1018
${NSD_CreateLabel} 10u 0u 90% 10u "安装或升级视频组件和布局不会更改 foobar2000 的核心设置，可放心覆盖."

${If} $noAdmin = 1
	;SectionSetFlags ${LastfmHosts} 0
	;SectionSetText ${LastfmHosts} ""
	${NSD_CreateLabel} 10u 15u 90% 20u "* 您没有管理员权限，一些次要设定会被忽略，这并不影响向 foobar2000 添加视频播放支持."
${EndIf}
${NSD_CreateCheckbox} 10u 40u 90% 10u "安装到 foobar2000 1.x 版"
Pop $VersionCheckbox
${If} $initVersion = "1"
	${NSD_Check} $VersionCheckbox
${EndIf}
${NSD_CreateLabel} 20u 50u 90% 20u "如果您是给旧版的 foobar2000 v1.x 安装 foobox, 请务必勾选此项."
${NSD_CreateCheckbox} 10u 80u 90% 10u "不安装任何配置文件"
Pop $CfgCheckbox
${If} $noConfig = 1
	${NSD_Check} $CfgCheckbox
${EndIf}
${NSD_CreateLabel} 20u 92u 90% 30u "如果勾选, 视频组件 input_ffmpeg, foo_youtube, foo_mpv 的 cfg 文件将不会安装. 谨慎, 不确定请勿勾选!"
nsDialogs::Show
FunctionEnd

Function OptionsPageLeave
${NSD_GetState} $VersionCheckbox $0
${If} $0 = ${BST_CHECKED}
	StrCpy $initVersion "1"
	StrCpy $PortableMode 1
	IfFileExists $INSTDIR\user_profiles_enabled 0 +2
		StrCpy $PortableMode 2
	${If} $PortableMode = 2
		StrCpy $ProfileDir "$APPDATA\foobar2000"
	${Else}
		StrCpy $ProfileDir "$InstDir\profile"
	${EndIf}
${Else}
	StrCpy $initVersion "2"
${EndIf}
${NSD_GetState} $CfgCheckbox $0
${If} $0 = ${BST_CHECKED}
    StrCpy $noConfig 1
${Else}
	StrCpy $noConfig 0
${EndIf}
FunctionEnd

Function Inst_pre
IfFileExists $ProfileDir\foobox PathGood
MessageBox MB_OK "foobar2000 里未找到 foobox 主题，请取消本安装并先下载和安装 foobox 主题！"
Abort
PathGood:
ExecWait "$\"$INSTDIR\foobar2000.exe$\" /quiet /quit"
FunctionEnd

Function CheckUser
Pop $0
Pop $R0
ReadEnvStr $R0 "USERNAME"
${GetUserLevel} $0 $R0
${If} $0 != 2
	StrCpy $noAdmin 1
${Else}
	StrCpy $noAdmin 0
${EndIf}
FunctionEnd

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
	!insertmacro MUI_DESCRIPTION_TEXT ${fooffmpeg} "封装和调用自定义的 ffmpeg 解码器, 以使 foobar2000 能识别和播放视频格式."
	!insertmacro MUI_DESCRIPTION_TEXT ${VideoYoutube} "foo-youtube 视频组件及面板布局及其附加程序."
	!insertmacro MUI_DESCRIPTION_TEXT ${VideoMPV} "foo-mpv 视频组件及面板布局."
!insertmacro MUI_FUNCTION_DESCRIPTION_END
