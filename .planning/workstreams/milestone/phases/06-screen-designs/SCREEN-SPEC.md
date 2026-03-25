# AeAre Screen Specification

> **Phase:** 06-Screen Designs  
> **Generated:** 2026-03-24  
> **Design System:** Literary Horizon (Stitch Project 3676387148203023923)

---

## Table of Contents

1. [Screen Reference](#screen-reference)
2. [SCRN-01: Library Screen](#scrn-01-library-screen)
3. [SCRN-02: Scan Flow Screen](#scrn-02-scan-flow-screen)
4. [SCRN-03: Book Detail Screen](#scrn-03-book-detail-screen)
5. [SCRN-04: Add/Edit Progress Screen](#scrn-04-addedit-progress-screen)
6. [SCRN-05: Settings/Export Screen](#scrn-05-settingsexport-screen)
7. [SCRN-06: Responsive Behavior](#scrn-06-responsive-behavior)
8. [Implementation Checklist](#implementation-checklist)

---

## Screen Reference

This design spec documents mockups from Stitch project **3676387148203023923** ("Literary Horizon" design system).

| Requirement | Stitch Screen | Screen ID | Dimensions | Device |
|-------------|---------------|-----------|-------------|--------|
| SCRN-01 | Whimsical Library | `495b0282c7f64bddaa9dd89a24e011d9` | 780x2558 | Mobile |
| SCRN-02 | Whimsical Scan | `35b73520f61741d7885d6d46dfb11c09` | 780x2348 | Mobile |
| SCRN-02 | Whimsical Manual Entry | `233a7e1da57740ed9b3d0711495e550b` | 780x2534 | Mobile |
| SCRN-03 | Whimsical Detail | `4fccf8a7882140ce80e4be93afa4a43b` | 780x3710 | Mobile |
| SCRN-04 | Whimsical Log | `b875b444ce8747e7b88a54cc78cf182d` | 780x2724 | Mobile |
| SCRN-05 | Whimsical Settings | `958bc23d4fad439a9d742236b5598ed8` | 780x3010 | Mobile |

---

## SCRN-01: Library Screen

**Stitch Screen:** Whimsical Library (Mobile)  
**Dimensions:** 780x2558px  
**Device:** Mobile

### Screenshot
![Whimsical Library](https://lh3.googleusercontent.com/aida/ADBb0uiZEvG-BOnjmUTHfui1s8leEuw2KzeQnMrn444a2Pda3EGDf7fn_-VYIU07APvRqn-KGnwLHa4pbyrEYOi2HBE87n8fgHhMWHELJeVCTARhKRpydfrjjrz6dFSzsQLmpBBJPBFH-rvpaL_vUZwIdeTfXwWtG9hjoLRFd8QI-HBSuOlPOm4gHS5VG_rCQ3kNmR6KtvcJ5u0jd2FIBS_636K_FizE9Q1Kj2xyZ5LIC0kPZ8PD6bM9HQVyjG8)

### Layout Structure

| Section | Description | Design Tokens |
|---------|-------------|---------------|
| Header | "My Library" title with glassmorphism background | `surface` 80% opacity, backdrop blur 20px |
| Search Bar | Full-width search with placeholder "Search by title or author..." | `surface-container-highest` bg, `on-surface-variant` text |
| View Toggle | List/Grid toggle buttons (icon-based) | `primary` active, `on-surface-variant` inactive |
| Book List | Scrollable list of book cards | `surface` background |
| FAB | Floating action button for scan | Gradient fill (#005ba4 → #0c74cc), ambient shadow |

### Components Used

| Component | Reference | Usage |
|-----------|-----------|-------|
| COMP-04 | Book Card | Display each book with thumbnail, title, author, AR badges |
| COMP-10 | FAB | Bottom-right scan button with gradient fill |
| COMP-01 | Primary Button | View toggle (active state) |
| COMP-09 | Empty State | Shown when library has no books |
| COMP-06 | Toast | Search results feedback |

### Visual Specifications

- **Book Card Layout:** Horizontal (list) / Vertical grid
- **Thumbnail:** 60x90px with md radius (0.75rem)
- **Title:** Noto Serif, 600 weight, `on-surface` color
- **Author:** Inter, 400 weight, `on-surface-variant` color
- **AR Badge:** COMP-07, showing level (e.g., "3.2L") and "Fetched" or "Manual" indicator

### Interactions

1. **Search:** Real-time filtering as user types
2. **Toggle View:** Switch between list and grid layouts
3. **Tap Book Card:** Navigate to SCRN-03 (Detail)
4. **Tap FAB:** Navigate to SCRN-02 (Scan)
5. **Pull to Refresh:** Trigger sync with Convex

---

## SCRN-02: Scan Flow Screen

**Stitch Screens:** Whimsical Scan + Whimsical Manual Entry  
**Dimensions:** 780x2348px / 780x2534px  
**Device:** Mobile

### Screenshot - Scan
![Whimsical Scan](https://lh3.googleusercontent.com/aida/ADBb0ug_8-t8vdI1IGNwTcTTfISP2KyqejsJ2fmZ9TVnN3RlbfjutfAS6y0JK7LJy4SQNXp_HxbyLxSnNxCz-EaJxW7rkJpLkSp0dU9Scv857SsUTH2nkUiCPy6Ky2RN_zL55TdyQ66rgPeFn-polcbghtT3R4O2NY6BraiITI1se2_KDlkRP2KMEic8SkWJZlZrZ_lAoh_nuH732oR5mwDw6HY3wyjLzwdwFb8FkIPpftLf84mHMHENHPp0aGI)

### Screenshot - Manual Entry
![Whimsical Manual Entry](https://lh3.googleusercontent.com/aida/ADBb0uizSgJPCHPb8H_Ar1IX9_OFv7iHg0ZWWmADPG6vY2FaN_XpICzSdc6gfdfvFXSAPKIayM95HvvkRPzSie--wzSpoW1j8_w7RsnrdkNp8xW1f0ZnGepr-DwIiFdxo7tpImrT6IGhkC37Dm708r_VEkxd51G7iespM-WtZF3q3hUWFIxgtXjUGyG7YikqoL8deAVMEqmhKgYc3ihuQT_vOvxC6m5v70j-oMT5Adlz_60XXKawXKszhgkbxg)

### Layout Structure - Scan Screen

| Section | Description | Design Tokens |
|---------|-------------|---------------|
| Header | "Scan Book" title with back button | Glassmorphism |
| Camera View | Full-screen camera preview | `surface` background |
| Scan Frame | Centered rectangular overlay | 60% opacity white border |
| Scan Button | Large circular button at bottom | COMP-10 FAB style, gradient |
| Manual Link | "Enter manually instead" text link | `primary` color |

### Layout Structure - Manual Entry Screen

| Section | Description | Design Tokens |
|---------|-------------|---------------|
| Header | "Add Book" title with back button | Glassmorphism |
| Form | ISBN input + Lookup button | Vertical stack |
| ISBN Input | Large text input field | COMP-03 |
| Lookup Button | Primary button | COMP-01 |
| Loading State | Spinner during lookup | COMP-08 |

### Components Used

| Component | Reference | Usage |
|-----------|-----------|-------|
| COMP-10 | FAB | Scan button (camera icon, gradient fill) |
| COMP-03 | Text Input | ISBN entry field |
| COMP-01 | Primary Button | Lookup button |
| COMP-02 | Secondary/Ghost Button | "Enter manually instead" link |
| COMP-06 | Toast | Error messages (camera denied, ISBN not found) |
| COMP-08 | Loading Spinner | Shown during lookup |
| COMP-05 | Modal | Camera permissions request |

### Interactions

1. **Camera Permissions:** Show COMP-05 modal on first access
2. **Scan:** Tap FAB to trigger barcode scan
3. **Manual Entry:** Tap "Enter manually instead" to navigate to manual entry
4. **Lookup:** Tap "Lookup" button to fetch book metadata
5. **Loading:** Show COMP-08 spinner during API calls
6. **Success:** Navigate to SCRN-03 (Detail) with populated data
7. **Error:** Show COMP-06 toast with error message

---

## SCRN-03: Book Detail Screen

**Stitch Screen:** Whimsical Detail (Mobile)  
**Dimensions:** 780x3710px  
**Device:** Mobile

### Screenshot
![Whimsical Detail](https://lh3.googleusercontent.com/aida/ADBb0ugOEz6mgayoMWipA1DMVdffSQOZlstw1YkD4wQeOBO96Xp6pspjVm0GZwT8qALl365vLgYYuRk_-8EsbatdkqWNablsRAnG1HOj-eAW52zzA0P12K7Ml2xcHZmH6W3zpn7mcT-UTjvhNqUyfWX3KYsGf27ov1PDiFfzWJAWSfDCyNfxEv2HK3tj8ZziAqMh5d7TaHRx9qrljjvmskT2AT03MbOBLRxWRlzLXElQHZzNc9AeTw2Fi_pYUg)

### Layout Structure

| Section | Description | Design Tokens |
|---------|-------------|---------------|
| Header | "Book Details" with back and action buttons | Glassmorphism |
| Cover Image | Large book cover (centered) | Aspect ratio 2:3, lg radius |
| Metadata | Title, Author, ISBN | Display/Headline typography |
| AR Section | Level, Points, Source badge | COMP-07 badges |
| Progress Section | Read date, Quiz date, Quiz score | Timeline layout |
| Notes | Notes text (if any) | Body text, expandable |
| Action Buttons | Edit, Delete | Row of buttons |

### Components Used

| Component | Reference | Usage |
|-----------|-----------|-------|
| COMP-05 | Modal | Delete confirmation dialog |
| COMP-07 | Badge | AR fetched vs. manual indicator |
| COMP-01 | Primary Button | Edit button |
| COMP-02 | Secondary/Ghost Button | Delete button |
| COMP-06 | Toast | Confirmation messages |

### Visual Specifications

- **Cover:** 240x360px, lg radius (1rem), centered
- **Title:** Noto Serif, 700 weight, Display role
- **AR Badge (Fetched):** `tertiary-container` bg, `tertiary` text
- **AR Badge (Manual):** `secondary-container` bg, `secondary` text
- **Progress Timeline:** Vertical line with date markers

### Interactions

1. **View:** Scroll to see all metadata and progress
2. **Edit:** Navigate to SCRN-04 (Add/Edit Progress)
3. **Delete:** Show COMP-05 confirmation modal
4. **Confirm Delete:** Remove book, navigate back to library

---

## SCRN-04: Add/Edit Progress Screen

**Stitch Screen:** Whimsical Log (Mobile)  
**Dimensions:** 780x2724px  
**Device:** Mobile

### Screenshot
![Whimsical Log](https://lh3.googleusercontent.com/aida/ADBb0ujKHlU3rHAbCx964kGKkV0DuR6cxw1McSV5MqeUUuhLqb7ZzgKXcP87wZ-QhsdxXG90TodegcElofe3BAzfjwoMRi-LRmBZcrQzsrU6UtFq_W4E9QkLf6D0dpkVfyRXPB3lZ7D2NVcyOEN1wxIY2bWgEoodoYTLf6SE2UfTjzBNZTP4sD6F7yqrft8mctdI2oRptmT4Q2N_yww5UBryCWNo0iHuDYw5ofcfK7tTvBnIRItOG5h5a30vB44)

### Layout Structure

| Section | Description | Design Tokens |
|---------|-------------|---------------|
| Header | "Log Progress" with back and save buttons | Glassmorphism |
| Form | Vertical form with fields | `surface` background |
| Read Date | Date picker field | COMP-03 |
| Quiz Score | Number input (0-100) | COMP-03 |
| Quiz Date | Date picker field | COMP-03 |
| Notes | Textarea for notes | COMP-03 |
| Save Button | Primary button | COMP-01 |
| Cancel Button | Secondary button | COMP-02 |

### Components Used

| Component | Reference | Usage |
|-----------|-----------|-------|
| COMP-03 | Text Input | All form fields (date pickers, number input, textarea) |
| COMP-01 | Primary Button | Save button |
| COMP-02 | Secondary/Ghost Button | Cancel button |
| COMP-06 | Toast | Validation errors, save confirmation |

### Visual Specifications

- **Date Picker:** Calendar icon, `surface-container-highest` background
- **Quiz Score:** Number input with range 0-100, percentage display
- **Notes:** Multiline textarea, character count indicator
- **Spacing:** 8 (2rem) between form fields

### Interactions

1. **Fill Form:** User enters read date, quiz score, quiz date, notes
2. **Validation:** Real-time validation (quiz score 0-100)
3. **Save:** Tap save to persist to Convex
4. **Cancel:** Discard changes, navigate back
5. **Success:** Show COMP-06 toast, navigate to SCRN-03

---

## SCRN-05: Settings/Export Screen

**Stitch Screen:** Whimsical Settings (Mobile)  
**Dimensions:** 780x3010px  
**Device:** Mobile

### Screenshot
![Whimsical Settings](https://lh3.googleusercontent.com/aida/ADBb0ugLWvHE3YU8VgQMID-lsSVkDv-icYqwjyuyj11Edh5ujY-2A_EBK60yRJmxFzPkF9B1umEFjYY2ZgHJIkk25DQbAzP3Cg7cICuNt1ISCgRM8_W6GklqrqLFF3c-hqRr7dOm9Sflrc_-vu5jeLICJrP6gsVBQdbgYqwFJlaJoFhZN66oI6stiEssawBrOgNNaTsrg--T8EBAM8HKT9YmveOmOaKtMZymY-z70qOwHzfTEjWeeHDKzHUXaJ4)

### Layout Structure

| Section | Description | Design Tokens |
|---------|-------------|---------------|
| Header | "Settings" title | Glassmorphism |
| Sync Section | Status, last sync, manual sync button | Vertical stack |
| Export Section | Export to JSON button | Vertical stack |
| App Info | Version, about | Footer section |

### Sync Section Details

| Element | Description | Design Tokens |
|---------|-------------|---------------|
| Status Badge | Online/Offline indicator | COMP-07, green/red variants |
| Last Sync | Timestamp text | Body text, `on-surface-variant` |
| Sync Now | Primary button | COMP-01 |

### Export Section Details

| Element | Description | Design Tokens |
|---------|-------------|---------------|
| Export JSON | Primary button | COMP-01 |
| Description | "Download your library data" | Body text |

### Components Used

| Component | Reference | Usage |
|-----------|-----------|-------|
| COMP-01 | Primary Button | Sync Now, Export JSON |
| COMP-07 | Badge | Sync status (online/offline) |
| COMP-06 | Toast | Sync success, export ready |
| COMP-08 | Loading Spinner | During sync/export |

### Interactions

1. **View Status:** See online/offline badge and last sync time
2. **Manual Sync:** Tap "Sync Now" to force sync with Convex
3. **Export:** Tap "Export JSON" to download library data
4. **Loading:** Show COMP-08 during sync/export operations
5. **Success:** Show COMP-06 toast with result

---

## SCRN-06: Responsive Behavior

### Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 600px | Single column, bottom navigation |
| Tablet | 600px - 1023px | Two-column grid, bottom nav |
| Desktop | ≥ 1024px | Three-column grid, side navigation |

### Navigation

| View | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| Library | Bottom tab bar | Bottom tab bar | Sidebar |
| Scan | Bottom tab bar | Bottom tab bar | Sidebar |
| Detail | Full screen | Full screen | Modal |
| Settings | Bottom tab bar | Bottom tab bar | Sidebar |

### Library Grid

| View | Columns | Card Width |
|------|---------|------------|
| Mobile (List) | 1 | Full width |
| Mobile (Grid) | 2 | ~170px |
| Tablet | 2 | ~280px |
| Desktop | 3 | ~320px |

### Screen Adaptations

1. **Library:** Grid cards expand on larger screens
2. **Detail:** Becomes modal/side-panel on desktop
3. **Navigation:** Bottom bar → Sidebar at 1024px+
4. **FAB:** Remains bottom-right on mobile, moves to header on desktop

---

## Implementation Checklist

### Phase 1: Core Screens

| Screen | Requirements | Components Needed | Status |
|--------|--------------|-------------------|--------|
| Library (SCRN-01) | COMP-04, COMP-10, COMP-09 | FAB, BookCard, EmptyState, SearchBar | [ ] |
| Scan (SCRN-02) | COMP-10, COMP-03, COMP-01 | FAB, TextInput, PrimaryButton | [ ] |
| Manual Entry (SCRN-02) | COMP-03, COMP-01, COMP-02 | TextInput, PrimaryButton, SecondaryButton | [ ] |

### Phase 2: Detail & Progress

| Screen | Requirements | Components Needed | Status |
|--------|--------------|-------------------|--------|
| Detail (SCRN-03) | COMP-05, COMP-07, COMP-01, COMP-02 | Modal, Badge, PrimaryButton, SecondaryButton | [ ] |
| Progress (SCRN-04) | COMP-03, COMP-01, COMP-02 | TextInput, PrimaryButton, SecondaryButton | [ ] |

### Phase 3: Settings & Responsive

| Screen | Requirements | Components Needed | Status |
|--------|--------------|-------------------|--------|
| Settings (SCRN-05) | COMP-01, COMP-07, COMP-06, COMP-08 | PrimaryButton, Badge, Toast, Spinner | [ ] |
| Responsive (SCRN-06) | Navigation changes, Grid layouts | - | [ ] |

### Component Usage Summary

| Component | Used In |
|-----------|---------|
| COMP-01 (Primary Button) | Scan, Detail, Progress, Settings |
| COMP-02 (Secondary Button) | Detail, Progress |
| COMP-03 (Text Input) | Scan, Manual Entry, Progress |
| COMP-04 (Book Card) | Library |
| COMP-05 (Modal) | Detail |
| COMP-06 (Toast) | All screens |
| COMP-07 (Badge) | Detail, Settings |
| COMP-08 (Loading Spinner) | Scan, Settings |
| COMP-09 (Empty State) | Library |
| COMP-10 (FAB) | Library, Scan |

---

## Related Documents

- [COMPONENT-SPEC.md](../05-component-specifications/COMPONENT-SPEC.md) - Component definitions
- [Stitch Project](https://studio.stitch.tech/s/p/3676387148203023923) - Design system source

---

*Document generated from Stitch project 3676387148203023923 - "Literary Horizon" design system*
