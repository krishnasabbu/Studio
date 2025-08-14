# Full-Featured Notification Template Builder

A comprehensive notification template management system built with React, TypeScript, and modern web technologies. This application provides a complete solution for creating, managing, and testing notification templates across multiple channels.

## 🚀 Features

### Core Functionality
- **Template Management** - Create, edit, and manage email, push, and SMS notification templates
- **Visual Email Builder** - Drag-and-drop interface for building complex email templates
- **Multi-Channel Support** - Email, Push Notifications, SMS, and Secure Inbox
- **Dynamic Variables** - Support for personalized content with formatters
- **Role-Based Access Control (RBAC)** - User management with granular permissions

### Advanced Features
- **Workflow Builder** - Visual workflow creation with node-based interface
- **Progress Visualization** - Real-time workflow execution progress with smooth animations
- **Activities Dashboard** - Independent activity management with workflow assignment
- **Alert Onboarding** - JIRA integration for alert configuration
- **Testing Framework** - Comprehensive testing across multiple environments
- **Dark Mode Support** - Full dark/light theme switching
- **Responsive Design** - Works seamlessly across all device sizes

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit with RTK Query
- **UI Components**: Custom component library with Lucide React icons
- **Drag & Drop**: React DnD for template builder
- **Workflow Visualization**: ReactFlow for workflow diagrams
- **Rich Text Editing**: ReactQuill for content editing
- **Build Tool**: Vite
- **Mock API**: JSON Server for development

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd notification-template-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development servers**
   ```bash
   npm run dev:full
   ```
   This starts both the Vite dev server and JSON Server for the mock API.

   Or run them separately:
   ```bash
   # Frontend only
   npm run dev

   # Mock API server only
   npm run server
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔐 Authentication

The application includes a demo authentication system with three user roles:

- **Admin** (`admin`) - Full access (Create, Read, Update, Delete)
- **Editor** (`editor`) - Create, Read, Update only
- **Viewer** (`viewer`) - Read-only access

Use any password with 6+ characters to log in.

## 📱 Application Structure

### Main Sections

1. **Dashboard** - Overview of all templates with search and filtering
2. **Template Creation** - Multi-step template creation wizard
3. **Email Builder** - Visual drag-and-drop email template designer
4. **Alert Onboarding** - JIRA-integrated alert configuration
5. **Workflow Builder** - Visual workflow creation and management
6. **Activities Dashboard** - Independent activity management
7. **Testing Suite** - Multi-environment testing framework
8. **RBAC Management** - User, role, and permission management

### Key Components

- **Visual Email Builder** - Drag widgets and components to build emails
- **Workflow Canvas** - Node-based workflow visualization
- **Progress Visualization** - Animated step-by-step execution tracking
- **Dynamic Variables** - Template personalization system
- **Multi-Channel Templates** - Support for Email, Push, SMS
- **Permission System** - Granular access control

## 🎨 Design System

The application uses a Wells Fargo-inspired design system with:

- **Primary Colors** - Red-based palette (#b31b1b)
- **Accent Colors** - Gold-based palette (#ffd700)
- **Typography** - Clean, professional font hierarchy
- **Spacing** - Consistent 8px grid system
- **Components** - Reusable UI component library
- **Animations** - Subtle micro-interactions and transitions

## 🔧 Development

### Bug Fixes Implemented

1. **Workflow Editing Issues Fixed:**
   - Fixed workflow data loading from API in WorkflowBuilderPage
   - Corrected node configuration saving in StageConfigPanel
   - Fixed workflow update API calls with proper data structure
   - Added proper error handling and loading states
   - Fixed ReactFlow instance management for programmatic control

2. **Progress Visualization Features Added:**
   - Real-time step-by-step progress tracking
   - Smooth animations (300-500ms duration) for state transitions
   - Visual indicators for current, completed, and failed steps
   - Responsive design with accessibility considerations
   - Interactive step navigation with focus management

### Available Scripts

- `npm run dev` - Start development server
- `npm run dev:full` - Start both frontend and mock API
- `npm run server` - Start JSON Server only
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── layout/         # Layout components
│   ├── email-editor/   # Email builder components
│   └── workflow/       # Workflow components
├── pages/              # Page components
├── store/              # Redux store and slices
├── services/           # API services
├── hooks/              # Custom React hooks
└── data/               # Mock data files
```

## 🚀 Deployment

### Testing Instructions

1. **Test Workflow Editing:**
   ```bash
   # Navigate to /workflows/builder
   # Click on existing workflow to edit
   # Verify nodes can be configured and saved
   # Test workflow creation and updates
   ```

2. **Test Progress Visualization:**
   ```bash
   # Navigate to /workflows/demo
   # Click "Start Execution" to see animated progress
   # Test pause/resume functionality
   # Verify step-by-step animations work smoothly
   ```

3. **Test Workflow Execution:**
   ```bash
   # Navigate to /workflows/execution/{id}
   # Start workflow execution
   # Verify progress visualization appears
   # Test real-time updates and animations
   ```

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Set up a real backend** to replace JSON Server in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.