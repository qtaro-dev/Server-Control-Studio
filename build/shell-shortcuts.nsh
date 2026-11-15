!include "LogicLib.nsh"
!include "Win\COM.nsh"
!include "Win\Propkey.nsh"

; Use the Windows Shell property store and keep the builder's shortcut paths.
!macro SCSSetShortcutAppId shortcut appId
  Push $0
  Push $1
  Push $2
  Push $3
  Push $4
  Push $5
  Push $6
  System::Call 'ole32::CoInitialize(p 0)i.r5'
  StrCpy $0 0
  StrCpy $1 0
  StrCpy $2 0
  !insertmacro ComHlpr_CreateInProcInstance ${CLSID_ShellLink} ${IID_IShellLink} r0 .r3
  ${If} $3 == 0
    ${IUnknown::QueryInterface} $0 '("${IID_IPersistFile}",.r1).r3'
    ${If} $3 == 0
      ${IPersistFile::Load} $1 '("${shortcut}",2).r3'
      ${If} $3 == 0
        ${IUnknown::QueryInterface} $0 '("${IID_IPropertyStore}",.r2).r3'
        ${If} $3 == 0
          System::Call '*${SYSSTRUCT_PROPERTYKEY}(${PKEY_AppUserModel_ID})p.r3'
          System::Call '*(&w${NSIS_MAX_STRLEN} "${appId}")p.r6'
          System::Call '*(&i2 31,&i6 0,p r6,p 0)p.r4'
          ${IPropertyStore::SetValue} $2 '($3,$4)'
          ${IPropertyStore::Commit} $2 ""
          System::Free $4
          System::Free $6
          System::Free $3
          ${IPersistFile::Save} $1 '("${shortcut}",1)'
        ${EndIf}
      ${EndIf}
    ${EndIf}
  ${EndIf}
  !insertmacro ComHlpr_SafeRelease $2
  !insertmacro ComHlpr_SafeRelease $1
  !insertmacro ComHlpr_SafeRelease $0
  ${If} $5 >= 0
    System::Call 'ole32::CoUninitialize()'
  ${EndIf}
  Pop $6
  Pop $5
  Pop $4
  Pop $3
  Pop $2
  Pop $1
  Pop $0
!macroend

!macro SCSUnpinShortcut shortcut
  Push $0
  Push $1
  Push $2
  Push $3
  System::Call 'ole32::CoInitialize(p 0)i.r3'
  StrCpy $0 0
  StrCpy $1 0
  System::Call 'shell32::SHCreateItemFromParsingName(w "${shortcut}",p 0,g "${IID_IShellItem}",*p.r0)i.r2'
  ${If} $2 == 0
    !insertmacro ComHlpr_CreateInProcInstance ${CLSID_StartMenuPin} ${IID_IStartMenuPinnedList} r1 .r2
    ${If} $2 == 0
      ${IStartMenuPinnedList::RemoveFromList} $1 '($0)'
    ${EndIf}
  ${EndIf}
  !insertmacro ComHlpr_SafeRelease $1
  !insertmacro ComHlpr_SafeRelease $0
  ${If} $3 >= 0
    System::Call 'ole32::CoUninitialize()'
  ${EndIf}
  Pop $3
  Pop $2
  Pop $1
  Pop $0
!macroend

!define SCS_CLSID_ApplicationDestinations "{86c14003-4d6b-4ef3-a7b4-0506663b2e68}"
!define SCS_IID_IApplicationDestinations "{12337d35-94c6-48a0-bce7-6a9c69d4d600}"
!define SCS_CLSID_DestinationList "{77f10cf0-3db5-4966-b520-b7c54fd35ed6}"
!define SCS_IID_ICustomDestinationList "{6332debf-87b5-4670-90c0-5e57b408a49e}"

!macro SCSRemoveShortcutHistory appId
  Push $0
  Push $1
  Push $2
  System::Call 'ole32::CoInitialize(p 0)i.r2'
  StrCpy $0 0
  !insertmacro ComHlpr_CreateInProcInstance ${SCS_CLSID_ApplicationDestinations} ${SCS_IID_IApplicationDestinations} r0 .r1
  ${If} $1 == 0
    System::Call '$0->3(w "${appId}")i.r1'
    ${If} $1 == 0
      System::Call '$0->5()i'
    ${EndIf}
  ${EndIf}
  !insertmacro ComHlpr_SafeReleaseAndNull $0
  !insertmacro ComHlpr_CreateInProcInstance ${SCS_CLSID_DestinationList} ${SCS_IID_ICustomDestinationList} r0 .r1
  ${If} $1 == 0
    System::Call '$0->10(w "${appId}")i'
  ${EndIf}
  !insertmacro ComHlpr_SafeRelease $0
  ${If} $2 >= 0
    System::Call 'ole32::CoUninitialize()'
  ${EndIf}
  Pop $2
  Pop $1
  Pop $0
!macroend
