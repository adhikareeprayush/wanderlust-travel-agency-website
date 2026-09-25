import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Landing from "./components/layout/Landing";
import DashboardLayout from "./components/layout/DashboardLayout";
import AccountLayout from "./components/layout/AccountLayout";
import { RequireAuth, RequireStaff } from "./components/ProtectedRoute";
import Packages from "./pages/Packages";
import About from "./pages/About";
import { Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import DashboardEnquiries from "./pages/dashboard/DashboardEnquiries";
import TourDetail from "./pages/TourDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AccountProfile from "./pages/AccountProfile";
import AccountBookings from "./pages/AccountBookings";
import BookingSuccess from "./pages/BookingSuccess";
import NotFound from "./pages/NotFound";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardBookings from "./pages/dashboard/DashboardBookings";
import DashboardTours from "./pages/dashboard/DashboardTours";
import DashboardAnalytics from "./pages/dashboard/DashboardAnalytics";
import DashboardCalendar from "./pages/dashboard/DashboardCalendar";
import DashboardGuests from "./pages/dashboard/DashboardGuests";
import DashboardSuppliers from "./pages/dashboard/DashboardSuppliers";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import DashboardGuides from "./pages/dashboard/DashboardGuides";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Landing />}>
            <Route index element={<Index />} />
            <Route path="about" element={<About />} />
            <Route path="packages" element={<Packages />} />
            <Route path="packages/:slug" element={<TourDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="tour" element={<Navigate to="/packages" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="booking/:id/success" element={<BookingSuccess />} />
          <Route element={<RequireAuth />}>
            <Route path="account" element={<AccountLayout />}>
              <Route index element={<AccountProfile />} />
              <Route path="bookings" element={<AccountBookings />} />
            </Route>
          </Route>
          <Route element={<RequireStaff />}>
            <Route path="dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="bookings" element={<DashboardBookings />} />
              <Route path="tours" element={<DashboardTours />} />
              <Route path="departures" element={<DashboardCalendar />} />
              <Route path="guests" element={<DashboardGuests />} />
              <Route path="guides" element={<DashboardGuides />} />
              <Route path="suppliers" element={<DashboardSuppliers />} />
              <Route path="analytics" element={<DashboardAnalytics />} />
              <Route path="enquiries" element={<DashboardEnquiries />} />
              <Route path="settings" element={<DashboardSettings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
