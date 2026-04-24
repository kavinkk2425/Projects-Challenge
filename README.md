# Milestone-by-KK

A modern, mobile-responsive milestone tracking application with user authentication and SQLite database storage.

![Milestone-by-KK](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🔐 **Dual Authentication System**
- **User Login**: Register and manage your personal milestones
- **Admin Login**: Full system access with user management capabilities

### 📊 **Milestone Management**
- Create, edit, and delete milestones
- Set priorities (High, Medium, Low)
- Track progress with interactive sliders (0-100%)
- Add due dates and categories
- Filter by status (All, Not Started, In Progress, Done, Overdue)
- Visual progress bars with smooth animations

### 👥 **Admin Dashboard**
- View all registered users
- See system-wide milestone statistics
- Manage users (view details, remove users)
- Monitor all milestones across the platform

### 📱 **Mobile-First Design**
- Fully responsive layout (320px to 4K+)
- Touch-optimized controls
- Swipeable filter tabs
- iPhone notch & home indicator support
- Optimized tap targets for mobile devices

### 🎨 **Premium Dark UI**
- Modern glassmorphic design
- Animated background particles
- Smooth transitions and micro-interactions
- Custom fonts (Syne + DM Mono)
- Accessible color contrasts

### 💾 **Data Persistence**
- SQLite database powered by sql.js
- Automatic localStorage backup
- No server required - runs entirely in browser

---

## 🚀 Quick Start

### Option 1: Single File (Easiest)
Open `milestone-os.html` directly in any modern browser. Everything is included in one file.

### Option 2: Separate Files (Recommended for Development)
1. Ensure all files are in the same directory:
   ```
   milestone-os/
   ├── index.html
   ├── styles.css
   ├── app.js
   └── README.md
   ```

2. Open `index.html` in your browser or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (with http-server)
   npx http-server
   ```

3. Navigate to `http://localhost:8000`

---

## 🔑 Login Credentials

### Admin Access
```
Username: admin
Password: admin123
```

### User Access
Register a new account using the "Register free" link on the login screen.

---

## 📁 File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # All styling (mobile-first responsive)
├── app.js             # Application logic & database
├── milestone-os.html  # Single-file version (standalone)
└── README.md          # Documentation (this file)
```

### File Breakdown

**`index.html`** (3.5 KB)
- Semantic HTML5 structure
- Login & registration screens
- User & admin panels
- Milestone forms and lists

**`styles.css`** (15 KB)
- Modern CSS with CSS variables
- Mobile-first responsive design
- Dark theme with glassmorphism
- Smooth animations & transitions
- Cross-browser compatibility

**`app.js`** (11 KB)
- SQLite database management
- User authentication
- CRUD operations for milestones
- Real-time UI updates
- Form validation
- Data persistence

---

## 🎯 Usage Guide

### For Users

1. **Register**: Click "Register free" and create your account
2. **Login**: Sign in with your username/email and password
3. **Add Milestone**: Fill in the form and click "+ Add milestone"
4. **Track Progress**: Use the slider to update completion percentage
5. **Filter**: Click filter tabs to view specific milestone categories
6. **Mark Complete**: Click "Done" to mark a milestone as complete

### For Admins

1. **Login**: Use admin credentials
2. **View Stats**: See system-wide milestone statistics
3. **Manage Users**: View all registered users and their milestone counts
4. **Monitor Milestones**: See all milestones across all users
5. **Remove Users**: Delete users and their associated data

---

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **JavaScript (ES6+)**: Application logic
- **SQL.js**: SQLite compiled to WebAssembly
- **LocalStorage**: Data persistence

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Database Schema

**users table**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password TEXT,
  created_at TEXT
);
```

**milestones table**
```sql
CREATE TABLE milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'not-started',
  progress INTEGER DEFAULT 0,
  due_date TEXT DEFAULT '',
  created_at TEXT DEFAULT ''
);
```

---

## 🎨 Design Features

### Color Palette
- **Background**: Deep dark (`#0a0a0f`, `#111118`, `#1a1a26`)
- **Accent**: Purple gradient (`#6c63ff` → `#38bdf8`)
- **Success**: Green (`#34d399`)
- **Warning**: Amber (`#fbbf24`)
- **Error**: Red (`#f87171`)

### Typography
- **Display**: Syne (800 weight for headings)
- **Monospace**: DM Mono (stats and metadata)

### Responsive Breakpoints
- Mobile: < 480px (2-column stats grid)
- Tablet: 480px - 768px (4-column stats grid)
- Desktop: > 768px (full layout)

---

## 🔒 Security Notes

⚠️ **Important**: This is a client-side demo application. For production use:

1. **Never store plain-text passwords** - Use proper hashing (bcrypt, Argon2)
2. **Implement server-side authentication** - Don't rely on client-side checks
3. **Use HTTPS** - Encrypt all data transmission
4. **Add CSRF protection** - Prevent cross-site request forgery
5. **Sanitize inputs** - Prevent XSS and SQL injection attacks
6. **Implement rate limiting** - Prevent brute force attacks

This demo uses basic client-side validation for educational purposes only.

---

## 📱 Mobile Features

- **Safe area support**: Automatically handles iPhone notch and home indicator
- **Touch-optimized**: 44px+ tap targets for all interactive elements
- **Swipeable filters**: Horizontal scroll for filter tabs
- **Responsive forms**: Single-column layout on small screens
- **Optimized inputs**: Native keyboard types for email, text, password
- **No zoom on focus**: Proper font sizes prevent iOS zoom

---

## 🐛 Troubleshooting

### Database not loading
- Clear browser cache and localStorage
- Check browser console for errors
- Ensure sql.js CDN is accessible

### Styles not applying
- Verify `styles.css` is in the same directory as `index.html`
- Check browser console for 404 errors
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### JavaScript errors
- Verify `app.js` is in the same directory
- Ensure sql.js loaded successfully
- Check browser compatibility

---

## 📄 License

MIT License - feel free to use, modify, and distribute.

---

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs!

---

## 📞 Support

For issues or questions, check the browser console for error messages and ensure all files are properly linked.

---

**Built with ❤️ using modern web technologies**
