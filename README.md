# TinyMonth 📅

A modern, intuitive calendar management application built with Next.js and React for tracking time, managing schedules, and organizing your life with color-coded calendars and smart features.

![TinyMonth Application](https://img.shields.io/badge/Next.js-15.4.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🗓️ **Smart Calendar Management**
- **Multi-month view** with intuitive navigation
- **Color-coded calendars** for easy visual organization
- **Current day/month highlighting** with enhanced visual feedback
- **Responsive design** that works on all devices

### 📊 **Comprehensive Statistics**
- **Annual overview** with day counts for each calendar
- **Real-time updates** as you manage your schedule
- **Visual indicators** showing your time distribution

### 💬 **Comment System**
- **Add notes to any day** using Ctrl+click (or Cmd+click on Mac)
- **Yellow dot indicators** show days with comments
- **Hover tooltips** display comment content
- **Persistent storage** of all your notes

### 🔄 **Import/Export Functionality**
- **Export your data** to JSON files for backup
- **Import existing data** from JSON files
- **Seamless data migration** between instances
- **Version control** for your calendar data

### 🎨 **Beautiful Interface**
- **Clean, modern design** with Tailwind CSS
- **Intuitive navigation** and user experience
- **Color-coded system** for easy recognition
- **Responsive layout** for all screen sizes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sstoma/tinymonth-clone.git
   cd tinymonth-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 How to Use

### Adding Calendars
- Click the **"+"** button in the Calendars section
- Choose a color and name for your calendar
- Your new calendar will appear in the list

### Managing Days
- **Click on any day** to assign/remove calendar assignments
- **Ctrl+click (or Cmd+click)** to add/edit comments
- **Hover over days** to see tooltips with details

### Importing/Exporting Data
- **Export**: Click the blue "📤 Export to file" button
- **Import**: Click the green "📥 Import from file" button and select a JSON file

### Adding Comments
- **Ctrl+click** (or Cmd+click on Mac) on any day
- Type your comment in the modal
- Save or remove comments as needed
- Yellow dots indicate days with comments

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Data Persistence**: Local JSON storage with API routes

### Key Components
- **AppDataContext**: Centralized state management
- **YearCalendar**: Multi-month calendar display
- **CalendarList**: Sidebar with calendar management
- **YearSelector**: Annual statistics and year navigation
- **DayCell**: Individual day cell with interactions
- **CommentModal**: Comment editing interface

### Data Structure
```typescript
interface AppData {
  calendars: CalendarItem[];
  assignments: Record<string, string[]>;
  activeId: string | null;
  comments: Record<string, string>;
}
```

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   └── page.tsx        # Main page
├── components/          # React components
│   ├── AppDataContext.tsx
│   ├── CalendarList.tsx
│   ├── CommentModal.tsx
│   ├── DayCell.tsx
│   └── YearCalendar.tsx
└── styles/             # CSS and styling
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📸 Screenshots

The application features a clean, modern interface with:
- **Header section** with import/export buttons
- **Annual statistics** showing calendar day counts
- **Comment instructions** with helpful tips
- **Left sidebar** for calendar management
- **Main calendar view** with color-coded day assignments
- **Current month highlighting** (e.g., March 2025 with blue border)
- **Current day highlighting** (e.g., August 22, 2025 with blue background)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from various open source icon sets

---

**TinyMonth** - Organize your time, one day at a time! 📅✨
