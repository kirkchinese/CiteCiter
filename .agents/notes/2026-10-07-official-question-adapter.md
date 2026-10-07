# Official DSH question adapter

Date: 2026-10-07. Targets: official DSH Desktop 0.2.0-rc.2 and Web SDK 0.2.1-alpha.1. Community Desktop is outside the support and evidence scope.

The official user-question carrier replaced `cancel()` with `dismiss()` and added foreground timed waits, focus/edit holds, persisted continued questions and late replies. Citer's private request waterfall previously discarded `request.wait`; the ordinary native Session-list reconciler cannot repair this because Citer Sessions deliberately stay outside that list.

Keep the private waterfall and exact owned Agent. `topic-questions.ts` projects the Host's existing question state; `TopicQuestionController` owns the Client wait claim and answer draft outside React, and `TopicQuestions` presents it without discovering Cordis services. The composer uses the public Remote `userQuestions.attachWait()` stream. Timeout returns `ASK_TIMED_OUT` only to the matching explicitly timed request. Late replies go through `agent.ctx.userQuestions.answer()` so the Host owns Inbox admission and durable message attribution. Default blocking semantics, readonly permissions, source logs and the manual-send boundary are unchanged.

Named questions may hide and reopen, with the controller retaining the countdown. Focus pauses a pristine countdown; the first edit holds it. A closed Client releases its claim, allowing the Host's original deadline to take over. The confirmed-delete path explicitly clears that Topic's controllers. A reply already queued in the native Inbox is omitted from the continued-question view to prevent duplicate user submission. Multiple pending calls retain their own identity and drafts.

Archive recovery also recognizes the Host's `user-question-reply` Inbox insertion as an accepted user submission; a late answer restores an archived Topic just as an ordinary manual send does. Model/tool events and timeout-only results do not restore it.

Static evidence: primary Host/Client typecheck and official Desktop Host/Client typecheck passed. An inline Node protocol check, with no retained test file and no model provider, checked hidden timeout, late reply state, focus pause/resume, edit hold, retained mixed-language answer text, and legacy cancel. These checks do not establish runtime Remote routing or real model acceptance; final-package UI and model tests remain required. See `docs/compatibility/2026-10-official-desktop-audit.md` for the upstream commit references and concrete acceptance steps.

A second inline lifecycle check confirmed that repeated synchronization opens only one wait claim, disposal aborts its signal and disposes its stream, a disposed controller cannot restart, and only accepted human user/reply sources restore archive state. The Client manifest must declare `@deepseek-ai/dsh-api-remotes` as an injected package: that assembly mounts the generated `userQuestions` namespace. Importing its types or the UI question component alone does not mount the Remote service.

Limit: question-answer drafts survive hide/reopen and Topic navigation within the Client lifetime, but this change does not add a separate persisted question-draft format. Continued questions and submitted answers still restore from the Host projection. No host Agent Loop patch, Session-list publication or permission default change was introduced.
