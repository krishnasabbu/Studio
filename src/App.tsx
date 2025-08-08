import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './hooks/useRedux';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateTemplatePage from './pages/CreateTemplatePage';
import PushSmsTemplatePage from './pages/PushSmsTemplatePage';
import AlertsDashboardPage from './pages/AlertsDashboardPage';
import AlertOnboardPage from './pages/AlertOnboardPage';
import NotificationTestPage from './pages/NotificationTestPage';
import NotificationTestExecutePage from './pages/NotificationTestExecutePage';
import WorkflowDashboardPage from './pages/WorkflowDashboardPage';
import WorkflowCreatePage from './pages/WorkflowCreatePage';
import WorkflowExecutePage from './pages/WorkflowExecutePage';
import TaskManagementPage from './pages/TaskManagementPage';
import TaskCreatePage from './pages/TaskCreatePage';
import RbacUsersPage from './pages/RbacUsersPage';
import RbacRolesPage from './pages/RbacRolesPage';
import RbacPermissionsPage from './pages/RbacPermissionsPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { isDarkMode } = useAppSelector(state => state.theme);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <div className={`${isDarkMode ? 'dark' : ''}`}>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateTemplatePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates/push-sms"
            element={
              <ProtectedRoute>
                <Layout>
                  <PushSmsTemplatePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts-dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <AlertsDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alert-onboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <AlertOnboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests"
            element={
              <ProtectedRoute>
                <Layout>
                  <NotificationTestPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/execute"
            element={
              <ProtectedRoute>
                <Layout>
                  <NotificationTestExecutePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowCreatePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/execute/:workflowId"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowExecutePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Layout>
                  <TaskManagementPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <TaskCreatePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rbac/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <RbacUsersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rbac/roles"
            element={
              <ProtectedRoute>
                <Layout>
                  <RbacRolesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rbac/permissions"
            element={
              <ProtectedRoute>
                <Layout>
                  <RbacPermissionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;