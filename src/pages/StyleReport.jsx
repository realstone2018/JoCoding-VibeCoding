import { useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './StyleReport.module.css'

const colorMap = {
  '블랙': '#1a1a1a', '화이트': '#f5f5f5', '네이비': '#1b2a4a', '그레이': '#888',
  '베이지': '#c8ad8f', '카멜': '#c19a6b', '브라운': '#7b5230', '버건디': '#6e1a2a',
  '올리브': '#6b7645', '카키': '#8b8560', '크림': '#f5f0e8', '아이보리': '#fffff0',
  '머스타드': '#d4a017', '테라코타': '#c06848', '코발트블루': '#0047ab',
  '레드': '#cc2200', '핑크': '#e8a0b0', '민트': '#98d8c8', '라벤더': '#b8a0d8',
}

function getColor(name) {
  for (const [key, val] of Object.entries(colorMap)) {
    if (name.includes(key)) return val
  }
  return '#c4c7c7'
}

export default function StyleReport({ report, preview, onBack, session }) {
  const [openTip, setOpenTip] = useState(null)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} type="button">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
          <span>다시 분석</span>
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

      <main className={styles.main}>
        {/* Hero Identity */}
        <section className={styles.heroSection}>
          <span className={styles.eyebrow}>PERSONALIZED ANALYSIS</span>
          <h1 className={styles.heroTitle}>Your Style Profile</h1>
          <div className={styles.editorialLine} />
        </section>

        {/* Body Type + Photo */}
        <section className={styles.profileGrid}>
          {preview && (
            <div className={styles.photoCol}>
              <img src={preview} alt="프로필 사진" className={styles.photo} />
            </div>
          )}
          <div className={styles.infoCol}>
            <h2 className={styles.bodyTypeName}>{report.bodyType}</h2>
            <p className={styles.bodyTypeDesc}>{report.bodyTypeDesc}</p>
            <div className={styles.keywordChecklist}>
              {report.styleKeywords?.slice(0, 3).map((kw, i) => (
                <div key={i} className={styles.checkItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                  <span className={styles.checkLabel}>{kw.toUpperCase()}</span>
                </div>
              ))}
            </div>
            <div className={styles.bmiRow}>
              <span className={styles.bmiLabel}>BMI</span>
              <span className={styles.bmiValue}>{report.bmi?.value}</span>
              <span className={styles.bmiCategory}>{report.bmi?.category}</span>
            </div>
          </div>
        </section>

        {/* Pull Quote */}
        <section className={styles.quoteSection}>
          <blockquote className={styles.quote}>
            &ldquo;{report.overallAdvice}&rdquo;
          </blockquote>
        </section>

        {/* Color Palette */}
        <section className={styles.section}>
          <div className={styles.sectionTop}>
            <span className={styles.eyebrow}>COLOR PALETTE</span>
            <h2 className={styles.sectionTitle}>어울리는 컬러</h2>
          </div>
          <div className={styles.colorRow}>
            {report.colorPalette?.recommended?.map((color, i) => (
              <div key={i} className={styles.colorItem}>
                <div className={styles.colorSwatch} style={{ background: getColor(color) }} />
                <span className={styles.colorName}>{color}</span>
              </div>
            ))}
          </div>
          {report.colorPalette?.avoid?.length > 0 && (
            <div className={styles.avoidColors}>
              <span className={styles.avoidColorLabel}>피해야 할 색상</span>
              <div className={styles.colorRow}>
                {report.colorPalette.avoid.map((color, i) => (
                  <div key={i} className={`${styles.colorItem} ${styles.colorItemAvoid}`}>
                    <div className={styles.colorSwatch} style={{ background: getColor(color) }} />
                    <span className={styles.colorName}>{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Style Recommendations */}
        <section className={styles.tipsSection}>
          <div className={styles.tipsGrid}>
            <div className={styles.tipsLeft}>
              <span className={styles.eyebrow}>EXPERT GUIDANCE</span>
              <h2 className={styles.sectionTitle}>스타일 가이드</h2>
            </div>
            <div className={styles.tipsList}>
              {report.recommendations?.map((rec, i) => (
                <div key={i} className={styles.tipItem}>
                  <button
                    type="button"
                    className={styles.tipHeader}
                    onClick={() => setOpenTip(openTip === i ? null : i)}
                  >
                    <span className={styles.tipTitle}>
                      <span className={styles.tipNum}>{String(i + 1).padStart(2, '0')}.</span>
                      {rec.category}
                    </span>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      {openTip === i ? 'remove' : 'add'}
                    </span>
                  </button>
                  <div className={styles.tipDivider} />
                  {openTip === i && (
                    <p className={styles.tipContent}>{rec.tip}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Avoid Items */}
        <section className={styles.section}>
          <div className={styles.sectionTop}>
            <span className={styles.eyebrow}>WHAT TO AVOID</span>
            <h2 className={styles.sectionTitle}>피해야 할 스타일</h2>
          </div>
          <ul className={styles.avoidList}>
            {report.avoidItems?.map((item, i) => (
              <li key={i} className={styles.avoidItem}>
                <span className={styles.avoidDash}>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTAs */}
        <section className={styles.ctaSection}>
          <button className={styles.ctaPrimary} onClick={onBack} type="button">
            다시 분석하기
          </button>
          <button className={styles.ctaSecondary} type="button">
            결과 저장하기
          </button>
        </section>
      </main>

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
