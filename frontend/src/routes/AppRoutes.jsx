import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardRedirect from "./DashboardRedirect";
import Landing from "../pages/Landing";
import FeaturesPage from "../pages/FeaturesPage";
import AIPage from "../pages/AIPage";
import NavigationPage from "../pages/NavigationPage";
import ContactPage from "../pages/ContactPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import FacilitiesPage from "../pages/FacilitiesPage";
import FacilityDetailPage from "../pages/FacilityDetailPage";
import HeatmapPage from "../pages/HeatmapPage";
import EventsPage from "../pages/EventsPage";
import SignupOTPPage from "../pages/SignupOTPPage";
import LoginOTPPage from "../pages/LoginOTPPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentTimetable from "../pages/student/StudentTimetable";
import StudentAttendance from "../pages/student/StudentAttendance";
import StudentRegistrations from "../pages/student/StudentRegistrations";
import StudentNotices from "../pages/student/StudentNotices";
import StudentAssignments from "../pages/student/StudentAssignments";
import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import FacultyTimetable from "../pages/faculty/FacultyTimetable";
import FacultyNotices from "../pages/faculty/FacultyNotices";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminFacilities from "../pages/admin/AdminFacilities";
import AdminFacilityForm from "../pages/admin/AdminFacilityForm";
import AdminEvents from "../pages/admin/AdminEvents";
import AdminEventForm from "../pages/admin/AdminEventForm";
import AdminNotices from "../pages/admin/AdminNotices";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminHodInbox from "../pages/admin/AdminHodInbox";
import AdminAttendance from "../pages/admin/AdminAttendance";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";
import SendToHod from "../pages/faculty/SendToHod";
import FacultyAssignments from "../pages/faculty/FacultyAssignments";
import FacultyAttendance from "../pages/faculty/FacultyAttendance";
import AdminTimetable from "../pages/admin/AdminTimetable";
import SessionsPage from "../pages/settings/SessionsPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="/navigation" element={<NavigationPage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/facilities/:id" element={<FacilityDetailPage />} />
        <Route path="/heatmap" element={<HeatmapPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="facilities" element={<AdminFacilities />} />
        <Route path="facilities/new" element={<AdminFacilityForm />} />
        <Route path="facilities/:id/edit" element={<AdminFacilityForm />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="events/new" element={<AdminEventForm />} />
        <Route path="events/:id/edit" element={<AdminEventForm />} />
        <Route path="notices" element={<AdminNotices />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="hod-inbox" element={<AdminHodInbox />} />
        <Route path="timetable" element={<AdminTimetable />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
      </Route>

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute role="student"><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="registrations" element={<StudentRegistrations />} />
        <Route path="notices" element={<StudentNotices />} />
        <Route path="assignments" element={<StudentAssignments />} />
      </Route>

      {/* Faculty */}
      <Route path="/faculty" element={<ProtectedRoute role="faculty"><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<FacultyDashboard />} />
        <Route path="classes" element={<FacultyTimetable />} />
        <Route path="timetable" element={<FacultyTimetable />} />
        <Route path="assignments" element={<FacultyAssignments />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="send-to-hod" element={<SendToHod />} />
        <Route path="notices" element={<FacultyNotices />} />
        <Route path="students" element={<FacultyDashboard />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/otp" element={<LoginOTPPage />} />
      <Route path="/signup/otp" element={<SignupOTPPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={<Navigate to="/signup/otp" replace />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />
      <Route path="/settings" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="sessions" element={<SessionsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
