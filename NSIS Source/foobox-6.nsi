; 该脚本使用 HM VNISEdit 脚本编辑器向导产生

; 安装程序初始定义常量
SetFont "Tahoma" 9
!define FB2K_VER "1.4.8"
!define FBOX_VER "6.1.4.8"
!define /date FBOX_YEAR %Y
!define Name "foobar2000"
!define PRODUCT_NAME "foobox"
!define PRODUCT_VERSION "${FBOX_VER}"
!define PRODUCT_PUBLISHER "dreamawake"
!define PRODUCT_WEB_SITE "http://blog.sina.com.cn/dream7180"

SetCompressor /SOLID lzma

ReserveFile "${NSISDIR}\Plugins\x86-ansi\FindProcDLL.dll"
ReserveFile "${NSISDIR}\Plugins\x86-ansi\KillProcDLL.dll"
ReserveFile "${NSISDIR}\Plugins\\x86-ansi\UAC.dll"
ReserveFile "${NSISDIR}\Plugins\x86-ansi\Time.dll"

; ------ MUI 现代界面定义 (1.67 版本以上兼容) ------
!include "MUI.nsh"
; MUI 预定义常量
!define MUI_ABORTWARNING
!define MUI_ICON "resource\setup.ico"
!define MUI_UNICON "resource\uninstalll.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "resource\modern-wizard.bmp"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "resource\modern-header.bmp"
!define MUI_WELCOMEPAGE_TEXT "	foobar2000 是一个 Windows 平台下的高级音频播放器，支持多种音频格式播放和转换及第三方组件扩展。foobox 是基于 foobar2000 汉化版（当前版本 ${FB2K_VER}）的 CUI 界面配置，系统应不低于 Windows Vista 并安装 DirectX 9.0（若选装 Milkdrop2 可视化插件）。"
!define MUI_COMPONENTSPAGE_NODESC
; 欢迎页面
!insertmacro MUI_PAGE_WELCOME
; 许可协议页面
!insertmacro MUI_PAGE_LICENSE "resource\Licence.rtf"
; 组件选择页面
!insertmacro MUI_PAGE_COMPONENTS
; 安装目录选择页面
!insertmacro MUI_PAGE_DIRECTORY
; 安装过程页面
!insertmacro MUI_PAGE_INSTFILES
; 安装完成页面
!define MUI_FINISHPAGE_RUN "$INSTDIR\foobar2000.exe"
;!define MUI_UNCONFIRMPAGE_TEXT_TOP "从你的计算机删除 ${PRODUCT_NAME}"
;!define MUI_UNCONFIRMPAGE_TEXT_LOCATION "卸载目录"

!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; 安装界面包含的语言设置
!insertmacro MUI_LANGUAGE "SimpChinese"

;文件版本声明
  VIProductVersion "${FBOX_VER}.0.0"
  VIAddVersionKey /LANG=2052 "ProductName" PRODUCT_WEB_SITE
  VIAddVersionKey /LANG=2052 "Comments" "CUI for foobar2000"
  VIAddVersionKey /LANG=2052 "CompanyName" PRODUCT_WEB_SITE
  VIAddVersionKey /LANG=2052 "LegalTrademarks" "foobar2000"
  VIAddVersionKey /LANG=2052 "LegalCopyright" "foobar2000.org"
  VIAddVersionKey /LANG=2052 "FileDescription" "foobox CUI skin for foobar2000"
  VIAddVersionKey /LANG=2052 "FileVersion" "${FBOX_VER}.0.0"


; 安装预释放文件
!insertmacro MUI_RESERVEFILE_INSTALLOPTIONS
; ------ MUI 现代界面定义结束 ------

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "${PRODUCT_NAME}-${FBOX_VER}.exe"
;InstallDir "D:\Tools\Foobar2000"
InstallDir "$PROGRAMFILES\foobar2000"
; 如果可能的化从注册表中监测安装路径
;InstallDirRegKey HKLM \
;	"Software\Microsoft\Windows\CurrentVersion\Uninstall\foobar2000" \
;	"UninstallString"
ShowInstDetails show
ShowUnInstDetails show
BrandingText "dreamawake ${FBOX_YEAR}年出品"
RequestExecutionLevel user

!include "Sections.nsh"
!include "WinVer.nsh"
!include UAC.nsh
!include x64.nsh

;========================
InstType "标准安装 (不含可视化插件Milkdrop2)"
InstType "增强安装"
InstType "完全安装"

