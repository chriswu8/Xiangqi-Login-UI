import React, { useEffect, useId, useMemo, useRef, useReducer, useState } from 'react';
import { initialAuthState, authReducer } from '../../models/authModel.js';
import { validate } from '../../utils/validation.js';
import { submitAuth } from '../../controllers/authController.js';
import XiangqiBoard from './XiangqiBoard.jsx';

export default function AuthForm() {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const formRef = useRef(null);
  const ids = { username: useId(), email: useId(), password: useId(), errors: useId() };

  const errors = useMemo(() => validate(state), [state]);
  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    const first = formRef.current?.querySelector('input');
    first?.focus();
  }, [state.mode]);

  function onChange(e) {
    dispatch({ type: 'SET_FIELD', name: e.target.name, value: e.target.value });
  }
  function onBlur(e) { setTouched(t => ({ ...t, [e.target.name]: true })); }

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true });
    if (!isValid) return;
    setSubmitting(true);
    const res = await submitAuth(state);
    alert(`${res.ok ? (state.mode === 'login' ? 'Logged in' : 'Registered') : 'Failed'}.`);
    setSubmitting(false);
  }

  const pwStrength = useMemo(() => {
    if (state.mode !== 'register') return '';
    const v = state.password || '';
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return ['Weak','Fair','Good','Strong','Elite'][Math.max(0, s - 1)];
  }, [state.mode, state.password]);

  return (
    <article className="card" aria-labelledby="heading">
      <style>{`
        :root {
          --glass: rgba(255,255,255,.06);
          --text: #eae7ee;
          --muted: #bab3c7;
          --pill: #13101a;
          --focus: #7c4dff;
        }
        .card {
          position: relative;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 28px;
          padding: 26px;
          border-radius: 20px;
          color: var(--text);
          background:
            radial-gradient(1800px 600px at -10% -10%, rgba(124,77,255,.18), transparent 60%),
            radial-gradient(1600px 700px at 110% 120%, rgba(255,64,129,.16), transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
          box-shadow: 0 20px 50px rgba(0,0,0,.45);
          overflow: hidden;
          isolation: isolate;
        }
        .card::before {
          content: "";
          position: absolute; inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(124,77,255,.55), rgba(255,64,129,.55), rgba(255,180,0,.55));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          pointer-events: none;
        }
        .panel-art {
          border-radius: 16px;
          background: radial-gradient(800px 400px at 80% 20%, rgba(124,77,255,.18), transparent 55%), var(--glass);
          backdrop-filter: blur(10px);
          padding: 18px;
        }
        .panel-form {
          border-radius: 16px;
          background: var(--glass);
          backdrop-filter: blur(10px);
          padding: 28px 26px;
          display: grid;
          align-content: start;
          gap: 22px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
        }

        .brand { display: flex; align-items: center; gap: 14px; }
        .brand svg { width: 40px; height: 40px; border-radius: 50%; }
        .title {
          margin: 0; font-size: 28px; line-height: 1.15;
          background: linear-gradient(90deg, #fff, #ffd4e3 40%, #d2c7ff);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .subtitle { margin: 4px 0 0; color: var(--muted); font-size: 14px; }

        .tabs {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--pill);
          border-radius: 999px;
          padding: 4px; gap: 4px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
        }
        .tabs .slider {
          position: absolute; top: 4px; bottom: 4px; width: calc(50% - 4px); left: 4px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(255,255,255,.09), rgba(255,255,255,.02));
          box-shadow: 0 6px 18px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.06);
          transition: left .25s cubic-bezier(.2,.8,.2,1);
          pointer-events: none;
        }
        .tabs[data-mode="register"] .slider { left: calc(50% + 4px); }
        .tab {
          position: relative; z-index: 1; appearance: none; border: 0; background: transparent;
          color: var(--muted); padding: 10px 12px; border-radius: 999px; font-weight: 700; letter-spacing: .2px; cursor: pointer;
        }
        .tab[aria-selected="true"] { color: #fff; }
        .tab:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }

        form { display: grid; gap: 18px; }

        .field { display: grid; gap: 10px; }
        .label {
          font-size: 13px; color: var(--muted); font-weight: 700; padding-left: 2px; letter-spacing: .2px;
        }

        .input-wrap { --padL: 48px; --padR: 46px; position: relative; }
        .input {
          width: 100%; border: 0; padding: 14px var(--padR) 14px var(--padL);
          font-size: 15px; border-radius: 14px; color: #fff;
          background:
            linear-gradient(0deg, rgba(255,255,255,.10), rgba(255,255,255,.10)) padding-box,
            radial-gradient(120% 120% at 0% 0%, rgba(124,77,255,.45), rgba(229,57,53,.35)) border-box;
          border: 1px solid transparent; box-shadow: 0 6px 16px rgba(0,0,0,.25) inset;
        }
        .input::placeholder { color: rgba(255,255,255,.55); }
        .input:focus { outline: none; box-shadow: 0 0 0 3px rgba(124,77,255,.35), 0 6px 16px rgba(0,0,0,.25) inset; }

        .icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          width: 18px; height: 18px; opacity: .9; fill: currentColor; color: #fff;
        }
        .btn-eye {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          width: 32px; height: 32px; display: grid; place-items: center;
          border-radius: 10px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
          color: #fff; cursor: pointer;
        }
        .btn-eye:hover { background: rgba(255,255,255,.14); }

        /* Right-aligned error messages. */
        .error {
          color: #ffb4c2;
          min-height: 16px;
          font-size: 12px;
          width: 100%;
          text-align: right;
          justify-self: end;
          padding-right: 2px;
        }

        .cta { display: grid; gap: 12px; margin-top: 4px; }
        .button {
          --gr: linear-gradient(90deg, #ff3b3b, #ff4d6d 40%, #ff7a7a);
          appearance: none; border: 0; cursor: pointer;
          padding: 14px 16px; border-radius: 12px;
          font-weight: 800; letter-spacing: .3px; color: #fff;
          background: var(--gr);
          box-shadow: 0 12px 26px rgba(229,57,53,.35), inset 0 0 0 1px rgba(255,255,255,.12);
          transition: transform .12s ease, filter .2s ease, box-shadow .2s ease;
        }
        .button:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .button[disabled] { opacity: .6; cursor: not-allowed; }
        .switch { color: var(--muted); font-size: 14px; }
        .link { appearance: none; background: none; border: 0; color: #fff; text-decoration: underline; cursor: pointer; }

        .pw-meter { height: 6px; border-radius: 6px; background: rgba(255,255,255,.12); overflow: hidden; }
        .pw-bar { height: 100%; width: 0%; background: linear-gradient(90deg, #ff6b6b, #ffd166); transition: width .25s ease; }
        .pw-txt { font-size: 12px; color: var(--muted); }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,.10) inset;
          transition: background-color 5000s ease-in-out 0s;
        }

        @media (max-width: 1500px) {
          .card { grid-template-columns: 1fr; padding: 18px; gap: 18px; }
          .panel-art { order: 2; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tabs .slider, .button { transition: none; }
        }
      `}</style>

      <section className="panel-art" aria-hidden="true">
        <XiangqiBoard />
      </section>

      <section className="panel-form">
        <div className="brand">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="46" fill="#f7ede1" stroke="#C62828" strokeWidth="6" />
            <text x="50" y="62" textAnchor="middle" fontSize="50" fontWeight="800" fill="#C62828">棋</text>
          </svg>
          <div>
            <h1 id="heading" className="title">Xiangqi Arena.</h1>
            <p className="subtitle">Play. Learn. Challenge the board.</p>
          </div>
        </div>

        <nav className="tabs" role="tablist" aria-label="Authentication modes" data-mode={state.mode}>
          <div className="slider" aria-hidden="true" />
          <button className="tab" role="tab" aria-selected={state.mode === 'login'} onClick={() => dispatch({ type: 'SET_MODE', mode: 'login' })} id="tab-login" aria-controls="panel-login">Log in</button>
          <button className="tab" role="tab" aria-selected={state.mode === 'register'} onClick={() => dispatch({ type: 'SET_MODE', mode: 'register' })} id="tab-register" aria-controls="panel-register">Register</button>
        </nav>

        <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby={ids.errors}>
          <div role="tabpanel" id={state.mode === 'login' ? 'panel-login' : 'panel-register'} aria-labelledby={state.mode === 'login' ? 'tab-login' : 'tab-register'}>

            <div className="field">
              <label className="label" htmlFor={ids.username}>Username</label>
              <div className="input-wrap">
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5zm0 2c-4.1 0-8 2.1-8 5v2h16v-2c0-2.9-3.9-5-8-5z"/></svg>
                <input className="input" id={ids.username} name="username" type="text" autoComplete="username" onChange={onChange} onBlur={onBlur} value={state.username} required aria-invalid={!!errors.username} aria-errormessage={`${ids.username}-error`} placeholder="Your username." />
              </div>
              <span id={`${ids.username}-error`} className="error" aria-live="polite">{touched.username && errors.username}</span>
            </div>

            {state.mode === 'register' && (
              <div className="field">
                <label className="label" htmlFor={ids.email}>Email</label>
                <div className="input-wrap">
                  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  <input className="input" id={ids.email} name="email" type="email" autoComplete="email" onChange={onChange} onBlur={onBlur} value={state.email} required aria-invalid={!!errors.email} aria-errormessage={`${ids.email}-error`} placeholder="name@example.com" />
                </div>
                <span id={`${ids.email}-error`} className="error" aria-live="polite">{touched.email && errors.email}</span>
              </div>
            )}

            <div className="field">
              <label className="label" htmlFor={ids.password}>Password</label>
              <div className="input-wrap">
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 8V6a5 5 0 0 0-10 0v2H5v14h14V8h-2zm-8 0V6a3 3 0 0 1 6 0v2H9zm3 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>
                <input className="input" id={ids.password} name="password" type={showPw ? 'text' : 'password'} autoComplete={state.mode === 'login' ? 'current-password' : 'new-password'} onChange={onChange} onBlur={onBlur} value={state.password} required aria-invalid={!!errors.password} aria-errormessage={`${ids.password}-error`} placeholder={state.mode === 'login' ? 'Your password.' : 'At least 8 characters.'} />
                <button type="button" className="btn-eye" aria-label={showPw ? 'Hide password.' : 'Show password.'} onClick={() => setShowPw(s => !s)}>
                  {showPw ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/><path d="M3 3l18 18"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/></svg>
                  )}
                </button>
              </div>
              <span id={`${ids.password}-error`} className="error" aria-live="polite">{touched.password && errors.password}</span>

              {state.mode === 'register' && (
                <>
                  <div className="pw-meter" aria-hidden="true">
                    <div className="pw-bar" style={{ width: `${Math.min(100, (pwStrength === 'Weak' ? 20 : pwStrength === 'Fair' ? 40 : pwStrength === 'Good' ? 60 : pwStrength === 'Strong' ? 80 : 100))}%` }} />
                  </div>
                  <div className="pw-txt">Strength: {pwStrength || '—'}</div>
                </>
              )}
            </div>

            <div id={ids.errors} className="sr-only" aria-live="polite">{!isValid && 'Form contains errors.'}</div>

            <div className="cta">
              <button className="button" type="submit" disabled={!isValid || submitting} aria-busy={submitting}>
                {submitting ? (state.mode === 'login' ? 'Logging in...' : 'Registering...') : (state.mode === 'login' ? 'Log in' : 'Create account')}
              </button>
              <div className="switch">
                {state.mode === 'login' ? (
                  <span>New to Xiangqi Arena? <button type="button" className="link" onClick={() => dispatch({ type: 'SET_MODE', mode: 'register' })}>Create an account.</button></span>
                ) : (
                  <span>Already have an account? <button type="button" className="link" onClick={() => dispatch({ type: 'SET_MODE', mode: 'login' })}>Log in.</button></span>
                )}
              </div>
            </div>
          </div>
        </form>
      </section>
    </article>
  );
}
