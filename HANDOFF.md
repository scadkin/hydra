# Hydra Session Handoff Prompt

Paste this when approaching context limits or ending a session:

---

```
We're approaching context limits. Before I clear, do the following in order:

1. Save any feedback, preferences, or user context learned this session to memory

2. Update CLAUDE.md:
   - Update 'Current State' with: what's working, what's broken or in-progress, and the exact next step
   - Add any new rules, conventions, or architectural decisions from this session
   - Note any uncommitted or in-progress code changes the next session needs to know about
   - Review for stale content (completed features, resolved decisions). If found, move it IN FULL to HYDRA_HISTORY.md — do not summarize or lose detail. If everything is still relevant, don't trim.

3. Create or update HYDRA_PLAN.md:
   - If it doesn't exist yet, create it from the current state of the project
   - Mark completed items as done
   - Add any new tasks or additions that came up this session
   - Update 'Current Focus' to reflect exactly where we are
   - If mid-task, note precisely what was being attempted and what state it's in

   Format:
   ## Current Focus
   > [Current task, including mid-task state if applicable]

   ## Plan
   - [x] 1. Completed item
   - [ ] 2. Current item
     - [x] 2.1 Done subtask
     - [ ] 2.2 Current subtask
   - [ ] 3. Upcoming item

   ## Additions
   | Added | Description | Status | Origin |
   |-------|-------------|--------|--------|
   | Session X | Description | Status | Context |

4. Create or append to HYDRA_HISTORY.md:
   - Add a numbered session entry (e.g. "## Session 3") with: what changed, why, key decisions, and anything archived from CLAUDE.md

5. Commit and push all changes

6. Read back CLAUDE.md and HYDRA_PLAN.md to verify everything is captured. Fix anything missing. Then give me:
   - A brief summary of what we accomplished this session
   - The exact prompt to paste in the next session to pick up where we left off
```
