/* 
* nsi by Nanlon 2020-01-20
* ������뻷�� NSIS 3.05
* ����NSIS���Ϊ Unicode ��
*/

/************************
* ����nsh �ű�
************************/

# ͷ�ļ�Ŀ¼
!addincludedir ".\nsisfiles\include"

!include "MUI2.nsh"
!include "x64.nsh"
!include "WinVer.nsh"

/************************
* ��װ�����ʼ���峣�� 
************************/

!define FB2K     "Foobar2000"
!define FB2K_VER "1.5.1"
!define FBOX     "Foobox"
!define FBOX_VER "6.1.5.1a"
!define FBOX_PUB "dreamawake"
!define FBOX_WEB "https://www.cnblogs.com/foobox/"

# ����ע���
!define FBOX_KEY_ROOT   "HKLM"
!define FBOX_KEY_UNINST "Software\Microsoft\Windows\CurrentVersion\Uninstall\${FB2K}"
!define FBOX_KEY_APPDIR "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\${FB2K}.exe"

/************************
* MUI Ԥ���峣��
************************/

# UI �ļ�Ŀ¼
!define MUI_UI ".\nsisfiles\mui-ui\mui_sdesc.exe"

!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_RIGHT

/*** ��װ���� ***/
!define MUI_ICON ".\resource\install.ico"

!define MUI_WELCOMEFINISHPAGE_BITMAP ".\resource\wizard-fb2k.bmp"
!define MUI_HEADERIMAGE_BITMAP ".\resource\header-fb2k-r.bmp"

!define MUI_WELCOMEPAGE_TEXT "\
${FB2K} ��һ�� Windows ƽ̨�µĸ߼���Ƶ��������\
֧�ֶ�����Ƶ��ʽ���ź�ת���������������չ��$\n$\n\
${FBOX} �ǻ��� ${FB2K} �����棨��ǰ�汾 ${FB2K_VER}���� CUI �������á�$\n$\n\
��ѡװ Milkdrop2 ���ӻ����������ϵͳ�汾Ӧ������ Windows Vista������װ DirectX 9.0��"

!define MUI_FINISHPAGE_RUN "$INSTDIR\${FB2K}.exe"
!define MUI_FINISHPAGE_RUN_TEXT "���� ${FBOX}"

/*** ж�ؽ��� ***/
!define MUI_UNICON ".\resource\uninst.ico"

!define MUI_UNWELCOMEFINISHPAGE_BITMAP ".\resource\wizard-fb2k.bmp"
!define MUI_HEADERIMAGE_UNBITMAP ".\resource\header-fb2k-r.bmp"

/************************
* ��ʼ���������
************************/

# Setup ����
Caption "${FBOX} ${FBOX_VER}"
# Unicode Setup
Unicode true
# �����ļ����Ǳ��
SetOverwrite try
# ����ѹ��ѡ��
SetCompress auto
# ѡ��ѹ����ʽ
SetCompressor /SOLID lzma
SetCompressorDictSize 32
# �������ݿ��Ż�
SetDatablockOptimize on
# ������������д���ļ�ʱ��
SetDateSave on
# ����Ӧ�ó��� ����ԱȨ��
RequestExecutionLevel admin
# �����Ƿ�����װ�ڸ�Ŀ¼��
AllowRootDirInstall false
# �����Ƿ���ʾ��װ��ϸ��Ϣ
ShowInstDetails hide 
# �����Ƿ���ʾж����ϸ��Ϣ
ShowUnInstDetails hide 

# ���ð�װ����
InstType "��׼��װ (�������ӻ����Milkdrop2)"
InstType "��ǿ��װ"
InstType "��ȫ��װ"

/************************
* ��������
************************/

/*** �ӿ����������Դ ***/
ReserveFile ".\resource\install.ico"
ReserveFile ".\resource\licence.rtf"
ReserveFile ".\resource\wizard-fb2k.bmp"
ReserveFile ".\resource\header-fb2k-r.bmp"

