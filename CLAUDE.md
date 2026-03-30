# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **WeChat Mini Program** (微信小程序) called "每周计划" (Weekly Plan) - a dual-feature application for weekly task management and meal planning.

- **Platform**: WeChat Mini Program framework
- **Language**: JavaScript (ES6+), WXML, WXSS
- **AppID**: `wx427e96585d6ff71a`
- **Development**: Requires WeChat Developer Tools (微信开发者工具) - no CLI build commands

## Architecture

```
vibe-coding/
├── app.js              # Entry point, global state (darkMode)
├── app.json            # Pages, tabBar, window config
├── app.wxss            # Global styles, CSS variables, theme system
├── pages/              # Page modules (each: .js, .json, .wxml, .wxss)
│   ├── index/          # Home - weekly task management
│   ├── menu/           # Weekly menu planning
│   ├── dishes/         # Dish library
│   ├── meal-config/    # Meal time configuration
│   ├── history/        # Historical weeks
│   └── settings/       # App settings
├── components/         # Reusable UI components
└── utils/              # Business logic modules
    ├── storage.js      # Task storage, history archival
    ├── dish-storage.js # Dish/menu storage
    ├── week.js         # Week calculations (Monday-first)
    └── util.js         # Utilities (debounce, toast, etc.)
```

**Data Flow**: Pages (View) ↔ Utils (Business Logic) ↔ wx.Storage (Persistence)

## Two Feature Domains

### 1. Task Management (pages/index/)
- Tasks with priorities (high/medium/low) and due dates
- Week-based organization with auto-archival to history
- Completion tracking with statistics

### 2. Meal Planning (pages/menu/, pages/dishes/)
- Dish library with tags and ingredients
- Weekly menu by day and meal type (早餐/午餐/晚餐/下午茶/夜宵)
- Random dish recommendation
- Configurable meal times

## Data Models

**Task** (storage.js):
```javascript
{
  id: String,           // Timestamp + random suffix
  title: String,
  priority: Number,     // 1=high, 2=medium, 3=low
  dueDate: String,      // YYYY-MM-DD
  completed: Boolean,
  completedAt: String,  // ISO timestamp
  createdAt: String,
  weekId: String        // Format: "YYYY-Wnn" (e.g., "2026-W13")
}
```

**Dish** (dish-storage.js):
```javascript
{
  id: String,
  name: String,
  tags: Array<String>,      // e.g., ['快手菜', '素菜']
  ingredients: Array<String>,
  note: String,
  createdAt: String
}
```

**Menu Week** (dish-storage.js):
```javascript
{
  weekId: String,       // YYYY-MM-DD (Monday's date) - different from task weekId!
  startDate: String,
  endDate: String,
  days: {
    'YYYY-MM-DD': {
      '早餐': [dishId1, dishId2],
      '午餐': [dishId3],
      // ...
    }
  }
}
```

## Key Technical Details

- **Storage**: Uses `wx.getStorageSync`/`wx.setStorageSync` (synchronous)
- **Week Calculation**: Chinese-style, Monday as first day (see `utils/week.js`)
- **Two Week ID Formats**: Tasks use `YYYY-Wnn`, Menu uses `YYYY-MM-DD` (Monday date)
- **Dark Mode**: CSS variables in `app.wxss`, toggled via `app.globalData.darkMode`
- **Components**: Use WeChat's `observers` for reactive property changes, `triggerEvent` for parent communication

## Component Pattern

Components are pure UI with event-based communication:
- Properties passed via `properties` definition
- Events emitted via `this.triggerEvent('eventname', data)`
- Parents bind via `bind:eventname="handler"`
