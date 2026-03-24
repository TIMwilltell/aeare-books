# Phase 3 Context: Progress Tracking

**Phase:** 3 - Progress Tracking
**Date:** 2026-03-24
**Status:** Ready for planning

## User Decisions

### Data Model (per D-03-01)
- **Decision:** Separate ProgressEvent table for chronological tracking
- **Rationale:** Better supports READ-05 (event history) while keeping Book table clean

### UX Flow (per D-03-02)
- **Decision:** Button on detail page to mark as read
- **Rationale:** Simple, clear action from the book detail context

### Notes Field (per D-03-03)
- **Decision:** Plain text, no character limit
- **Rationale:** Simplicity, no rich text needed for reading notes

## Requirements Covered

| ID | Requirement |
|----|-------------|
| READ-01 | User can mark a book as read |
| READ-02 | User can record date book was completed |
| READ-03 | User can enter AR quiz score (0-100) |
| READ-04 | User can record date of AR quiz attempt |
| READ-05 | App tracks sequence of all progress events |
| READ-06 | User can add notes to a book entry |

## Current State

### Book Model (src/lib/db/index.ts)
```typescript
interface Book {
  id?: number;
  isbn: string;
  title: string;
  author: string;
  coverUrl?: string;
  arLevel?: number;
  arPoints?: number;
  arDataSource?: 'fetched' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}
```

### New Fields to Add
- Book: `isRead: boolean`, `readDate: Date | null`, `notes: string`
- New table: `ProgressEvent`

### Detail Page (src/routes/book/[id]/+page.svelte)
- Current: Shows title, author, ISBN, AR info, Edit/Delete buttons
- Needed: Read status toggle, quiz score/date, notes, progress timeline

## Implementation Notes

### Dexie.js Schema Version
- Current version: 2
- New version: 3 (add isRead, readDate, notes to books table)

### ProgressEvent Types
- `marked_read` — when book is marked as read
- `quiz_completed` — when quiz score is entered
- `notes_added` — when notes are added/updated
- `book_added` — original scan date (already tracked)

### UI Components Needed
- ProgressTimeline.svelte — shows chronological events
- Already has: DeleteDialog, LoadingSpinner, BookList, FAB

## Constraints

- Must maintain offline-first approach (all data in IndexedDB)
- Progress events must be retrievable by book ID
- Quiz score validation: 0-100 integer
- Date fields should default to today when set

## Out of Scope

- Multi-child profiles (v2)
- Goal tracking (v2)
- Export functionality (Phase 4)
- Cloud sync (Phase 4)