# dll
# ���Ŀ¼
!addplugindir  ".\nsisfiles\plugin"

ReserveFile /plugin "System.dll"
ReserveFile /plugin "Process.dll"
ReserveFile /plugin "AccessControl.dll"

/*** ��װҳ�� ***/

# ��ӭҳ��
!insertmacro MUI_PAGE_WELCOME
# ���Э��ҳ��
!insertmacro MUI_PAGE_LICENSE ".\resource\licence.rtf"
# ���ѡ��ҳ��
!insertmacro MUI_PAGE_COMPONENTS
# ��װĿ¼ѡ��ҳ��
!define MUI_PAGE_CUSTOMFUNCTION_show OnDirPageshow
!insertmacro MUI_PAGE_DIRECTORY
# ��װ����ҳ��
!insertmacro MUI_PAGE_INSTFILES
# ��װ���ҳ��
!insertmacro MUI_PAGE_FINISH

/*** ж��ҳ�� ***/

# ж�ػ�ӭҳ��
!insertmacro MUI_UNPAGE_WELCOME
# ж��Ŀ¼ѡ��ҳ��
!insertmacro MUI_UNPAGE_DIRECTORY
# ж�ع���ҳ��
!insertmacro MUI_UNPAGE_INSTFILES
# ж�����ҳ��
!insertmacro MUI_UNPAGE_FINISH

/*
* *********** �����ļ� *************
* ����ʹ��".\resource\language\"�µ�
* �����ļ��滻NSIS�Դ������������ļ�
*/
!insertmacro MUI_LANGUAGE "SimpChinese"

/************************
* �汾����
************************/

VIProductVersion "${FBOX_VER}"
VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "ProductName"     "${FBOX}"
VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "Comments"        "CUI for ${FB2K}"
VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "CompanyName"     "${FBOX_WEB}"
VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "LegalTrademarks" "${FB2K}"
VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "LegalCopyright"  "Copyright ? 2001-2019 Piotr Pawlowski"
VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "FileDescription" "${FBOX} CUI skin for ${FB2K}"
VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "FileVersion"     "${FBOX_VER}"
VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "ProductVersion"  "${FBOX_VER}"

/************************
* ��װ�ļ�����
************************/

Name "${FBOX} ${FBOX_VER}"
OutFile "${FBOX}_${FBOX_VER}.exe"
InstallDir "$PROGRAMFILES\${FB2K}"

InstallDirRegKey HKLM "${FBOX_KEY_UNINST}" "UninstallString"
BrandingText "${FBOX} ${FBOX_VER}"

/************************
* ��װ Section ��
************************/

!macro ProcessCleanup  # ��������
ProcessFindNext:
  Process::Find "$INSTDIR\${FB2K}.exe"
	Pop $R0
	IntCmp $R0 0 ProcessFindDone
	Process::Kill $R0
	Pop $R1
	IntCmp $R1 0 ProcessFindDone
	Goto ProcessFindNext
ProcessFindDone:
!macroend

Section "���ĳ������" CoreFiles
  SectionIn 1 2 3 RO
  
  # ��������
  !insertmacro ProcessCleanup
  
  SetOutPath "$INSTDIR"
  File /r "${FB2K}-core\*.*"
  
  WriteUninstaller "$INSTDIR\uninst.exe"
SectionEnd

