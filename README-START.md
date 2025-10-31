# Feynman Learning Platform - Quick Start

## 🚀 Quick Start Commands

### 1. Start the Project
```bash
# Double-click to run
start-project.bat
```

### 2. Check Status
```bash
# Double-click to run
check-status.bat
```

### 3. Test API
```bash
# Double-click to run
test-api.bat
```

## 📋 Manual Start (if batch files don't work)

### Backend Service
```bash
node index-simple.js
```

### Frontend Service
```bash
cd feynman-platform-frontend
npm run dev
```

## 🌐 Access URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## 🔧 Troubleshooting

### If you see Chinese characters as garbled:
1. Use the English batch files (start-project.bat, check-status.bat, test-api.bat)
2. Or run commands manually in terminal

### If registration fails with 500 error:
1. Check backend console for error messages
2. Ensure backend is running on port 3000
3. Verify API paths are correct

### If frontend can't connect to backend:
1. Check if backend service is running
2. Verify port 3000 is not blocked
3. Check browser console for network errors

## 📞 Support

If you encounter issues:
1. Check the console output in each service window
2. Look for error messages in browser console
3. Verify all services are running on correct ports







