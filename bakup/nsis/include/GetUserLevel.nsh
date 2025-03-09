!define USER_PRIV_GUEST 0
!define USER_PRIV_USER  1
!define USER_PRIV_ADMIN 2
 
!include "Util.nsh"
!define GetUserLevel "!insertmacro Call_GetUserLevel"
!macro Call_GetUserLevel _level _username
    !verbose push
    !verbose 3
    Push ${_username}
    ${CallArtificialFunction} Func_GetUserLevel
    Pop ${_level}
    !verbose pop
!macroend
!macro Func_GetUserLevel
    Exch $R0
    Push $R1
    System::Call "*(i)i.R1"
    System::Call "netapi32::NetUserGetInfo(in,wR0,i1,iR1)i.R0"
    IntCmp $R0 0 +3
    Push error
    Goto lbl_end
    System::Call "*$R1(i.R0)"
    System::Call "*$R0(w,w,i,i.s)"
    System::Call "netapi32::NetApiBufferFree(iR0)"
lbl_end:
    System::Free $R1
    Exch
    Pop $R1
    Exch
    Pop $R0
!macroend