import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function Login({ onLogin }) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);


    const {
      data,
      error: loginError,
    } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });


    if (loginError) {

      console.error(
        "Supabase login error:",
        loginError
      );

      setError(
        loginError.message
      );

      setLoading(false);

      return;

    }


    if (!data.session) {

      setError(
        "Login succeeded but no session was created."
      );

      setLoading(false);

      return;

    }


    /*
     * Supabase session is now active.
     */

    onLogin(data.session);

    setLoading(false);

  };


  return (

    <div className="login-page">

      <div className="login-card">


        {/* BRAND */}

        <div className="login-brand">

          <div className="login-brand-mark">

            <ShieldCheck size={28} />

          </div>


          <div>

            <div className="login-brand-name">
              Easecraft
            </div>

            <div className="login-brand-subtitle">
              Manpower Expenses
            </div>

          </div>

        </div>


        {/* HEADING */}

        <div className="login-heading">

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to continue to your dashboard.
          </p>

        </div>


        {/* FORM */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >


          <div className="login-form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

          </div>


          <div className="login-form-group">

            <label>
              Password
            </label>


            <div className="login-password-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />


              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
              >

                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}

              </button>

            </div>

          </div>


          {error && (

            <div className="login-error">
              {error}
            </div>

          )}


          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            <LogIn size={18} />

            {loading
              ? "Signing in..."
              : "Sign In"}

          </button>

        </form>


        <div className="login-footer">
          Easecraft Management System
        </div>

      </div>

    </div>

  );
}


export default Login;