SectionGroup "��ѡ�����ļ�(�����豣��ԭ����ʱ��ѡ)" OptionalProfile

  Section "${FB2K} ���������ļ�" CoreProfile
    SectionIn 1 2 3
    
    SetOverwrite off
    SetOutPath "$INSTDIR\configuration"
    IfFileExists "$INSTDIR\backup\Core.cfg" 0 +3
    CopyFiles "$INSTDIR\backup\Core.cfg" "$INSTDIR\configuration"
    Delete "$INSTDIR\backup\Core.cfg"
    File "${FB2K}-extra\configuration\Core.cfg"
    SetOverwrite try
  SectionEnd

  Section "ESLyric ��������ļ�" LyricsCfg
    SectionIn 1 2 3
    
    SetOverwrite off
    SetOutPath "$INSTDIR\configuration"
    IfFileExists "$INSTDIR\backup\foo_uie_eslyric.dll.cfg" 0 +3
    CopyFiles "$INSTDIR\backup\foo_uie_eslyric.dll.cfg" "$INSTDIR\configuration"
    Delete "$INSTDIR\backup\foo_uie_eslyric.dll.cfg"
    File "${FB2K}-extra\configuration\foo_uie_eslyric.dll.cfg"
    SetOverwrite try
  SectionEnd

  Section "ת���������ļ�" ConverterCfg
    SectionIn 1 2 3
    
    SetOverwrite off
    SetOutPath "$INSTDIR\configuration"
    IfFileExists "$INSTDIR\backup\foo_converter.dll.cfg" 0 +3
    CopyFiles "$INSTDIR\backup\foo_converter.dll.cfg" "$INSTDIR\configuration"
    Delete "$INSTDIR\backup\foo_converter.dll.cfg"
    File "${FB2K}-extra\configuration\foo_converter.dll.cfg"
    SetOverwrite try
  SectionEnd
  
SectionGroupEnd

SectionGroup "���������" ExtraDecoder

  Section "APE ������" DecAPE
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\user-components\foo_input_monkey"
    File "${FB2K}-extra\components\foo_input_monkey.dll"
  SectionEnd

  Section "DTS ������" DecDTS
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\user-components\foo_input_dts"
    File "${FB2K}-extra\components\dts\*.*"
  SectionEnd

  Section "SACD ������" DecSACD
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\user-components\foo_input_sacd"
    File /r "${FB2K}-extra\components\sacd\*.*"
    
    # ע�� dsd_transcoder.dll
    ${If} ${RunningX64}
    
    ${DisableX64FSRedirection}
    ExecWait `regsvr32 /s "$INSTDIR\user-components\foo_input_sacd\dsd_transcoder_x64.dll"`
    ${EnableX64FSRedirection}
    
    ${EndIf}
    ExecWait `regsvr32 /s "$INSTDIR\user-components\foo_input_sacd\dsd_transcoder.dll"`
    
    SetOutPath "$INSTDIR\user-components\foo_dsd_processor"
    File "${FB2K}-extra\components\foo_dsd_processor.dll"
    
    SetOutPath "$INSTDIR\user-components\foo_dsd_converter"
    File "${FB2K}-extra\components\foo_dsd_converter.dll"
  SectionEnd

  Section "TTA ������" DecTTA
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\user-components\foo_input_tta"
    File "${FB2K}-extra\components\foo_input_tta.dll"
  SectionEnd

  Section "TAK ������" DecTAK
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\user-components\foo_input_tak"
    File "${FB2K}-extra\components\tak_deco_lib.dll"
    File "${FB2K}-extra\components\foo_input_tak.dll"
  SectionEnd

  Section "DVD-Audio ������" DecDVDA
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\user-components\foo_input_dvda"
    File "${FB2K}-extra\components\foo_input_dvda.dll"
  SectionEnd

SectionGroupEnd

SectionGroup "��ѡ���" OptionalComponents

  Section "ת����" Converter
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\components"
    File "${FB2K}-extra\components\foo_converter.dll"
  SectionEnd

  Section "�ļ�����" FileOps
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\components"
    File "${FB2K}-extra\components\foo_fileops.dll"
  SectionEnd

  Section "ѹ������ȡ��" UnPack
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\components"
    File "${FB2K}-extra\components\foo_unpack.dll"
  SectionEnd

  Section "��������ɨ����" Rgscan
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\components"
    File "${FB2K}-extra\components\foo_rgscan.dll"
  SectionEnd

  Section /o "Freedb ��ǩ��ȡ��" Freedb
    SectionIn 2 3
    
    SetOutPath "$INSTDIR\components"
    File "${FB2K}-extra\components\foo_freedb2.dll"
  SectionEnd

  Section /o "UPnP\DLNA ֧�ֲ��" UPnP
    SectionIn 3
    
    SetOutPath "$INSTDIR\user-components\foo_upnp"
    File "${FB2K}-extra\components\foo_upnp.dll"
  SectionEnd
  
