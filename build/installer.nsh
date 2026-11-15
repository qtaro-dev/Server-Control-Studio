; 旧版のuninstallerがルートを入れ替えるため、実行前に全体を外部へバックアップする。
; 新版のuninstallerは配布ファイルだけを削除し、追加データを残す。
!include "LogicLib.nsh"
!include "FileFunc.nsh"
!include "${BUILD_RESOURCES_DIR}\owned-files.nsh"
!ifndef BUILD_UNINSTALLER
Var DBTBackup
Var DBTOldRoot
Var DBTRestoreFailed

!macro DBTAbortBackupError
  ${If} ${Errors}
    MessageBox MB_ICONSTOP "更新前のバックアップを準備できません。元のファイルを変更せず更新を中止します。"
    Abort
  ${EndIf}
!macroend

!macro customInit
  ReadRegStr $DBTOldRoot HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation
  StrCpy $DBTBackup ""
  ${If} $DBTOldRoot != ""
  ${AndIf} ${FileExists} "$DBTOldRoot\${APP_EXECUTABLE_FILENAME}"
    ClearErrors
    CreateDirectory "$LOCALAPPDATA\Server Control Studio\upgrade-backups"
    !insertmacro DBTAbortBackupError
    GetTempFileName $DBTBackup "$LOCALAPPDATA\Server Control Studio\upgrade-backups"
    !insertmacro DBTAbortBackupError
    ; バックアップが旧インストール先の内側なら、再帰コピー前に必ず中止する。
    StrCpy $R0 "$DBTOldRoot\"
    StrLen $R1 $R0
    StrCpy $R2 "$DBTBackup\" $R1
    ${If} $R2 == $R0
      MessageBox MB_ICONSTOP "インストール先の外にバックアップを作成できません。更新を中止します。"
      Abort
    ${EndIf}
    Delete "$DBTBackup"
    !insertmacro DBTAbortBackupError
    CreateDirectory "$DBTBackup"
    !insertmacro DBTAbortBackupError
    ClearErrors
    CopyFiles /SILENT "$DBTOldRoot\*.*" "$DBTBackup"
    ${If} ${Errors}
      MessageBox MB_ICONSTOP "更新前のバックアップに失敗しました。更新を中止します。元のファイルは変更していません。"
      Abort
    ${EndIf}
  ${EndIf}
!macroend

Function DBTRestoreFile
  ; Locateのファイル一覧から、新版の配布ファイルに該当しないものだけを戻す。
  StrLen $R0 $DBTBackup
  IntOp $R0 $R0 + 1
  StrCpy $R5 $R9 "" $R0
  !insertmacro IsOwnedPath $R5 $R4
  ${If} $R4 != "true"
    ${If} ${FileExists} "$R9\*.*"
      CreateDirectory "$INSTDIR\$R5"
    ${Else}
    ${GetParent} "$INSTDIR\$R5" $R3
    CreateDirectory "$R3"
    ClearErrors
    CopyFiles /SILENT "$R9" "$R3"
    ${If} ${Errors}
      StrCpy $DBTRestoreFailed "true"
    ${EndIf}
    ${EndIf}
  ${EndIf}
  Push ""
FunctionEnd

!macro customInstall
  ${If} $DBTBackup != ""
    StrCpy $DBTRestoreFailed "false"
    ${Locate} "$DBTBackup" "/L=FD /M=*.*" "DBTRestoreFile"
    ${If} $DBTRestoreFailed == "true"
      MessageBox MB_ICONSTOP "利用者データの復元に失敗しました。バックアップを保持しています：$DBTBackup"
      Abort
    ${EndIf}
  ${EndIf}
!macroend

!endif

!macro customRemoveFiles
  ; 自分が配布した個別ファイルのみ。ユーザー追加のファイル・フォルダは削除しない。
  !insertmacro RemoveOwnedFiles
!macroend
