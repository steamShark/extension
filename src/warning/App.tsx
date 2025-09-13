import "./App.css"
import WarningPage from "./pages/WarningPage";

export default function App() {
    return (
        <div className="min-h-screen w-full bg-background-warning text-white flex flex-col">
            <main className="app-main">
                <WarningPage />
            </main>
        </div>
    );
}