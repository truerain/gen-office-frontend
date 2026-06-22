<!-- packages/gen-datagrid/docs/reference/codex-windows-sandbox-troubleshooting.md
Explains how to diagnose and fix Codex Windows sandbox logon failures.
-->

# Codex Windows Sandbox Troubleshooting

This note explains how to diagnose the recurring Windows sandbox error below.

```text
windows sandbox: CreateProcessWithLogonW failed: 1385
```

## Short Version

This error usually means Windows blocked the account that Codex uses to start sandboxed commands. The fix is not in the project code. First find the failed Windows logon event, then grant only the required local security right for that logon type.

## Decision Table

| Situation | Recommended action |
|---|---|
| Personal Windows PC | Check Event Viewer, then adjust Local Security Policy for the exact failed account |
| Company or domain-joined PC | Check Group Policy first; local changes may be overwritten |
| Need to keep working now | Use approved PowerShell command prefixes as a temporary workaround |
| File writes create BOM or EOF noise | Use `.NET WriteAllText` with `UTF8Encoding(false)` and verify with `git diff --check` |

## Step 1. Find the Failed Logon Event

Open Event Viewer as Administrator.

```text
eventvwr.msc
```

Go to:

```text
Windows Logs > Security
```

Find a recent failed logon event:

```text
Event ID 4625
```

Record these fields:

| Field | Why it matters |
|---|---|
| `Account Name` | The account Windows blocked |
| `Logon Type` | The kind of logon Windows blocked |
| `Status` / `Sub Status` | Extra reason codes for the failure |

## Step 2. Map Logon Type to Security Policy

Use the `Logon Type` from Event Viewer to choose the policy to inspect.

| Logon Type | Meaning | Allow policy to check | Deny policy to check |
|---:|---|---|---|
| 2 | Interactive logon | `Allow log on locally` | `Deny log on locally` |
| 4 | Batch logon | `Log on as a batch job` | `Deny log on as a batch job` |
| 5 | Service logon | `Log on as a service` | Service-related deny policy |

Important rule: Deny wins over Allow. If the account, or a group containing the account, appears in a matching Deny policy, adding the same account to Allow may still fail.

## Step 3. Check Local Security Policy

Open Local Security Policy as Administrator.

```text
secpol.msc
```

Go to:

```text
Local Policies > User Rights Assignment
```

For example, if Event Viewer shows `Logon Type: 4`, inspect:

| Policy | What to do |
|---|---|
| `Log on as a batch job` | Add the failed account if it is missing |
| `Deny log on as a batch job` | Remove the failed account, or a containing group, if present |

Use the most specific account possible. Avoid broad changes such as adding `Everyone` or removing broad Deny rules without understanding the security impact.

## Step 4. Apply the Fix

Recommended procedure:

1. Open `secpol.msc` as Administrator.
2. Go to `Local Policies > User Rights Assignment`.
3. Open the Allow policy that matches the failed `Logon Type`.
4. Add the failed `Account Name` from Event Viewer.
5. Open the matching Deny policy.
6. If the account or a containing group is listed there, remove it only if this is acceptable for the machine policy.
7. Restart Codex and the terminal.
8. If needed, sign out of Windows and sign in again.

## Step 5. Export Policies from Command Line

If the GUI is not convenient, export the local security policy from an Administrator PowerShell.

```powershell
secedit /export /cfg C:\Temp\secpol.cfg
notepad C:\Temp\secpol.cfg
```

Search for these keys:

```text
SeInteractiveLogonRight
SeDenyInteractiveLogonRight
SeBatchLogonRight
SeDenyBatchLogonRight
SeServiceLogonRight
```

Mapping:

| Policy UI name | Export key |
|---|---|
| `Allow log on locally` | `SeInteractiveLogonRight` |
| `Deny log on locally` | `SeDenyInteractiveLogonRight` |
| `Log on as a batch job` | `SeBatchLogonRight` |
| `Deny log on as a batch job` | `SeDenyBatchLogonRight` |
| `Log on as a service` | `SeServiceLogonRight` |

## Step 6. Check Group Policy on Company PCs

On a company or domain-joined PC, Group Policy may overwrite local changes.

Run this from PowerShell:

```powershell
gpresult /h C:\Temp\gp.html
```

Open the generated HTML and look for User Rights Assignment or security policy settings. If these rights come from domain policy, ask IT or the security admin for an exception. Local edits may not persist.

## Temporary Workaround for Codex Sessions

Until the policy is fixed, use this operating rule:

- If a normal sandbox command fails with `CreateProcessWithLogonW failed: 1385`, rerun through an approved PowerShell command prefix.
- For file writes, avoid plain `Set-Content` when it can introduce BOM or EOF noise.
- Prefer `.NET WriteAllText` with UTF-8 without BOM.
- Always run `git diff --check` after file writes.

Example safe write pattern:

```powershell
$encoding = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Resolve-Path $path), $text, $encoding)
```

## Quick Checklist

- [ ] Open Event Viewer.
- [ ] Find `Event ID 4625`.
- [ ] Record `Account Name`.
- [ ] Record `Logon Type`.
- [ ] Check the matching Allow policy.
- [ ] Check the matching Deny policy.
- [ ] If this is a company PC, check `gpresult`.
- [ ] Restart Codex and retry.
