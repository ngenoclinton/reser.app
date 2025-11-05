"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useActionState, useState } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { loginUser } from "../actions/loginUser";
import { useAuth } from "../../context/authLogContext";
import { loginUserClient } from "../../lib/loginUser";
import { Mail, Lock } from "lucide-react"

const LoginPage = () => {
  const [state, formAction] = useActionState(loginUser, {});
  const { login } = useAuth();
  const router = useRouter();
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success("Logged in successfully!");
      login(state.user);
      formRef.current?.reset(); // ✅ Reset form
      router.push("/");
    }
  }, [state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(formRef.current);
    const email = formData.get("email");
    const password = formData.get("password");

    const result = await loginUserClient(email, password);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Logged in successfully!");
      login(result.user);
      formRef.current.reset();
      router.push("/");
    }

    setLoading(false);
  };     
 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-border p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-foreground/60 mt-2">Sign in to your account</p>
          </div>

          <form ref={formRef} onSubmit={handleLogin} className="space-y-6">
            <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="border rounded w-full py-2 px-3"
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="border rounded w-full py-2 px-3"
              autoComplete="password"
              required
            />
          </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-foreground/60 mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:text-primary/90 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
