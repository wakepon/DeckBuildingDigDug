# Code Review

Comprehensive quality review of uncommitted changes:

1. Get changed files: git diff --name-only HEAD

2. For each changed file, check for:

**Code Quality (HIGH):**
- Functions > 50 lines
- Files > 800 lines
- Nesting depth > 4 levels
- Missing error handling
- console.log statements
- TODO/FIXME comments

**Best Practices (MEDIUM):**
- Mutation patterns (use immutable instead)
- Emoji usage in code/comments
- Accessibility issues (a11y)

3. Generate report with:
   - Severity: HIGH, MEDIUM
   - File location and line numbers
   - Issue description
   - Suggested fix

4. Block commit if HIGH issues found
