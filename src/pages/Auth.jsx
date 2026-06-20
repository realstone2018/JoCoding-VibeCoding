import { useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Auth.module.css'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  const toggleMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setError(null)
    setMessage(null)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>STYLÉ</div>
      </header>

      <div className={styles.layout}>
        {/* 왼쪽: 에디토리얼 텍스트 */}
        <div className={styles.editorial}>
          <span className={styles.eyebrow}>AI PERSONAL STYLIST</span>
          <h1 className={styles.headline}>
            Discover<br />Your Style<br /><em>Identity.</em>
          </h1>
          <div className={styles.editorialLine} />
          <p className={styles.subtext}>
            전문 스타일리스트 AI가 당신의 사진과 체형을 분석해<br />
            맞춤형 스타일 가이드를 제공합니다.
          </p>
        </div>

        {/* 오른쪽: 로그인/회원가입 폼 */}
        <div className={styles.formWrap}>
          <div className={styles.formBox}>
            <div className={styles.tabRow}>
              <button
                type="button"
                className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
                onClick={() => { setMode('login'); setError(null); setMessage(null) }}
              >
                로그인
              </button>
              <button
                type="button"
                className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
                onClick={() => { setMode('signup'); setError(null); setMessage(null) }}
              >
                회원가입
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="email">이메일</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className={styles.input}
                  required
                  disabled={loading}
                />
                <div className={styles.inputLine} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="password">비밀번호</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? '6자리 이상' : '••••••••'}
                  className={styles.input}
                  required
                  minLength={6}
                  disabled={loading}
                />
                <div className={styles.inputLine} />
              </div>

              {error && (
                <div className={styles.errorBox}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>error</span>
                  {error}
                </div>
              )}

              {message && (
                <div className={styles.messageBox}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>mark_email_read</span>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} />
                    처리 중...
                  </>
                ) : mode === 'login' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
              </button>
            </form>

            <p className={styles.switchText}>
              {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              {' '}
              <button type="button" className={styles.switchBtn} onClick={toggleMode}>
                {mode === 'login' ? '회원가입' : '로그인'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
