import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EvaluatorPage from "@/page/evaluatorPage";
import AuthPage from "@/page/authPage";

const AppRoute = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<EvaluatorPage />} />
                <Route path="/auth" element={<AuthPage />} />
            </Routes>
        </Router>
    );
};

export default AppRoute;
