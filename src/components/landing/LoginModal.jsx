import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/landing/LoginModal.css";
import { GoogleLogin } from "@react-oauth/google";

function LoginModal({ onClose, mode: initialMode, onShowTerms }) {
  const { login } = useContext(AuthContext);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [googlePhone, setGooglePhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [view, setView] = useState("form"); // form | verifyCode | setGooglePassword
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const api = import.meta.env.VITE_USER_SERVICE_URL;

  const navigate = useNavigate();
  const inputsRef = useRef([]);

  // ---------------- TIMER ----------------
  useEffect(() => {
    if (view === "verifyCode" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, view]);

  // ---------------- INITIAL MODE ----------------
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      setView("form");
    }
  }, [initialMode]);

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${api}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = res.data;
      if (user.role !== "Customer") {
        setError("This login is for Customers only.");
        return;
      }

      localStorage.setItem("token", token);
      login(user);
      onClose();
      navigate("/customer/home");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async () => {
    setError("");
    setLoading(true);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (!agree) {
      setError("You must agree to the Privacy Terms and Conditions.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${api}/api/auth/check-email`, {
        email,
      });

      if (res.data.exists) {
        setError("Email is already registered. Please login.");
      } else {
        await axios.post(`${api}/api/auth/register`, {
          name,
          email,
          password,
          phone,
          role: "Customer",
        });

        await axios.post(`${api}/api/auth/send-verification-code`, {
          email,
        });

        setCountdown(30);
        setView("verifyCode");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- VERIFY CODE ----------------
  const handleVerifyCode = async () => {
    setError("");
    setLoading(true);

    const code = verificationCode.join("");

    try {
      const res = await axios.post(`${api}/api/auth/verify-code`, {
        email,
        code,
      });

      if (res.data.success) {
        alert("Email verified successfully! You can now log in.");
        setMode("login");
        setView("form");
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify code.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RESEND CODE ----------------
  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      await axios.post(`${api}/api/auth/send-verification-code`, {
        email,
      });
      setCountdown(30);
    } catch (err) {
      setError("Failed to resend verification code.", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- HANDLE CODE INPUT ----------------
  const handleCodeChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // ---------------- HANDLE CLICK POSITION ----------------
  const handleBoxClick = () => {
    // Find last filled or first empty index
    const filled = verificationCode.findIndex((val) => val === "");
    const targetIndex = filled === -1 ? 5 : filled;
    // Always focus to last filled or first empty
    inputsRef.current[targetIndex]?.focus();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target.className === "modal-overlay") onClose();
      }}
    >
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {/* ----------- LOGIN FORM ----------- */}
        {mode === "login" && view === "form" && (
          <>
            <h2>Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <div className="error-message">{error}</div>}

            <button
              className="submit-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="google-login">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setError("");
                  setLoading(true);
                  try {
                    const res = await axios.post(
                      `${api}/api/auth/google-login`,
                      {
                        credential: credentialResponse.credential,
                      }
                    );

                    if (res.data.requiresPassword) {
                      setGoogleCredential(credentialResponse.credential);
                      setView("setGooglePassword");
                      return;
                    }

                    const { token, user } = res.data;
                    if (user.role !== "Customer") {
                      setError("This login is for Customers only.");
                      return;
                    }

                    localStorage.setItem("token", token);
                    login(user);
                    onClose();
                    navigate("/customer/home");
                  } catch {
                    setError("Google login failed. Please try again.");
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => setError("Google Sign-In failed")}
              />
            </div>

            <p className="switch-mode">
              Don’t have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setView("form");
                }}
                className="link-btn"
              >
                Sign Up
              </button>
            </p>
          </>
        )}

        {/* ----------- SIGNUP FORM ----------- */}
        {mode === "signup" && view === "form" && (
          <>
            <h2>Sign Up</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="phone-field">
              <span className="country-code">🇵🇭 +63</span>
              <input
                type="tel"
                placeholder="912 345 6789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <input
              type="checkbox"
              id="checkbox-id"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label htmlFor="checkbox-id">
              I agree to{" "}
              <span
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => {
                  onClose();
                  if (typeof onShowTerms === "function") onShowTerms();
                }}
              >
                Terms and Condition
              </span>
            </label>

            {error && <div className="error-message">{error}</div>}

            <button
              className="submit-btn"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>

            <p className="switch-mode">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setView("form");
                }}
                className="link-btn"
              >
                Login
              </button>
            </p>
          </>
        )}

        {/* ----------- VERIFY CODE ----------- */}
        {view === "verifyCode" && (
          <>
            <h2>Email Verification</h2>
            <p>
              A 6-digit code was sent to <strong>{email}</strong>. Please enter
              it below to verify your account.
            </p>

            <div className="otp-container">
              {verificationCode.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputsRef.current[i] = el)}
                  onChange={(e) => handleCodeChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onClick={handleBoxClick}
                  className="otp-box"
                />
              ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="submit-btn"
              onClick={handleVerifyCode}
              disabled={loading || verificationCode.join("").length !== 6}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>

            <p className="countdown-text">
              {countdown > 0
                ? `You can resend a new code in ${countdown}s`
                : "Didn’t receive a code? You can request a new one."}
            </p>

            <button
              className="resend-btn"
              onClick={handleResend}
              disabled={countdown > 0 || loading}
            >
              {loading ? "Resending..." : "Resend Code"}
            </button>
          </>
        )}

        {/* ----------- GOOGLE PASSWORD SETUP ----------- */}
        {view === "setGooglePassword" && (
          <>
            <h2>Set Your Password</h2>
            <p>
              Please enter your phone number and create a password for your
              account.
            </p>

            <div className="phone-field">
              <span className="country-code">🇵🇭 +63</span>
              <input
                type="tel"
                placeholder="912 345 6789"
                value={googlePhone}
                onChange={(e) => setGooglePhone(e.target.value)}
                required
              />
            </div>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <div className="error-message">{error}</div>}

            <button
              className="submit-btn"
              onClick={async () => {
                try {
                  const numericPhone = googlePhone.replace(/\D/g, "");
                  const fullPhone = `+63${numericPhone}`;
                  const res = await axios.post(`${api}/api/auth/google-login`, {
                    credential: googleCredential,
                    password,
                    phone: fullPhone,
                  });

                  const { token, user } = res.data;
                  localStorage.setItem("token", token);
                  login(user);
                  onClose();
                  navigate("/customer/home");
                } catch {
                  setError("Failed to set password. Please try again.");
                }
              }}
              disabled={
                loading ||
                !password ||
                googlePhone.replace(/\D/g, "").length !== 10
              }
            >
              {loading ? "Setting Password..." : "Submit"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginModal;
