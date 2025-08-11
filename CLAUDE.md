# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 Onboarding

At the start of each session, read:

1. Any `**/README.md` docs across the project
2. Any `**/README.*.md` docs across the project

## ✅ Quality Gates

When writing code, Claude must not finish until all of these succeed:

1. `npm run lint`
2. `npm run format`

If any check fails, fix the issues and run checks again.