Section "核心程序组件" CORE
  SectionIn 1 2 3 RO
  SetOutPath "$INSTDIR"
  SetOverwrite on
  File /r "Foobar2000-core\*.*"
WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

SubSection "可选配置文件(升级需保留原配置时勿选)"
Section "foobar2000核心配置文件" CORECFG
	SectionIn 1 2 3
  SetOutPath "$INSTDIR\configuration"
  SetOverwrite on
  File "foobar2000-extra\configuration\Core.cfg"
SectionEnd
Section "ESLyric歌词配置文件" ESLCFG
	SectionIn 1 2 3
  SetOutPath "$INSTDIR\configuration"
  SetOverwrite on
  File "foobar2000-extra\configuration\foo_uie_eslyric.dll.cfg"
SectionEnd
Section "转换器配置文件" CONVCFG
	SectionIn 1 2 3
  SetOutPath "$INSTDIR\configuration"
  SetOverwrite on
  File "foobar2000-extra\configuration\foo_converter.dll.cfg"
SectionEnd
SubSectionEnd

SubSection "额外解码器"

Section "APE 解码器" APE
  SectionIn 1 2 3
	SetOutPath "$INSTDIR\user-components\foo_input_monkey"
  SetOverwrite on
  File "foobar2000-extra\components\foo_input_monkey.dll"
SectionEnd

Section "DTS 解码器" DTS
  SectionIn 1 2 3
	SetOutPath "$INSTDIR\user-components\foo_input_dts"
  SetOverwrite on
  File "foobar2000-extra\components\dts\*.*"
SectionEnd

Section "SACD 解码器" SACD
  SectionIn 1 2 3
	SetOutPath "$INSTDIR\user-components\foo_input_sacd"
  SetOverwrite on
  File /r "foobar2000-extra\components\sacd\*.*"
SectionEnd

Section "DSD 解码器" DSD
  SectionIn 1 2 3
	SetOutPath "$INSTDIR\user-components\foo_dsd_processor"
  SetOverwrite on
  File "foobar2000-extra\components\foo_dsd_processor.dll"
SectionEnd

Section "TTA 解码器" TTA
  SectionIn 1 2 3
	SetOutPath "$INSTDIR\user-components\foo_input_tta"
  SetOverwrite on
  File "foobar2000-extra\components\foo_input_tta.dll"
SectionEnd

Section "TAK 解码器" TAK
  SectionIn 1 2 3
	SetOutPath "$INSTDIR\user-components\foo_input_tak"
  SetOverwrite on
  File "foobar2000-extra\components\tak_deco_lib.dll"
  File "foobar2000-extra\components\foo_input_tak.dll"
SectionEnd

Section "DVD-Audio 解码器" DVDA
  SectionIn 1 2 3
	SetOutPath "$INSTDIR\user-components\foo_input_dvda"
  SetOverwrite on
  File "foobar2000-extra\components\foo_input_dvda.dll"
SectionEnd
SubSectionEnd

SubSection "可选组件"
Section "转换器" CONVERTER
  SectionIn 1 2 3
  SetOutPath "$INSTDIR\components"
  SetOverwrite on
  File "foobar2000-extra\components\foo_converter.dll"
SectionEnd

Section "文件操作" FILEOP
  SectionIn 1 2 3
	SetOutPath "$INSTDIR\components"
  SetOverwrite on
  File "foobar2000-extra\components\foo_fileops.dll"
SectionEnd

Section "压缩包读取器" UNPACK
  SectionIn 1 2 3
	SetOutPath "$INSTDIR\components"
  SetOverwrite on
  File "foobar2000-extra\components\foo_unpack.dll"
SectionEnd

Section "播放增益扫描器" RGSCAN
  SectionIn 1 2 3
	SetOutPath "$INSTDIR\components"
  SetOverwrite on
  File "foobar2000-extra\components\foo_rgscan.dll"
SectionEnd

Section /o "freedb 标签获取器" FREEDB
  SectionIn 2 3
	SetOutPath "$INSTDIR\components"
  SetOverwrite on
  File "foobar2000-extra\components\foo_freedb2.dll"
SectionEnd

Section /o "UPnP\DLNA 支持插件" UPNP
  SectionIn 3
	SetOutPath "$INSTDIR\user-components\foo_upnp"
  SetOverwrite on
  File "foobar2000-extra\components\foo_upnp.dll"
SectionEnd
SubSectionEnd

SubSection "格式转换编码器" ENC
Section "MP3编码器(lame)" ENCMP3
  SectionIn 1 2 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\lame.exe"
