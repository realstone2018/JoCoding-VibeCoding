import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './ProfileInput.module.css'

export default function ProfileInput({ onComplete, session }) {
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [dragging, setDragging] = useState(false)
  const [pageDropping, setPageDropping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const dragCounterRef = useRef(0)

  useEffect(() => {
    const onDragEnter = (e) => {
      e.preventDefault()
      if ([...e.dataTransfer.items].some(i => i.kind === 'file')) {
        dragCounterRef.current += 1
        setPageDropping(true)
      }
    }
    const onDragLeave = () => {
      dragCounterRef.current -= 1
      if (dragCounterRef.current === 0) setPageDropping(false)
    }
    const onDragOver = (e) => e.preventDefault()
    const onDrop = (e) => {
      e.preventDefault()
      dragCounterRef.current = 0
      setPageDropping(false)
      if (!loading) handleFile(e.dataTransfer.files[0])
    }

    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [loading])

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleFileChange = (e) => handleFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!photo || !height || !weight) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('photo', photo)
      formData.append('height', height)
      formData.append('weight', weight)

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      let json
      try {
        json = await res.json()
      } catch {
        throw new Error(`서버 응답 오류 (HTTP ${res.status}). API 서버가 실행 중인지 확인해주세요.`)
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error || '분석 중 오류가 발생했습니다.')
      }

      onComplete(json.report, preview)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isValid = photo && height && weight && !loading

  return (
    <div className={styles.container}>
      {pageDropping && (
        <div className={styles.dropOverlay}>
          <div className={styles.dropOverlayInner}>
            <span className="material-symbols-outlined" style={{ fontSize: 48 }}>upload_file</span>
            <p>사진을 여기에 놓으세요</p>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <button className={styles.navBtn} type="button">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className={styles.logo}>STYLÉ</div>
        <button
          className={styles.navBtn}
          type="button"
          title={session?.user?.email}
          onClick={() => supabase.auth.signOut()}
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      <section className={styles.hero}>
        <span className={styles.eyebrow}>PERSONALIZED ANALYSIS</span>
        <h1 className={styles.heroTitle}>Your Style<br />Profile</h1>
        <div className={styles.editorialLine} />
      </section>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formSection}>
          <span className={styles.sectionLabel}>01 — 사진 등록</span>
          <p className={styles.sectionDesc}>전신이 잘 보이는 사진을 올려주세요</p>

          <div
            className={`${styles.uploadArea} ${dragging ? styles.dragging : ''} ${preview ? styles.hasPreview : ''}`}
            onClick={() => !loading && fileInputRef.current.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {preview ? (
              <div className={styles.previewWrapper}>
                <img src={preview} alt="업로드 사진" className={styles.previewImage} />
                {!loading && (
                  <div className={styles.previewOverlay}>
                    <span className="material-symbols-outlined">photo_camera</span>
                    <span>사진 변경</span>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.uploadPlaceholder}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#c4c7c7' }}>upload</span>
                <p className={styles.uploadText}>클릭하거나 드래그 &amp; 드롭</p>
                <p className={styles.uploadHint}>JPG · PNG · WEBP</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.hiddenInput}
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.formSection}>
          <span className={styles.sectionLabel}>02 — 신체 정보</span>
          <p className={styles.sectionDesc}>정확한 스타일 추천을 위해 입력해주세요</p>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="height">키</label>
              <div className={styles.inputRow}>
                <input
                  id="height"
                  type="number"
                  min="100"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  className={styles.input}
                  disabled={loading}
                />
                <span className={styles.unit}>cm</span>
              </div>
              <div className={styles.inputLine} />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="weight">몸무게</label>
              <div className={styles.inputRow}>
                <input
                  id="weight"
                  type="number"
                  min="30"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="60"
                  className={styles.input}
                  disabled={loading}
                />
                <span className={styles.unit}>kg</span>
              </div>
              <div className={styles.inputLine} />
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          className={`${styles.submitButton} ${isValid ? styles.active : ''}`}
          disabled={!isValid}
        >
          {loading ? (
            <>
              <span className={styles.spinner} />
              AI가 분석 중입니다
            </>
          ) : (
            'ANALYZE MY STYLE →'
          )}
        </button>
      </form>

      <nav className={styles.bottomNav}>
        <a className={`${styles.navItem} ${styles.navActive}`} href="#">
          <span className="material-symbols-outlined">architecture</span>
          <span className={styles.navLabel}>Analyze</span>
        </a>
        <a className={styles.navItem} href="#">
          <span className="material-symbols-outlined">explore</span>
          <span className={styles.navLabel}>Discover</span>
        </a>
        <a className={styles.navItem} href="#">
          <span className="material-symbols-outlined">checkroom</span>
          <span className={styles.navLabel}>Closet</span>
        </a>
        <a className={styles.navItem} href="#">
          <span className="material-symbols-outlined">person</span>
          <span className={styles.navLabel}>Profile</span>
        </a>
      </nav>
    </div>
  )
}