SectionGroupEnd

SectionGroup "��ʽת��������" Encoders

  Section "MP3 ������(lame)" EncMP3
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\lame.exe"
  SectionEnd

  Section "FLAC ������(����)" EncFLAC
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\flac.exe"
    File "${FB2K}-extra\encoders\metaflac.exe"
  SectionEnd

  Section "WMA ������" EncWMA
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\WMAEncode.exe"
  SectionEnd

  Section "APE ������(����)" EncAPE
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\mac.exe"
  SectionEnd

  Section "Opus ������" EncOPUS
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\opusenc.exe"
  SectionEnd

  Section "AAC ������(Nero)" EncAAC
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\neroAacEnc.exe"
  SectionEnd

  Section "OGG ������" EncOGG
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\oggenc2.exe"
  SectionEnd

  Section "WavePack ������(����)" EncWAV
    SectionIn 1 2 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\wavpack.exe"
  SectionEnd

  Section /o "MPC ������" EncMPC
    SectionIn 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\mpcenc.exe"
  SectionEnd

  Section /o "TAK ������" EncTAK
    SectionIn 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\Takc.exe"
  SectionEnd

  Section /o "TTA ������" EncTTA
    SectionIn 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\tta.exe"
  SectionEnd

  Section /o "AAC ������(fhgaacenc, ��ҪWinamp5.62+)" EncFHGAAC
    SectionIn 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\fhgaacenc.exe"
    File "${FB2K}-extra\encoders\nsutil.dll"
  SectionEnd

  Section /o "AAC ������(faac)" EncFAAC
    SectionIn 3
    
    SetOutPath "$INSTDIR\encoders"
    File "${FB2K}-extra\encoders\faac.exe"
  SectionEnd

SectionGroupEnd

SectionGroup "�߼�������" AdvancedOutputComponents

  Section "WASAPI ������(Windows�汾������Vista)" WASAPI
    SectionIn 1 2 3
    
    ${If} ${AtLeastWinVista}
    SetOutPath "$INSTDIR\user-components\foo_out_wasapi"
    File "${FB2K}-extra\components\wasapi\*.*"
    ${EndIf}
  SectionEnd

  Section /o "ASIO ������" ASIO
    SectionIn 3
    
    SetOutPath "$INSTDIR\user-components\foo_out_asio"
    File "${FB2K}-extra\components\asio\*.*"
  SectionEnd
  
SectionGroupEnd

SectionGroup "��ǿ�渽������ͳ���" EnhancedAddOnsAndPrograms

  Section /o "Milkdrop2 ���ӻ����(Ҫ��DirectX 9.0)" Milkdrop2
    SectionIn 2 3
    
    SetOutPath "$INSTDIR\components"
    File "${FB2K}-extra\visualization\foo_vis_shpeck.dll"
    
    SetOutPath "$INSTDIR\configuration"
    File "${FB2K}-extra\visualization\foo_vis_shpeck.dll.cfg"
    
    SetOutPath "$INSTDIR\plugins"
    File /r "${FB2K}-extra\visualization\plugins\*.*"
  SectionEnd

  Section /o "MusicTag ���ֱ�ǩ������" MusicTag
    SectionIn 2 3
    
    SetOutPath "$INSTDIR\assemblies\MusicTag"
    File /r "${FB2K}-extra\assemblies\MusicTag\*.*"
  SectionEnd
  
SectionGroupEnd

SectionGroup "Ĭ�Ͻ���DUI���" DefaultInterfaceDuiRelated

  Section /o "ר���б����" AlbumList
    SectionIn 3
    
    SetOutPath "$INSTDIR\components"
    File "${FB2K}-extra\components\foo_albumlist.dll"
  SectionEnd

  Section /o "Ԥ�����⼯" DuiThemes
    SectionIn 3
    
    SetOutPath "$INSTDIR\themes"
    File "${FB2K}-extra\themes\*.*"
  SectionEnd
  
