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
import WorkflowExecutePage from './pages/WorkflowExecutePage';
import WorkflowActionDashboard from './pages/WorkflowActionDashboard';
import ActivitiesDashboardPage from './pages/ActivitiesDashboardPage';
import RbacUsersPage from './pages/RbacUsersPage';
import RbacRolesPage from './pages/RbacRolesPage';
import RbacPermissionsPage from './pages/RbacPermissionsPage';
import WorkflowBuilderPage from './pages/WorkflowBuilderPage';
import WorkflowListPage from './pages/WorkflowListPage';
import WorkflowMappingPage from './pages/WorkflowMappingPage';
import WorkflowExecutionPage from './pages/WorkflowExecutionPage';
import ApprovalsPage from './pages/ApprovalsPage';
import WorkflowDemoPage from './pages/WorkflowDemoPage';
import TaskManagementPage from './pages/TaskManagementPage';
import TaskCreatePage from './pages/TaskCreatePage';
import { ToastProvider } from './context/ToastContext';
import MessageSpecForm from './pages/MessageSpecForm';
import ImpactAssessmentDashboard from './pages/ImpactAssessmentDashboard';
import ImpactAssessmentForm from './pages/ImpactAssessmentForm';
import ReleaseTeamsPage from './pages/ReleaseTeamsPage';
import MessageSpecDashboard from './pages/MessageSpecDashboard';

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
            path="/templates/view/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateTemplatePage />
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
            path="/alert-onboard/view/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <AlertOnboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-specs"
            element={
              <ProtectedRoute>
                <Layout>
                  <MessageSpecDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-specs/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <MessageSpecForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-specs/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <MessageSpecForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-specs/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <MessageSpecForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/impact-assessments"
            element={
              <ProtectedRoute>
                <Layout>
                  <ImpactAssessmentDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/impact-assessments/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <ImpactAssessmentForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/impact-assessments/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ImpactAssessmentForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/impact-assessments/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <ImpactAssessmentForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/impact-assessments/release/:releaseId/teams"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReleaseTeamsPage />
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
            path="/workflows/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute>
                <Layout>
                  <ActivitiesDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/builder"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowBuilderPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/builder/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowBuilderPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/mapping"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowMappingPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/execution/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowExecutionPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/preview/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowExecutionPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/view/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowDemoPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <Layout>
                  <ApprovalsPage full={true} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/actions"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowActionDashboard />
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
            path="/tasks/view/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <TaskCreatePage />
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
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Provider>
  );
}

export default App;