SectionEnd

Section "FLAC编码器(无损)" ENCFLAC
  SectionIn 1 2 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\flac.exe"
  File "foobar2000-extra\encoders\metaflac.exe"
SectionEnd

Section "WMA编码器" ENCWMA
  SectionIn 1 2 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\WMAEncode.exe"
SectionEnd

;Section /o "AAC+Apple无损(qaac，需要iTunes运行环境)" ENCQAAC
;  SectionIn 3 4
;  SetOutPath "$INSTDIR\encoders"
;  SetOverwrite on
;  File "encoders\qaac.exe"
;  File "encoders\refalac.exe"
;SectionEnd

;Section /o "AAC+Apple无损(qaac)运行环境" ENVQAAC
;  SectionIn 3 4
;  SetOutPath "$INSTDIR\encoders\qtfiles"
;  SetOverwrite on
;  File /r "encoders\qtfiles\*.*"
;SectionEnd

Section "APE编码器(无损)" ENCAPE
  SectionIn 1 2 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\mac.exe"
SectionEnd

Section "Opus编码器" ENCOPUS
  SectionIn 1 2 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\opusenc.exe"
SectionEnd

Section "AAC编码器(Nero)" ENCNERO
  SectionIn 1 2 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\neroAacEnc.exe"
SectionEnd

Section "OGG编码器" ENCOGG
  SectionIn 1 2 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\oggenc2.exe"
SectionEnd

Section "WavePack编码器(无损)" ENCWAV
  SectionIn 1 2 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\wavpack.exe"
SectionEnd

Section /o "MPC编码器" ENCMPC
  SectionIn 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\mpcenc.exe"
SectionEnd

Section /o "TAK编码器" ENCTAK
  SectionIn 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\Takc.exe"
SectionEnd

Section /o "TTA编码器" ENCTTA
  SectionIn 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\tta.exe"
SectionEnd

Section /o "AAC(fhgaacenc, 需要Winamp5.62+)" ENCFHGAAC
  SectionIn 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\fhgaacenc.exe"
  File "foobar2000-extra\encoders\nsutil.dll"
SectionEnd

Section /o "AAC编码器(faac)" ENCFAAC
  SectionIn 3
  SetOutPath "$INSTDIR\encoders"
  SetOverwrite on
  File "foobar2000-extra\encoders\faac.exe"
SectionEnd
SubSectionEnd

SubSection "高级输出组件"
Section "WASAPI输出组件(Windows版本不低于Vista)" WASAPI
  SectionIn 1 2 3
  ${If} ${AtLeastWinVista}
  SetOutPath "$INSTDIR\user-components\foo_out_wasapi"
  SetOverwrite on
  File "foobar2000-extra\components\wasapi\*.*"
  ${EndIf}
SectionEnd

Section /o "ASIO输出组件" ASIO
  SectionIn 3
  SetOutPath "$INSTDIR\user-components\foo_out_asio"
  SetOverwrite on
  File "foobar2000-extra\components\asio\*.*"
SectionEnd
SubSectionEnd

SubSection "增强版附加组件和程序"
Section /o "Milkdrop2 可视化插件（要求DirectX 9.0）" SHP
  SectionIn 2 3
  SetOutPath "$INSTDIR\components"
  SetOverwrite on
  File "foobar2000-extra\visualization\foo_vis_shpeck.dll"
  SetOutPath "$INSTDIR\configuration"
  SetOverwrite on
  File "foobar2000-extra\visualization\foo_vis_shpeck.dll.cfg"
  SetOutPath "$INSTDIR\plugins"
  SetOverwrite on
  File /r "foobar2000-extra\visualization\plugins\*.*"
SectionEnd
;Section /o "额外的Milkdrop可视化预设" MILKDROP
;  SectionIn 3
;  SetOutPath "$INSTDIR\plugins\winamp\Plugins\milkdrop2\presets"
;  SetOverwrite on
;  File "visualization\Milkdrop Presets\*.*"
;SectionEnd
Section /o "Mp3tag (含虾米，iTunes源)" MP3TAG
  SectionIn 2 3
  SetOutPath "$INSTDIR\assemblies\Mp3tag"
  SetOverwrite on
  File /r "foobar2000-extra\assemblies\Mp3tag\*.*"
SectionEnd
SubSectionEnd

SubSection "默认界面DUI相关"
Section /o "专辑列表组件" ALBLIST
  SectionIn 3
	SetOutPath "$INSTDIR\components"
  SetOverwrite on
  File "foobar2000-extra\components\foo_albumlist.dll"