SectionGroupEnd

Section "������Ԥ���ļ�" EqualizerPresets
  SectionIn 1 2 3
  
  SetOutPath "$INSTDIR\Equalizer Presets"
  File "${FB2K}-extra\Equalizer Presets\*.*"
SectionEnd

SectionGroup "��ݷ�ʽ" Shortcuts

  Section "����" ShortcutsDesktop
    SectionIn 1 2 3
	
    SetShellVarContext current
    CreateShortCut "$DESKTOP\${FB2K}.lnk" "$INSTDIR\${FB2K}.exe"
  SectionEnd
  
  Section "��ʼ�˵�" ShortcutsPrograms
    SectionIn 1 2 3
    
    SetShellVarContext current
    CreateDirectory "$SMPROGRAMS\${FB2K}"
    CreateShortCut "$SMPROGRAMS\${FB2K}\${FB2K}.lnk" "$INSTDIR\${FB2K}.exe"
    CreateShortCut "$SMPROGRAMS\${FB2K}\ж��${FB2K}.lnk" "$INSTDIR\uninst.exe"
  SectionEnd
  
SectionGroupEnd

Section -Post
  # ��ȡ��װĿ¼��дȨ��
  AccessControl::GrantOnFile "$INSTDIR" "(BU)" "FullAccess"
  
  SetRegView 32
  WriteRegStr   HKLM "${FBOX_KEY_UNINST}" "DisplayName"     "${FB2K}"
  WriteRegStr   HKLM "${FBOX_KEY_UNINST}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr   HKLM "${FBOX_KEY_UNINST}" "DisplayIcon"     "$INSTDIR\${FB2K}.exe"
  WriteRegStr   HKLM "${FBOX_KEY_UNINST}" "DisplayVersion"  "${FBOX_VER}"
  WriteRegStr   HKLM "${FBOX_KEY_UNINST}" "URLInfoAbout"    "${FBOX_WEB}"
  WriteRegStr   HKLM "${FBOX_KEY_UNINST}" "Publisher"       "${FBOX_PUB}"
  SetRegView lastused
  
  # ��ȡ��װ�εĴ�С(KB)д��ע���
	SectionGetSize ${CoreFiles} $R0
	
	SetRegView 32
	WriteRegDWORD HKLM "${FBOX_KEY_UNINST}" "EstimatedSize" "$R0"
	WriteRegStr   HKLM "${FBOX_KEY_APPDIR}" "" "$INSTDIR\${FB2K}.exe"
	SetRegView lastused
	
	RMDir "$INSTDIR\backup"
SectionEnd

/************************
* ��װ�ص�����
************************/

Function .onInit
  # ��ʼ�����Ŀ¼
  InitPluginsDir
  File "/oname=$PLUGINSDIR\install.ico"       ".\resource\install.ico"
  File "/oname=$PLUGINSDIR\licence.rtf"       ".\resource\licence.rtf"
	File "/oname=$PLUGINSDIR\wizard-fb2k.bmp"   ".\resource\wizard-fb2k.bmp"
	File "/oname=$PLUGINSDIR\header-fb2k-r.bmp" ".\resource\header-fb2k-r.bmp"

  # ���������ֹ�ظ�����
  System::Call `kernel32::CreateMutex(i0,i0,t"${FBOX}_installer")i.r1?e`
  Pop $R0
  StrCmp $R0 0 +3
  MessageBox MB_OK|MB_ICONEXCLAMATION "��װ�����Ѿ����У�"
  Abort
  
  # �Ѱ�װ�汾��⼰ж��
	SetRegView 32
	ClearErrors
	ReadRegStr $R0 HKLM "${FBOX_KEY_UNINST}" "UninstallString"
	${Unless} ${Errors}
	ReadRegStr $R1 HKLM "${FBOX_KEY_UNINST}" "DisplayVersion"
	SetRegView lastused
	${AndUnless} ${Cmd} `MessageBox MB_YESNO|MB_ICONQUESTION \
	"��⵽�����Ѿ���װ�� ${FBOX} v$R1 $\n \
	$\n? ȫ�°�װ��ѡ����(Y)��ж��ԭ�а汾��\
	$\n? ������װ��ѡ�񡼷�(N)��ֱ�Ӹ��ǰ�װ��\
	$\n$\n�Ƿ�ж���Ѱ�װ�İ汾��" /SD IDYES IDNO`
	System::Call "*(&t${NSIS_MAX_STRLEN}R0)p.r0"
	System::Call "shlwapi::PathParseIconLocation(pr0)"
	System::Call "shlwapi::PathRemoveFileSpec(pr0)"
	System::Call "*$0(&t${NSIS_MAX_STRLEN}.R2)"
	System::Free $0
	${AndUnless} $R2 == ""
	ExecWait `"$R0" /S _?=$R2` $0
	${EndUnless}
