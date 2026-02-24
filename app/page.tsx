'use client'

import { useState, useEffect } from 'react'
import { Monitor, FileText, Tv, Search, ExternalLink, Newspaper, X, Headphones, Rss, Layers, Globe, Play, Radio } from 'lucide-react'

interface ClientConfig {
  nom: string
  logo: string
  couleurPrimaire: string
  couleurAccent: string
  periode: string
  kpis: Record<string, string>
}

interface Retombee {
  id: number
  titre: string
  media: string
  logoMedia: string
  date: string
  type: 'Web' | 'Print' | 'Print & Web' | 'Radio/TV' | 'Podcast' | 'Newsletter' | 'Youtube' | 'Non médias' | 'Web radio'
  format: string
  url: string
  journaliste: string
  pdfPath: string
}

export default function Home() {
  const [client, setClient] = useState<ClientConfig | null>(null)
  const [retombees, setRetombees] = useState<Retombee[]>([])
  const [filtered, setFiltered] = useState<Retombee[]>([])
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [search, setSearch] = useState('')
  const [pdfViewer, setPdfViewer] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/retombees.json')
      .then(r => r.json())
      .then(data => {
        setClient(data.client)
        setRetombees(data.retombees)
        setFiltered(data.retombees)
      })
  }, [])

  useEffect(() => {
    let result = retombees
    if (activeFilter !== 'Tous') result = result.filter(r => r.type === activeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.titre.toLowerCase().includes(q) ||
        r.media.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [activeFilter, search, retombees])

  const primary = client?.couleurPrimaire ?? '#1E2D40'
  const accent = client?.couleurAccent ?? '#FF6B35'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TYPE_CONFIG: Record<string, { icon: any; bg: string; text: string; border: string }> = {
    'Web':         { icon: Monitor,    bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    'Print':       { icon: FileText,   bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
    'Print & Web': { icon: Layers,     bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
    'Radio/TV':    { icon: Tv,         bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
    'Podcast':     { icon: Headphones, bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
    'Newsletter':  { icon: Rss,        bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
    'Youtube':     { icon: Play,       bg: '#FFF1F2', text: '#DC2626', border: '#FECACA' },
    'Non médias':  { icon: Globe,      bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
    'Web radio':   { icon: Radio,      bg: '#FDF4FF', text: '#7C3AED', border: '#E9D5FF' },
  }

  const TYPE_ORDER = ['Web', 'Print', 'Print & Web', 'Radio/TV', 'Podcast', 'Newsletter', 'Youtube', 'Non médias', 'Web radio']

  const filters = [
    { label: 'Tous', icon: Newspaper, count: retombees.length },
    ...TYPE_ORDER
      .filter(t => retombees.some(r => r.type === t))
      .map(t => ({ label: t, icon: TYPE_CONFIG[t].icon, count: retombees.filter(r => r.type === t).length })),
  ]

  const typeStyles: Record<string, { bg: string; text: string; border: string }> = Object.fromEntries(
    Object.entries(TYPE_CONFIG).map(([k, v]) => [k, { bg: v.bg, text: v.text, border: v.border }])
  )

  const uniqueMedias = Array.from(
    new Map(retombees.filter(r => r.logoMedia).map(r => [r.media, r])).values()
  )

  const kpiLabels: Record<string, string> = {
    retombees: 'Retombées presse',
    tvRadio: 'Passages TV & Radio',
    typesPresse: 'Types de médias',
    mediasCles: 'Médias de référence',
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    } catch { return dateStr }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #F4F6FB; margin: 0; }
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        .hero-bg { background: linear-gradient(135deg, ${primary} 0%, #0a141f 100%); }
        .accent-bar { background: ${accent}; }
        .primary-color { color: ${primary}; }
        .btn-accent { background: ${accent}; color: white; font-weight: 600; border: none; cursor: pointer; transition: opacity .18s; }
        .btn-accent:hover { opacity: .88; }
        .card-hover { transition: transform .2s, box-shadow .2s; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(30,45,64,.12); }
        .logo-media { filter: grayscale(1) opacity(.55); transition: filter .22s; max-height: 32px; max-width: 130px; object-fit: contain; }
        .logo-media:hover { filter: grayscale(0) opacity(1); }
        .filter-btn { transition: all .18s; border: 1.5px solid #E2E8F0; }
        .filter-btn.active { background: ${primary}; color: white; border-color: ${primary}; }
        .filter-btn:not(.active):hover { border-color: ${primary}; color: ${primary}; }
        .kpi-accent { border-bottom: 3px solid ${accent}; }
        .overlay-bg { background: rgba(10,15,35,.6); backdrop-filter: blur(8px); }
        .modal-anim { animation: modalIn .25s ease; }
        @keyframes modalIn { from { opacity:0; transform:scale(.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .fade-in { animation: fadeIn .5s ease forwards; opacity: 0; }
        @keyframes fadeIn { to { opacity:1; } }
        .stagger-1 { animation-delay: .05s; }
        .stagger-2 { animation-delay: .12s; }
        .stagger-3 { animation-delay: .2s; }
        .stagger-4 { animation-delay: .28s; }
        @media print {
          header, .no-print { display: none !important; }
          .print-break { page-break-before: always; }
        }
      `}</style>

      <div className="min-h-screen">

        {/* ── HEADER ── */}
        <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {client?.logo && (
                <img
                  src={client.logo}
                  alt={client.nom}
                  style={{ height: 40, objectFit: 'contain' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <div style={{ width: 1, height: 28, background: '#E2E8F0' }} />
              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>Dashboard · Retombées médias</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                className="btn-accent"
                style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13 }}
                onClick={() => window.print()}
              >
                Exporter PDF
              </button>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="hero-bg" style={{ color: 'white' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 80px' }}>
            <p className="fade-in stagger-1" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: .6, marginBottom: 12 }}>
              Retombées presse · {client?.periode ?? ''}
            </p>
            <h1 className="font-jakarta fade-in stagger-2" style={{ fontSize: 56, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              {client?.nom ?? 'Béa'}
            </h1>
            <div className="fade-in stagger-3" style={{ width: 56, height: 4, background: accent, borderRadius: 2, marginTop: 20 }} />
          </div>
        </section>

        {/* ── KPIs ── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div className="fade-in stagger-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: -36 }}>
            {client && Object.entries(client.kpis).map(([key, val]) => (
              <div key={key} className="kpi-accent" style={{ background: 'white', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 10 }}>
                  {kpiLabels[key] ?? key}
                </p>
                <p className="font-syne primary-color" style={{ fontSize: 38, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>{val}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── MÉDIAS LOGOS ── */}
        <section style={{ maxWidth: 1100, margin: '48px auto 0', padding: '0 24px' }}>
          <h2 className="font-syne" style={{ fontSize: 22, fontWeight: 700, color: primary, marginBottom: 20 }}>
            Ils en ont parlé
          </h2>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 40px', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '28px 44px' }}>
              {uniqueMedias.map(r => (
                <a key={r.id} href={r.url || '#'} target="_blank" rel="noopener noreferrer" title={r.media}>
                  <img
                    src={r.logoMedia}
                    alt={r.media}
                    className="logo-media"
                    onError={e => {
                      const el = e.currentTarget as HTMLImageElement
                      el.style.display = 'none'
                      const span = document.createElement('span')
                      span.style.cssText = 'font-weight:600;font-size:12px;color:#64748B;letter-spacing:.05em;'
                      span.textContent = r.media
                      el.parentNode?.appendChild(span)
                    }}
                  />
                </a>
              ))}
              {retombees.filter(r => !r.logoMedia).map(r => (
                <span key={`nolog-${r.id}`} style={{ fontSize: 12, fontWeight: 600, color: '#64748B', letterSpacing: '.04em' }}>
                  {r.media}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── RETOMBÉES ── */}
        <section style={{ maxWidth: 1100, margin: '48px auto 0', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Rechercher par média, titre..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                  border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, outline: 'none',
                  background: 'white', color: primary
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {filters.map(f => {
                const Icon = f.icon
                const isAct = activeFilter === f.label
                return (
                  <button
                    key={f.label}
                    onClick={() => setActiveFilter(f.label)}
                    className={`filter-btn ${isAct ? 'active' : ''}`}
                    style={{
                      padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                      background: isAct ? primary : 'white', color: isAct ? 'white' : '#475569',
                      border: `1.5px solid ${isAct ? primary : '#E2E8F0'}`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .18s'
                    }}
                  >
                    <Icon size={13} />
                    {f.label}
                    <span style={{
                      background: isAct ? 'rgba(255,255,255,.25)' : '#F1F5F9',
                      color: isAct ? 'white' : '#64748B',
                      borderRadius: 6, padding: '1px 6px', fontSize: 11, fontWeight: 600
                    }}>{f.count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>
            {filtered.length} retombée{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
          </p>

          {filtered.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 20, padding: '60px 24px', textAlign: 'center' }}>
              <Search size={40} style={{ color: '#CBD5E1', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#64748B', fontSize: 15 }}>Aucune retombée pour cette recherche.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 60 }}>
              {filtered.map(r => {
                const s = typeStyles[r.type] ?? typeStyles.Web
                return (
                  <div
                    key={r.id}
                    className="card-hover"
                    style={{
                      background: 'white', borderRadius: 16, overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,.05)', border: '1px solid #F1F5F9',
                      display: 'flex', alignItems: 'stretch'
                    }}
                  >
                    {/* Barre couleur type */}
                    <div style={{ width: 4, background: s.text, flexShrink: 0 }} />

                    <div style={{ flex: 1, minWidth: 0, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
                      {/* Logo média */}
                      <div style={{ width: 48, height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: 10 }}>
                        {r.logoMedia ? (
                          <img
                            src={r.logoMedia}
                            alt={r.media}
                            style={{ maxHeight: 32, maxWidth: 40, objectFit: 'contain' }}
                            onError={e => {
                              const el = e.currentTarget as HTMLImageElement
                              el.style.display = 'none'
                              const span = document.createElement('span')
                              span.style.cssText = 'font-weight:700;font-size:10px;color:#64748B;text-align:center;line-height:1.2;'
                              span.textContent = r.media.substring(0, 6)
                              el.parentNode?.appendChild(span)
                            }}
                          />
                        ) : (
                          <span style={{ fontWeight: 700, fontSize: 10, color: '#64748B', textAlign: 'center', lineHeight: 1.2 }}>
                            {r.media.substring(0, 6)}
                          </span>
                        )}
                      </div>

                      {/* Contenu principal */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Ligne 1 : média + type + date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: primary }}>{r.media}</span>
                          <span style={{
                            background: s.bg, color: s.text, border: `1px solid ${s.border}`,
                            borderRadius: 6, padding: '1px 8px', fontSize: 10, fontWeight: 600
                          }}>{r.type}</span>
                          <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto', flexShrink: 0 }}>
                            {formatDate(r.date)}
                          </span>
                        </div>

                        {/* Ligne 2 : titre */}
                        <h3 style={{
                          fontSize: 15, fontWeight: 600, color: '#1E293B', lineHeight: 1.4, margin: '0 0 4px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {r.titre}
                        </h3>
                      </div>

                      {/* Boutons action */}
                      <div style={{ flexShrink: 0, display: 'flex', gap: 8 }}>
                        {r.pdfPath && (
                          <button
                            onClick={() => setPdfViewer(r.pdfPath)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              background: '#C2410C', color: 'white', borderRadius: 10,
                              padding: '8px 16px', fontSize: 13, fontWeight: 600,
                              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity .18s'
                            }}
                          >
                            <FileText size={14} />
                            PDF
                          </button>
                        )}
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              background: primary, color: 'white', borderRadius: 10,
                              padding: '8px 16px', fontSize: 13, fontWeight: 600,
                              textDecoration: 'none', whiteSpace: 'nowrap', transition: 'opacity .18s'
                            }}
                          >
                            <ExternalLink size={14} />
                            Lire
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid #E2E8F0', background: 'white', marginTop: 0 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#94A3B8' }}>
              Rapport réalisé pour <strong style={{ color: primary }}>Béa</strong>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: .65 }}>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>Agence</span>
              <img src="/logo-convictions.png" alt="Conviction[s]" style={{ height: 18, objectFit: 'contain' }} />
            </div>
          </div>
        </footer>
      </div>

      {/* ── LISEUSE PDF ── */}
      {pdfViewer && (
        <div
          className="overlay-bg"
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setPdfViewer(null)}
        >
          <div
            className="modal-anim"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 20, width: '90%', maxWidth: 900, height: '85vh',
              overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.25)', display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC'
            }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: primary }}>Liseuse PDF</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={pdfViewer}
                  download
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: primary, color: 'white', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  Télécharger
                </a>
                <button
                  onClick={() => setPdfViewer(null)}
                  style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }}
                >
                  <X size={16} style={{ color: '#64748B', display: 'block' }} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <iframe
                src={pdfViewer}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Lecteur PDF"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