SectionEnd
Section /o "预置主题集" DUITHEME
  SectionIn 3
  SetOutPath "$INSTDIR\themes"
  SetOverwrite on
  File "foobar2000-extra\themes\*.*"
SectionEnd
SubSectionEnd

Section "均衡器预置文件" EQSETTINGS
  SectionIn 1 2 3
  SetOutPath "$INSTDIR\Equalizer Presets"
  SetOverwrite on
  File "foobar2000-extra\Equalizer Presets\*.*"
SectionEnd


Section "创建桌面快捷方式" SHORTCUT
  SectionIn 1 2 3
	CreateShortCut "$DESKTOP\Foobar2000.lnk" "$INSTDIR\foobar2000.exe"
  SetOverwrite on
SectionEnd

Section -Post
	; 为 Windows 卸载程序写入键值
	;WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\foobar2000" "DisplayName" "foobar2000 (foobox ${FBOX_VER})"
	;WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\foobar2000" "DisplayVersion" "${FB2K_VER} (${FBOX_VER})"
	;WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\foobar2000" "UninstallString" '"$INSTDIR\uninstall.exe"'
  ${If} ${RunningX64}
  	RegDLL "$INSTDIR\user-components\foo_input_sacd\dsd_transcoder.dll"
    ;RegDLL "$INSTDIR\user-components\foo_input_sacd\dsd_transcoder_x64.dll"
	ExecWait '"$SYSDIR\regsvr32.exe" /s "$INSTDIR\user-components\foo_input_sacd\dsd_transcoder_x64.dll"'
  ${else}
      RegDLL "$INSTDIR\user-components\foo_input_sacd\dsd_transcoder.dll"
  ${EndIf}
	AccessControl::GrantOnFile "$INSTDIR" "(BU)" "FullAccess"
SectionEnd

Section "Uninstall"
	${If} ${RunningX64}
  	UnRegDLL "$INSTDIR\user-components\foo_input_sacd\dsd_transcoder.dll"
    ;UnRegDLL "$INSTDIR\user-components\foo_input_sacd\dsd_transcoder_x64.dll"
	ExecWait '"$SYSDIR\regsvr32.exe" /u /s "$INSTDIR\user-components\foo_input_sacd\dsd_transcoder_x64.dll"'
  ${else}
      UnRegDLL "$INSTDIR\user-components\foo_input_sacd\dsd_transcoder.dll"
  ${EndIf}
	AccessControl::GrantOnFile "$INSTDIR" "(BU)" "FullAccess"
	
;DeleteRegKey HKCU "Software\foobar2000"
;DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\foobar2000"
  
  ; Remove files and uninstaller
  Delete $INSTDIR\*.*
  Delete $INSTDIR\uninstall.exe

  ; Remove shortcuts, if any
  Delete "$DESKTOP\Foobar2000.lnk"

  ; Remove directories used
  RMDir /r "$INSTDIR\assemblies"
  RMDir /r "$INSTDIR\cache"
  RMDir /r "$INSTDIR\components"
  RMDir /r "$INSTDIR\configuration"
  RMDir /r "$INSTDIR\crash reports"
  RMDir /r "$INSTDIR\doc"
  RMDir /r "$INSTDIR\encoders"
  RMDir /r "$INSTDIR\Equalizer Presets"
  RMDir /r "$INSTDIR\icons"
  RMDir /r "$INSTDIR\playlists-v1.4"
  RMDir /r "$INSTDIR\plugins"
  RMDir /r "$INSTDIR\runtime"
  RMDir /r "$INSTDIR\themes"
  RMDir /r "$INSTDIR\user-components"
	MessageBox MB_YESNO|MB_ICONQUESTION \
	"是否删除媒体库数据，封面，歌词及下载等内容？$\n(若您要保留这些文件，请点击下面的“否”按钮)" \
	IDNO NoDelete
	; 全删光！！！
	RMDir /r "$INSTDIR"
	NoDelete: RMDir "$INSTDIR"

SectionEnd

Function .onSelChange
SectionGetFlags ${ENCMP3} $0
SectionGetFlags ${ENCFLAC} $1
SectionGetFlags ${ENCWMA} $R2
SectionGetFlags ${ENCAPE} $3
SectionGetFlags ${ENCOPUS} $4
SectionGetFlags ${ENCNERO} $5
SectionGetFlags ${ENCOGG} $6
SectionGetFlags ${ENCWAV} $7
SectionGetFlags ${ENCMPC} $8
SectionGetFlags ${ENCTAK} $9
SectionGetFlags ${ENCTTA} $R1
SectionGetFlags ${ENCFHGAAC} $R2
SectionGetFlags ${ENCFAAC} $R3
;SectionGetFlags ${ENCQAAC} $R4
;SectionGetFlags ${ENVQAAC} $R5
SectionGetFlags ${CONVERTER} $R0
SectionGetFlags ${DUITHEME} $R9