FunctionEnd

Function .onSelChange
  SectionGetFlags ${EncMP3}    $0
  SectionGetFlags ${EncFLAC}   $1
  SectionGetFlags ${EncWMA}    $2
  SectionGetFlags ${EncAPE}    $3
  SectionGetFlags ${EncOPUS}   $4
  SectionGetFlags ${EncAAC}    $5
  SectionGetFlags ${EncOGG}    $6
  SectionGetFlags ${EncWAV}    $7
  SectionGetFlags ${EncMPC}    $8
  SectionGetFlags ${EncTAK}    $9
  SectionGetFlags ${EncTTA}    $R1
  SectionGetFlags ${EncFHGAAC} $R2
  SectionGetFlags ${EncFAAC}   $R3
  SectionGetFlags ${Converter} $R0
  SectionGetFlags ${DuiThemes} $R9

  StrCmp $0 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $1 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $2 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $3 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $4 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $5 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $6 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $7 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $8 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $9 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $R1 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $R2 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $R3 1 0 +2
  SectionSetFlags ${Converter} 1
  StrCmp $R0 0 0 +2
  SectionSetFlags ${ConverterCfg} 0
  StrCmp $R9 1 0 +2
  SectionSetFlags ${AlbumList} 1
FunctionEnd

Function OnDirPageshow  # ��װĿ¼����
	SetRegView 32
	ReadRegStr $0 HKLM "${FBOX_KEY_APPDIR}" ""
	SetRegView lastused
	
	${If} $0 != ""
	FindWindow $R0 "#32770" "" $HWNDPARENT

	# ���������ť
	GetDlgItem $0 $R0 1001
	EnableWindow $0 0

	# ���ñ༭��Ŀ¼
	GetDlgItem $0 $R0 1019
	EnableWindow $0 0

	GetDlgItem $0 $R0 1006
	SendMessage $0 ${WM_SETTEXT} 0 "STR:�Ѿ���⵽���ļ�����ϰ�װ��${FBOX}�����ڽ��еĸ��ǰ�װ���ܸ��İ�װĿ¼���������Ҫ���İ�װĿ¼������ж���Ѿ���װ�İ汾֮�������д˰�װ����"

	${EndIf}
FunctionEnd

