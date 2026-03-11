import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Layout from "./app/Layout";
import HomeRoute from "./app/routes/home";
import ServicesRoute from "./app/routes/services";
import AppointmentRoute from "./app/routes/appointment";
import ContactRoute from "./app/routes/contact";
import ProfileRoute from "./app/routes/profile";
import AdminRoute from "./app/routes/admin";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="admin" element={<AdminRoute />} />
      <Route element={<Layout />}>
        <Route index element={<HomeRoute />} />
        <Route path="services" element={<ServicesRoute />} />
        <Route path="appointment" element={<AppointmentRoute />} />
        <Route path="contact" element={<ContactRoute />} />
        <Route path="profile" element={<ProfileRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
