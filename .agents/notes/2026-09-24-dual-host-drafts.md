# Durable drafts and Web RC migration

Historical decision record for CiteCiter 0.9.0-alpha.1 and Web DSH 0.1.7-rc.1 / rc.2. Current compatibility is defined by AGENTS.md; this note does not establish a new host's acceptance.

## Boundaries

Citer owns each source's citeciter subtree. Session format guards refuse writes when an incompatible native successor log exists. Format migration remains with DSH; there is no v4-to-v3 rewrite or lossy fallback. Settings, Typert, messages and interaction contracts remain isolated adapters, without patching the Agent Loop.

Draft state is a separate contract, storage service and client controller. Text, actual references and file bytes reside under the Topic's draft directory. The controller outlives panel mounting, re-registers restored files through native attachments and compares revisions before saving. Unsent drafts do not enter model logs or authorize source reads. Admission records the exact outgoing snapshot and durable request identity; acknowledgment clears only that snapshot and preserves later edits. Lost responses stay pending until reconciliation or an explicit user retry. Permanent deletion includes the verified owned draft subtree.

RC2 navigation polls now ignore the creating phase and accept results only for the still-visible Topic identity, preventing old responses from replacing a newly opened Topic. Model-setting commands wait for native selectModel acceptance before saving metadata. Rejected models or effort settings must not appear saved.

User-approved scrolling follows the latest message after accepted manual submission while respecting reading position during unsolicited streaming. The callback is scoped to the original Topic so delayed acceptance cannot scroll another Topic.

## Web evidence

RC1 candidate 9b93b97861c2 restored unsent references, respected a one-card request, retained the source at maximum panel width, prioritized native file details, supported floating/docking and 780 px independent-page navigation. These observations do not establish RC2 acceptance.

RC2 candidate 372c3ec60cad restored drafts and passed Topic navigation regression. A real Connect 4.47 image request lost its network response and was not retried because the provider might still have been processing.

Candidate 79a436fc5e88 reproduced a real submission race: Enter followed immediately by typing submitted the later draft because submit captured content after flush. The fix captures immutable content and pins attachments before the first persistence await. Candidate 3441c3ba77a3 then submitted only the original question at user/message seq 33; revision 11 retained the later text, pending=null, and the real answer completed.

Other Web observations on their recorded candidates included text plus README and cover surviving page/host restarts, acknowledged draft clearing, queue and Ctrl+Enter steering order, closed-panel 1000×680 board capture, explicit two-window conflict resolution and a 617 ms creation sample. These are scoped observations, not exhaustive product guarantees.

## Limits

Windows prepack intermittently failed with TS5033 UNKNOWN in varying outputs; isolated steps and a later complete build passed without permission changes. The occupying process or stable trigger was not identified, and no blind retry was added. Some old-directory deletion commands were rejected by automatic approval; no other tool bypassed them. The upstream read-only PowerShell encoding failure remained visible and permissions were not widened. Linux was outside this round. See [Web RC1 validation](../../docs/validation/2026-09-24-rc.md).