/************************
* �����������
************************/

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${CoreFiles}                  "��װ ${FB2K}"
  !insertmacro MUI_DESCRIPTION_TEXT ${CoreProfile}                "${FB2K} ���������ļ�"
  !insertmacro MUI_DESCRIPTION_TEXT ${LyricsCfg}                  "ESLyric ��������ļ�"
  !insertmacro MUI_DESCRIPTION_TEXT ${ConverterCfg}               "ת���������ļ�"
  !insertmacro MUI_DESCRIPTION_TEXT ${ExtraDecoder}               "���������"
  !insertmacro MUI_DESCRIPTION_TEXT ${DecAPE}                     "APE ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${DecDTS}                     "DTS ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${DecSACD}                    "SACD ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${DecTTA}                     "TTA ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${DecTAK}                     "TAK ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${DecDVDA}                    "DVD-Audio ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${OptionalComponents}         "��ѡ���"
  !insertmacro MUI_DESCRIPTION_TEXT ${Converter}                  "ת����"
  !insertmacro MUI_DESCRIPTION_TEXT ${FileOps}                    "�ļ�����"
  !insertmacro MUI_DESCRIPTION_TEXT ${UnPack}                     "ѹ������ȡ��"
  !insertmacro MUI_DESCRIPTION_TEXT ${Rgscan}                     "��������ɨ����"
  !insertmacro MUI_DESCRIPTION_TEXT ${Freedb}                     "Freedb ��ǩ��ȡ��"
  !insertmacro MUI_DESCRIPTION_TEXT ${UPnP}                       "UPnP\DLNA ֧�ֲ��"
  !insertmacro MUI_DESCRIPTION_TEXT ${Encoders}                   "��ʽת��������"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncMP3}                     "MP3 ������(lame)"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncFLAC}                    "FLAC ������(����)"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncWMA}                     "WMA ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncAPE}                     "APE ������(����)"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncOPUS}                    "Opus ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncAAC}                     "AAC ������(Nero)"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncOGG}                     "OGG ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncWAV}                     "WavePack ������(����)"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncMPC}                     "MPC ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncTAK}                     "TAK ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncTTA}                     "TTA ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncFHGAAC}                  "AAC ������(fhgaacenc, ��ҪWinamp5.62+)"
  !insertmacro MUI_DESCRIPTION_TEXT ${EncFAAC}                    "AAC ������(faac)"
  !insertmacro MUI_DESCRIPTION_TEXT ${AdvancedOutputComponents}   "�߼�������"
  !insertmacro MUI_DESCRIPTION_TEXT ${WASAPI}                     "WASAPI ������(Windows�汾������Vista)"
  !insertmacro MUI_DESCRIPTION_TEXT ${ASIO}                       "ASIO ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${EnhancedAddOnsAndPrograms}  "��ǿ�渽������ͳ���"
  !insertmacro MUI_DESCRIPTION_TEXT ${Milkdrop2}                  "Milkdrop2 ���ӻ����(Ҫ��DirectX 9.0)"
  !insertmacro MUI_DESCRIPTION_TEXT ${MusicTag}                   "MusicTag ���ֱ�ǩ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${DefaultInterfaceDuiRelated} "Ĭ�Ͻ��� DUI ������"
  !insertmacro MUI_DESCRIPTION_TEXT ${AlbumList}                  "ר���б����"
  !insertmacro MUI_DESCRIPTION_TEXT ${DuiThemes}                  "Ԥ�����⼯"
  !insertmacro MUI_DESCRIPTION_TEXT ${EqualizerPresets}           "������Ԥ���ļ�"
  !insertmacro MUI_DESCRIPTION_TEXT ${Shortcuts}                  "������ݷ�ʽ"
  !insertmacro MUI_DESCRIPTION_TEXT ${ShortcutsDesktop}           "���������ݷ�ʽ"
  !insertmacro MUI_DESCRIPTION_TEXT ${ShortcutsPrograms}          "������ʼ�˵��������ݷ�ʽ"
!insertmacro MUI_FUNCTION_DESCRIPTION_END

/************************
* ж�� Section ��
************************/

