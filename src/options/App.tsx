import { Route, Routes, Navigate } from "react-router-dom";
import Settings from "./pages/Settings";
import History from "./pages/History";
import WebsitesList from "./pages/LocalDatabase";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/App.css"
import { Toaster } from "@/components/ui/sonner";

export default function App() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="app-main">
                <Routes>
                    <Route path="/" element={<Navigate to="/settings" replace />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/database" element={<WebsitesList />} />
                    {/* AFTER THIS ALL OTHER ROUTES GO TO THE NOT FOUND PAGE */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Toaster richColors />

            <Footer />
        </div>
    );
}