StrCmp $0 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $1 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $2 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $3 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $4 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $5 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $6 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $7 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $8 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $9 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $R1 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $R2 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $R3 1 0 +2
SectionSetFlags ${CONVERTER} 1
StrCmp $R0 0 0 +2
SectionSetFlags ${CONVCFG} 0
StrCmp $R9 1 0 +2
SectionSetFlags ${ALBLIST} 1
FunctionEnd

Function .onInit

  uac_tryagain:
  !insertmacro UAC_RunElevated
  #MessageBox mb_TopMost "0=$0 1=$1 2=$2 3=$3"
  ${Switch} $0
  ${Case} 0
  	${IfThen} $1 = 1 ${|} Quit ${|} ;we are the outer process, the inner process has done its work, we are done
  	${IfThen} $3 <> 0 ${|} ${Break} ${|} ;we are admin, let the show go on
  	${If} $1 = 3 ;RunAs completed successfully, but with a non-admin user
  		MessageBox mb_IconExclamation|mb_TopMost|mb_SetForeground "这个安装程序需要管理员权限，请再试一次" /SD IDNO IDOK uac_tryagain IDNO 0
  	${EndIf}
  	;fall-through and die
  ${Case} 1223
  	MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "此安装程序需要管理员权限, 正在中止安装!"
  	Quit
  ${Case} 1062
  	MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "Logon 服务没有运行, 正在中止安装!"
  	Quit
  ${Default}
  	MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "无法提权, 错误 $0"
  	Quit
  ${EndSwitch}
  initpluginsdir

  ;检查更新
  ;Call CheckVer

  ;防止重复运行
  System::Call 'kernel32::CreateMutexA(i 0, i 0, t "${Name}") i .r1 ?e'
  Pop $R0
  StrCmp $R0 0 +3
  MessageBox MB_OK|MB_IconExclamation "另一个${Name}正在运行。"
  quit

	;StrCmp ${PRODUCT_OUTNAME} $EXEFILE +5 0
  ;ExecShell "open" "http://www.foobar2000.com.cn"
  ;MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "安装程序被修改名称, 已中止安装, $\n点击“确定”后将使用命令行自动改回名称! $\n如无法正常自动修改，请自己手动改回“${PRODUCT_OUTNAME}”"
  ;Exec 'cmd.exe /c ping 127.0.0.1 -n 3 & ren $EXEFILE ${PRODUCT_OUTNAME}'
	;quit

  FindProcDLL::FindProc "foobar2000.exe"
  StrCmp $R0 1 0 haventrun
  MessageBox MB_YESNOCANCEL|MB_ICONEXCLAMATION "程序检测到 foobar2000 正在运行,若不退出 foobar2000 强行安装,$\n可能会因无法覆盖文件而导致安装失败！$\n$\n1. 选择〖是(Y)〗将关闭 foobar2000 后继续安装。$\n2. 选择〖否(N)〗不关闭 foobar2000 并继续安装。$\n3. 选择〖取消〗退出安装程序。$\n" /SD IDYES IDNO endrun IDCANCEL exitsetup
  KillProcDLL::KillProc "foobar2000.exe"
  sleep 444
  FindProcDLL::FindProc "foobar2000.exe"
  StrCmp $R0 1 -3 0
  goto endrun
  exitsetup:
  quit
  haventrun:
  endrun:
  setoutpath $pluginsdir
  ;file "ADDIN\shortcut.ini"
  ;File "/oname=$PLUGINSDIR\Splash_sp.bmp" "ADDIN\sp.bmp"
  ; 使用闪屏插件显示闪屏
  ;advsplash::show 1000 600 400 -1 "$PLUGINSDIR\Splash_sp"
  ;Pop $0 ; $0 返回 '1' 表示用户提前关闭闪屏, 返回 '0' 表示闪屏正常结束, 返回 '-1' 表示闪屏显示出错
FunctionEnd

#-- 根据 NSIS 脚本编辑规则，所有 Function 区段必须放置在 Section 区段之后编写，以避免安装程序出现未可预知的问题。--#

