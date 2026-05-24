---
name: feedback-powershell-batching
description: User dislikes excessive PowerShell permission prompts — batch commands to minimize tool calls
metadata:
  type: feedback
---

Batch PowerShell commands into as few tool calls as possible. Each PowerShell call triggers a separate permission prompt for the user, which is annoying when there are many in a row.

**Why:** User explicitly complained about being asked for PowerShell permission too many times during the npm install sequence.

**How to apply:** Chain related commands with `;` or `&&` in a single PowerShell call rather than making separate calls. For sequential install steps, combine into one call with multiple `cd` + `npm install` lines.
