import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import ProfileInput from './pages/ProfileInput'
import StyleReport from './pages/StyleReport'

function App() {
  const [session, setSession] = useState(undefined) // undefined = 로딩 중
  const [page, setPage] = useState('input')
  const [report, setReport] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 로그인/로그아웃 이벤트 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleComplete = (reportData, photoPreview) => {
    setReport(reportData)
    setPreview(photoPreview)
    setPage('report')
  }

  const handleBack = () => {
    setPage('input')
    setReport(null)
  }

  // 세션 로딩 중
  if (session === undefined) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: 32,
        color: '#1b1c1c',
        letterSpacing: '-0.01em',
      }}>
        STYLÉ
      </div>
    )
  }

  // 비로그인 상태
  if (!session) return <Auth />

  // 로그인 상태
  return page === 'input'
    ? <ProfileInput onComplete={handleComplete} session={session} />
    : <StyleReport report={report} preview={preview} onBack={handleBack} session={session} />
}

export default App