Section Uninstall
	# ��������
  !insertmacro ProcessCleanup
	
	# ��ע��dll
	${If} ${RunningX64}
	
  ${DisableX64FSRedirection}
  ExecWait `regsvr32 /s /u "$INSTDIR\user-components\foo_input_sacd\dsd_transcoder_x64.dll"`
  ${EnableX64FSRedirection}
  
  ${EndIf}
	ExecWait `regsvr32 /s /u "$INSTDIR\user-components\foo_input_sacd\dsd_transcoder.dll"`
	
	# ���������ļ�
  CreateDirectory "$INSTDIR\backup"
  CopyFiles "$INSTDIR\configuration\Core.cfg" "$INSTDIR\backup"
  CopyFiles "$INSTDIR\configuration\foo_uie_eslyric.dll.cfg" "$INSTDIR\backup"
  CopyFiles "$INSTDIR\configuration\foo_converter.dll.cfg" "$INSTDIR\backup"
  
  # ɾ����װ�ļ�
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

  Delete "$INSTDIR\avcodec-fb2k-57.dll"
  Delete "$INSTDIR\avutil-fb2k-55.dll"
  Delete "$INSTDIR\concrt140.dll"
  Delete "$INSTDIR\dsound.dll"
  Delete "$INSTDIR\foo_upnp.xml"
  Delete "$INSTDIR\LargeFieldsConfig.txt"
  Delete "$INSTDIR\msvcp140.dll"
  Delete "$INSTDIR\msvcp140_1.dll"
  Delete "$INSTDIR\PP-UWP-Interop.dll"
  Delete "$INSTDIR\shared.dll"
  Delete "$INSTDIR\ShellExt32.dll"
  Delete "$INSTDIR\ShellExt64.dll"
  Delete "$INSTDIR\theme.fth"
  Delete "$INSTDIR\vccorlib140.dll"
  Delete "$INSTDIR\vcruntime140.dll"
  Delete "$INSTDIR\version.txt"
  Delete "$INSTDIR\zlib1.dll"
  Delete "$INSTDIR\${FB2K}.exe"
  Delete "$INSTDIR\${FBOX}����.CHM"
  Delete "$INSTDIR\${FB2K} Shell Associations Updater.exe"
  
  Delete "$INSTDIR\uninst.exe"

  # ɾ�������ݷ�ʽ
  SetShellVarContext current
  Delete "$DESKTOP\${FB2K}.lnk"
  
  SetShellVarContext current
  RMDir /r "$SMPROGRAMS\${FB2K}"
  
  # ɾ��ע���
	SetRegView 32
	DeleteRegKey HKLM "${FBOX_KEY_APPDIR}"
	DeleteRegKey HKLM "${FBOX_KEY_UNINST}"
	SetRegView lastused
	
	# �Ƿ����û��ļ�
	MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON1 \
	"�Ƿ���ý������ݡ����桢��ʡ����ؼ������ļ����ݣ� \
	$\n$\n��Ҫ������Щ�ļ�����������(Y)����ť��" \
	IDYES NotDelete IDNO DeleteAll
	
	DeleteAll: 	
	# ɾ��ý������ݡ����桢��ʡ����ؼ������ļ�����
	RMDir /r "$INSTDIR\Download"
	RMDir /r "$INSTDIR\index-data"
	RMDir /r "$INSTDIR\library"
	RMDir /r "$INSTDIR\Lyrics"
	RMDir /r "$INSTDIR\MusicArt"
	RMDir /r "$INSTDIR\playlists-v1.4"
  RMDir /r "$INSTDIR\backup"
	
	RMDir "$INSTDIR"
  
  NotDelete:
	RMDir "$INSTDIR"
	
  SetAutoClose true
SectionEnd

/************************
* ж�ػص�����
************************/

Function un.onInit
  # ��ʼ�����Ŀ¼
  InitPluginsDir
  File "/oname=$PLUGINSDIR\uninst.ico"        ".\resource\uninst.ico"
  File "/oname=$PLUGINSDIR\wizard-fb2k.bmp"   ".\resource\wizard-fb2k.bmp"
	File "/oname=$PLUGINSDIR\header-fb2k-r.bmp" ".\resource\header-fb2k-r.bmp"
  
  # ���������ֹ�ظ�����
  System::Call `kernel32::CreateMutex(i 0, i 0, t "${FBOX}_uninstaller") i .r1 ?e`
  Pop $R0
  StrCmp $R0 0 +3
  MessageBox MB_OK|MB_ICONEXCLAMATION "ж�س����Ѿ����У�"
  Abort
FunctionEnd
