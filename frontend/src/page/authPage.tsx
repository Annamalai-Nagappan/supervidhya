import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card";
import { BrainCircuit, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate auth
        setTimeout(() => {
            setLoading(false);
            navigate("/evaluate");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>

                <Card className="border-none shadow-2xl shadow-slate-200/50">
                    <CardHeader className="space-y-4 text-center pb-8">
                        <div className="flex justify-center">
                            <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <BrainCircuit className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold font-outfit">
                                {isLogin ? "Welcome Back" : "Create Account"}
                            </CardTitle>
                            <CardDescription>
                                {isLogin ? "Enter your credentials to access your dashboard" : "Sign up to start evaluating papers with AI"}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@institution.edu"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    required
                                />
                            </div>

                            {!isLogin && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-sm font-semibold text-slate-700">Institution Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Stanford University"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        required
                                    />
                                </div>
                            )}

                            <Button size="lg" className="w-full h-12 rounded-xl text-md font-bold mt-2" disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLogin ? "Sign In" : "Register")}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t text-center">
                            <p className="text-sm text-slate-600">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="ml-2 text-primary font-bold hover:underline"
                                >
                                    {isLogin ? "Sign up" : "Log in"}
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-400 mt-8">
                    Secure authentication powered by SuperVidhya AI
                </p>
            </motion.div>
        </div>
    );
};

export default AuthPage;
