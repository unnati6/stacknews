import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores allowed')
    .required('Username is required'),
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .required('Password is required'),
  confirm: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords do not match')
    .required('Please confirm your password'),
})

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score, label: 'Very Weak', color: 'bg-red-500' }
  if (score === 2) return { score, label: 'Weak', color: 'bg-orange-500' }
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-400' }
  if (score === 4) return { score, label: 'Strong', color: 'bg-green-400' }
  return { score, label: 'Very Strong', color: 'bg-green-500' }
}

const Toast = ({ toasts, removeToast }) => (
 <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">

    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border min-w-[280px] max-w-sm animate-slide-up
          ${t.type === 'success'
            ? 'bg-black-500/10 border-green-500/30 text-green-300'
            : 'bg-black-500/10 border-red-500/30 text-red-300'
          }`}
      >
        <span className="mt-0.5 flex-shrink-0">
          {t.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
        </span>
        <div className="flex-1">
          <p className="text-sm font-display font-semibold">
            {t.type === 'success' ? 'Success!' : 'Error'}
          </p>
          <p className="text-xs font-body opacity-80 mt-0.5">{t.message}</p>
        </div>
        <button onClick={() => removeToast(t.id)} className="opacity-60 hover:opacity-100 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    ))}
  </div>
)

// ✅ CHANGE 1: handleChange update kiya — touched field pe turant validate ho
const InputField = ({ label, name, type = 'text', placeholder, formik, autoComplete }) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
  const hasError = formik.touched[name] && formik.errors[name]
  const isValid = formik.touched[name] && !formik.errors[name] && formik.values[name]

  const handleChange = (e) => {
    formik.handleChange(e)
    // Agar field already touch ho chuki hai to turant validate karo
    if (formik.touched[name]) {
      // Formik validateOnChange se handle hoga, yeh ensure karta hai immediate feedback
      formik.setFieldTouched(name, true, false) // touched rakhna validate ke saath
    }
  }

  return (
    <div>
      <label className="block text-sm font-display font-medium text-gray-300 mb-1.5">
        {label} <span className="text-brand-400">*</span>
      </label>
      <div className="relative">
        <input
          type={inputType}
          name={name}
          value={formik.values[name]}
          onChange={handleChange}          
          onBlur={formik.handleBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`input-field transition-all duration-200 ${isPassword ? 'pr-10' : 'pr-9'} ${
            hasError
              ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30'
              : isValid
              ? 'border-green-500/50 focus:border-green-500/60 focus:ring-green-500/20'
              : ''
          }`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
        {!isPassword && isValid && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        )}
        {!isPassword && hasError && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </span>
        )}
      </div>
      {hasError && (
        <p className="mt-1.5 text-xs text-red-400 font-body flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {formik.errors[name]}
        </p>
      )}
    </div>
  )
}

const Register = () => {
  const { register, loading, clearError, user } = useAuth()
  const navigate = useNavigate()
  const [toasts, setToasts] = useState([])

  // useEffect(() => {
  //   if (user) navigate('/', { replace: true })
  // }, [user, navigate])

  useEffect(() => {
    clearError()
  }, [clearError])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const formik = useFormik({
    initialValues: { username: '', email: '', password: '', confirm: '' },
    validationSchema,
    // ✅ CHANGE 2: validateOnChange true — type karte hi validate ho
    validateOnChange: true,
    // ✅ CHANGE 3: validateOnBlur true — field se bahar jaate hi validate ho
    validateOnBlur: true,
    onSubmit: async (values) => {
      const result = await register(values.username, values.email, values.password)
      if (result.success) {
        addToast(`Welcome to StackNews, ${values.username}! 🎉`, 'success')
        setTimeout(() => navigate('/', { replace: true }), 1500)
      } else {
        addToast(result.message || 'Registration failed. Try again.', 'error')
      }
    },
  })

  const strength = getPasswordStrength(formik.values.password)

  // ✅ CHANGE 4: Button disable logic — jab tak sab fields valid na ho aur dirty na ho
  const isFormReady = formik.isValid && formik.dirty && !loading

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm animate-slide-up">

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-display font-bold text-xl mx-auto mb-4">
              SN
            </div>
            <h1 className="font-display font-bold text-2xl text-white">Create account</h1>
            <p className="text-gray-500 text-sm mt-1 font-body">Join StackNews and start bookmarking</p>
          </div>

          <div className="card p-6">
            <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>

              <InputField label="Username" name="username" placeholder="johndoe" formik={formik} autoComplete="username" />
              <InputField label="Email" name="email" type="email" placeholder="you@example.com" formik={formik} autoComplete="email" />
              <InputField label="Password" name="password" type="password" placeholder="Min. 6 characters" formik={formik} autoComplete="new-password" />

              {/* Password Strength */}
              {formik.values.password && (
                <div className="space-y-1.5 -mt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : 'bg-surface-border'
                      }`} />
                    ))}
                  </div>
                  <p className={`text-xs font-mono ${
                    strength.score <= 2 ? 'text-red-400' :
                    strength.score === 3 ? 'text-yellow-400' : 'text-green-400'
                  }`}>{strength.label}</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
                    {[
                      { rule: formik.values.password.length >= 6, label: '6+ characters' },
                      { rule: /[A-Z]/.test(formik.values.password), label: 'Uppercase letter' },
                      { rule: /[0-9]/.test(formik.values.password), label: 'One number' },
                      { rule: /[^A-Za-z0-9]/.test(formik.values.password), label: 'Special character' },
                    ].map(({ rule, label }) => (
                      <span key={label} className={`text-xs font-body flex items-center gap-1 ${rule ? 'text-green-400' : 'text-gray-600'}`}>
                        {rule ? '✓' : '○'} {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <InputField label="Confirm Password" name="confirm" type="password" placeholder="••••••••" formik={formik} autoComplete="new-password" />

              {/* ✅ CHANGE 4: isFormReady use kiya */}
              <button
                type="submit"
                disabled={!isFormReady}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Creating account...
                  </>
                ) : 'Create account'}
              </button>

            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5 font-body">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default Register