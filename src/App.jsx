import { useEffect, useMemo, useState } from 'react';
import { demoCase } from './demoCase.js';

const Icon = ({ name, size = 18 }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    grid: <><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    light: <><path d="M9 18h6M10 22h4M8 14a7 7 0 1 1 8 0c-.8.62-1 1.13-1 2H9c0-.87-.2-1.38-1-2Z"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    arrow: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></>,
    x: <><path d="m18 6-12 12M6 6l12 12"/></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3ZM19 14l1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const categoryIcon = (category) => category === 'DIGITAL' ? '▤' : category === 'WITNESS' ? '◉' : category === 'FORENSIC' ? '⌕' : category === 'CCTV TRANSCRIPT' ? '▣' : '▧';

export default function App() {
  const [caseData, setCaseData] = useState(demoCase);
  const [section, setSection] = useState('Overview');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [modal, setModal] = useState('');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('Field notes');
  const [length, setLength] = useState('Standard');
  const [premise, setPremise] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [hintCount, setHintCount] = useState(() => Number(localStorage.getItem(`mystery-hints:${demoCase.id}`) || 0));
  const [accusation, setAccusation] = useState('');
  const [result, setResult] = useState(null);
  const [notes, setNotes] = useState(localStorage.getItem('mystery-notes') || '');
  const [connections, setConnections] = useState([]);
  const [mobileNav, setMobileNav] = useState(false);
  const [landing, setLanding] = useState(() => !localStorage.getItem('mystery-entered'));

  useEffect(() => { localStorage.setItem('mystery-notes', notes); }, [notes]);
  useEffect(() => {
    const savedId = localStorage.getItem('mystery-case-id');
    if (savedId) {
      if (savedId !== demoCase.id) fetch(`/api/cases/${encodeURIComponent(savedId)}`).then(r => r.ok ? r.json() : null).then(data => { if (data?.case) { setCaseData(data.case); setHintCount(Number(localStorage.getItem(`mystery-hints:${savedId}`) || 0)); } }).catch(() => {});
      fetch(`/api/cases/${encodeURIComponent(savedId)}/report`).then(r => r.ok ? r.json() : null).then(data => { if (data?.result) setResult(data.result); }).catch(() => {});
    }
  }, []);
  const filteredEvidence = useMemo(() => caseData.evidence.filter(e => `${e.title} ${e.category} ${e.summary} ${e.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [caseData, search]);
  const openEvidence = (item) => { setSelectedEvidence(item); setModal('evidence'); };
  const startDemo = () => { localStorage.removeItem('mystery-case-id'); localStorage.setItem('mystery-entered','yes'); localStorage.setItem(`mystery-hints:${demoCase.id}`,'0'); setCaseData(demoCase); setResult(null); setHintCount(0); setSection('Overview'); setModal(''); setLanding(false); };

  async function createMystery(event) {
    event.preventDefault();
    setError(''); setGenerating(true);
    try {
      const response = await fetch('/api/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ premise: premise.trim(), difficulty, length }) });
      const raw = await response.text();
      let body;
      try { body = JSON.parse(raw); } catch { throw new Error(raw || `The case server returned an empty response (HTTP ${response.status}). Check its terminal for details.`); }
      if (!response.ok) throw new Error(body.error || 'Mystery generation failed. Please try again.');
      setCaseData(body.case); localStorage.setItem('mystery-case-id', body.case.id); localStorage.setItem(`mystery-hints:${body.case.id}`,'0'); localStorage.setItem('mystery-entered','yes'); setSection('Overview'); setModal(''); setHintCount(0); setResult(null); setLanding(false);
    } catch (e) {
      setError(e.message === 'Failed to fetch' ? 'The case server is unavailable. Start the app with npm run dev, or open the sample case.' : e.message);
    } finally { setGenerating(false); }
  }
  async function submitAccusation(event) {
    event.preventDefault(); setError('');
    try {
      const response = await fetch(`/api/cases/${caseData.id}/accusations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ suspectId: accusation, hintsUsed: hintCount }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not submit accusation.');
      setResult(body.result); localStorage.setItem('mystery-case-id', caseData.id); localStorage.setItem('mystery-entered','yes'); setModal('result');
    } catch (e) { setError(e.message === 'Failed to fetch' ? 'The case server is unavailable. Start the app with npm run dev.' : e.message); }
  }
  async function requestHint() {
    try {
      const response = await fetch(`/api/cases/${caseData.id}/hints`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hintIndex: hintCount }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not load hint.');
      setHintCount(n => { const next = n + 1; localStorage.setItem(`mystery-hints:${caseData.id}`, String(next)); return next; }); setSelectedEvidence({ title: `Field note ${hintCount + 1}`, category: 'HINT', content: body.hint, summary: 'A nudge from the case file.', tags: ['hint'] }); setModal('evidence');
    } catch (e) { setError(e.message); }
  }

  if (landing) return <Landing onCreate={() => { setLanding(false); setModal('create'); }} onDemo={startDemo} />;

  const navItems = [ ['Overview','grid'], ['Evidence','file'], ['Suspects','users'], ['Timeline','clock'], ['My notes','file'] ];
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><span></span><span></span><span></span></div><span>THE CASE ROOM</span><button className="close-nav icon-button" aria-label="Close navigation" onClick={() => setMobileNav(false)}><Icon name="x" size={17}/></button></div>
      <div className="workspace-label">YOUR DESK <span>01</span></div>
      <button className="case-switcher" onClick={() => setModal('create')}><div className="case-thumb">{caseData.title.slice(0,1)}</div><div className="case-switch-copy"><b>{caseData.title}</b><small>CASE FILE · ACTIVE</small></div><Icon name="chevron" size={15}/></button>
      <div className="nav-label">INVESTIGATION</div>
      <nav className="side-nav" aria-label="Case navigation">{navItems.map(([label, icon]) => <button key={label} className={`nav-item ${section===label?'active':''}`} onClick={() => {setSection(label);setMobileNav(false)}}><Icon name={icon} size={17}/><span>{label}</span>{label==='Evidence'&&<i>{caseData.evidence.length}</i>}</button>)}</nav>
      <div className="sidebar-rule"></div>
      <button className="hint-nav" onClick={requestHint}><span className="hint-icon"><Icon name="light" size={17}/></span><span><b>Need a nudge?</b><small>{hintCount} of {caseData.hintCount || 3} hints used</small></span><Icon name="chevron" size={15}/></button>
      <div className="sidebar-bottom"><div className="privacy-note"><Icon name="lock" size={14}/><span>All cases are fictional.<br/>Your notes stay on this device.</span></div><button className="user-profile" onClick={() => setModal('about')}><div className="avatar">D</div><span><b>Detective</b><small>GUEST INVESTIGATOR</small></span><span className="profile-dots">···</span></button></div>
    </aside>
    {mobileNav && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Icon name="menu"/></button><div className="crumbs"><span>CASE FILES</span><Icon name="chevron" size={13}/><b>{caseData.title}</b></div><div className="top-actions"><div className="case-status"><span></span>{result?'CASE CLOSED':'INVESTIGATION IN PROGRESS'}</div><button className="top-new" onClick={() => setModal('create')}><Icon name="plus" size={15}/><span>New case</span></button><button className="top-avatar" onClick={() => setModal('about')}>D</button></div></header>
      <div className="page-content">
        <div className="page-head"><div><div className="eyebrow"><span>CASE NO. 0194</span><span className="eyebrow-dot">·</span><span>OPENED 14 OCT 2025</span></div><h1>{caseData.title}</h1><p>{caseData.subtitle}</p></div><button className="case-menu" aria-label="Case actions" onClick={() => setModal('create')}>•••</button></div>
        <section className="case-banner"><div className="banner-grain"></div><div className="banner-top"><span className="case-badge"><span></span>{result?'RESOLVED':'ACTIVE CASE'}</span><span className="fiction-label"><Icon name="lock" size={12}/> FICTIONAL CASE FILE</span></div><div className="banner-bottom"><div className="case-location"><span><Icon name="pin" size={14}/>{caseData.location}</span><span><Icon name="clock" size={14}/>{caseData.date}</span></div><button className="banner-open" onClick={() => setSection('Evidence')}>Open case file <Icon name="arrow" size={15}/></button></div></section>
        <div className="content-layout"><div className="primary-column">
          {section==='Overview' && <><section className="overview-block"><div className="section-heading"><div><span className="section-kicker">THE BRIEF</span><h2>What happened</h2></div><span className="report-ref">BRIEF · 001</span></div><p className="brief-text">{caseData.summary}</p><div className="brief-meta"><div><small>CASE TYPE</small><b>{caseData.type}</b></div><div><small>PERSON OF INTEREST</small><b>{caseData.victim}</b></div><div><small>LOCATION</small><b>{caseData.location.split(',')[0]}</b></div></div></section>
            <section className="evidence-section"><div className="section-heading"><div><span className="section-kicker">THE RECORD</span><h2>Evidence <em>{caseData.evidence.length}</em></h2></div><button className="text-link" onClick={() => setSection('Evidence')}>View all <Icon name="arrow" size={14}/></button></div><div className="evidence-grid">{caseData.evidence.slice(0,3).map((item,index)=><EvidenceCard key={item.id} item={item} index={index} onClick={() => openEvidence(item)}/>)}</div></section>
            <section className="timeline-section"><div className="section-heading"><div><span className="section-kicker">SEQUENCE OF EVENTS</span><h2>Timeline</h2></div><button className="text-link" onClick={() => setSection('Timeline')}>Full timeline <Icon name="arrow" size={14}/></button></div><Timeline events={caseData.timeline.slice(0,4)}/></section>
          </>}
          {section==='Evidence' && <><div className="section-heading section-page-heading"><div><span className="section-kicker">THE RECORD</span><h2>Evidence library <em>{caseData.evidence.length}</em></h2></div><div className="search-box"><Icon name="search" size={15}/><input aria-label="Search evidence" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search the record…"/></div></div><div className="evidence-grid evidence-grid-all">{filteredEvidence.map((item,index)=><EvidenceCard key={item.id} item={item} index={index} onClick={()=>openEvidence(item)}/>)}</div>{filteredEvidence.length===0&&<div className="empty-state">No evidence matches that search.</div>}</>}
          {section==='Suspects' && <><div className="section-heading section-page-heading"><div><span className="section-kicker">PERSONS OF INTEREST</span><h2>The suspects <em>{caseData.suspects.length}</em></h2></div></div><div className="suspect-list">{caseData.suspects.map((s,i)=><button className="suspect-row" key={s.id} onClick={()=>{setSelectedSuspect(s);setModal('suspect')}}><div className={`suspect-avatar ${s.color}`}>{s.initials}</div><div className="suspect-main"><span className="suspect-number">PERSON OF INTEREST 0{i+1}</span><b>{s.name}</b><small>{s.role}</small></div><div className="suspect-motive"><small>POSSIBLE MOTIVE</small><span>{s.motive}</span></div><Icon name="chevron" size={17}/></button>)}</div></>}
          {section==='Timeline' && <><div className="section-heading section-page-heading"><div><span className="section-kicker">SEQUENCE OF EVENTS</span><h2>Case timeline</h2></div></div><Timeline events={caseData.timeline} expanded/></>}
          {section==='My notes' && <><div className="section-heading section-page-heading"><div><span className="section-kicker">PRIVATE FIELD JOURNAL</span><h2>My notes</h2></div><span className="autosave">SAVED ON THIS DEVICE</span></div><textarea className="notes-area" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Jot down a theory, connect a detail, or keep track of questions…"/><div className="notes-foot"><Icon name="lock" size={13}/> Your notes are saved locally in this browser.</div></>}
          <div className="working-paper"><span className="paper-index">FIELD NOTE · 04</span><span className="paper-mark">“</span><p>Look for the detail that doesn’t belong.<br/><em>Then ask who needed it to be there.</em></p><span className="paper-rule"></span></div>
        </div><aside className="right-column"><div className="progress-card"><div className="widget-head"><div><span className="section-kicker">YOUR INVESTIGATION</span><h3>Case progress</h3></div><span className="progress-number">{result?'100':'35'}<small>%</small></span></div><div className="progress-track"><span style={{width:result?'100%':'35%'}}></span></div><div className="progress-caption"><span>{result?'Case resolved':'Getting warmer'}</span><span>{result?'Complete':'2 of 6 steps'}</span></div><div className="progress-checks"><div className="done"><i><Icon name="check" size={10}/></i>Review the brief</div><div className="done"><i><Icon name="check" size={10}/></i>Examine the evidence</div><div className={result?'done':''}><i>{result?<Icon name="check" size={10}/>:<span/>}</i>Connect the clues</div><div className={result?'done':''}><i>{result?<Icon name="check" size={10}/>:<span/>}</i>Make your accusation</div></div></div>
            <div className="suspects-widget"><div className="widget-head"><div><span className="section-kicker">PERSONS OF INTEREST</span><h3>The suspects <em>{caseData.suspects.length}</em></h3></div><button className="plain-icon" onClick={()=>setSection('Suspects')} aria-label="View suspects"><Icon name="arrow" size={16}/></button></div><div className="mini-suspects">{caseData.suspects.map(s=><button key={s.id} className="mini-suspect" onClick={()=>{setSelectedSuspect(s);setModal('suspect')}}><span className={`mini-avatar ${s.color}`}>{s.initials}</span><span><b>{s.name}</b><small>{s.role}</small></span><Icon name="chevron" size={14}/></button>)}</div><button className="accuse-button" onClick={()=>setModal(result?'result':'accuse')}><span>{result?'Review the resolution':'Make an accusation'}</span><Icon name="arrow" size={16}/></button></div>
            <div className="board-widget"><div className="widget-head"><div><span className="section-kicker">CONNECT THE DOTS</span><h3>Evidence board</h3></div><span className="board-count">{connections.length}<small> links</small></span></div><p>Connect two pieces of evidence that you think belong together.</p><div className="board-chips">{connections.slice(-2).map(c=><span key={c.id}>{c.a} ↔ {c.b}</span>)}{connections.length===0&&<span className="board-empty">No connections yet</span>}</div><button className="board-button" onClick={()=>setModal('board')}>Open evidence board <Icon name="arrow" size={14}/></button></div>
            <div className="hint-card"><span className="hint-spark"><Icon name="light" size={17}/></span><span><b>A little stuck?</b><small>Get a carefully placed hint.</small></span><button onClick={requestHint}>Ask <Icon name="arrow" size={13}/></button></div>
        </aside></div>
      </div>
    </main>
    {modal==='create'&&<Modal title="Start a new investigation" eyebrow="OPEN A CASE" onClose={()=>setModal('')}><p className="modal-intro">Give the room a premise. We’ll build the people, paper trail, and one coherent answer around it.</p><form onSubmit={createMystery}><label className="field-label" htmlFor="premise">Your premise</label><textarea id="premise" className="premise-input" minLength="12" maxLength="700" required value={premise} onChange={e=>setPremise(e.target.value)} placeholder="A locked-room mystery at a remote lighthouse during a winter storm…"/><div className="field-meta"><span>Fictional scenarios only</span><span>{premise.length}/700</span></div><div className="form-row"><label><span className="field-label">DIFFICULTY</span><select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>Case file</option><option>Field notes</option><option>Cold case</option></select></label><label><span className="field-label">CASE LENGTH</span><select value={length} onChange={e=>setLength(e.target.value)}><option>Short</option><option>Standard</option><option>Long</option></select></label></div>{error&&<div className="inline-error">{error}</div>}<button className="primary-button" disabled={generating}>{generating?<><span className="spinner"/>Building your case…</>:<>Build the case <Icon name="arrow" size={16}/></>}</button><button type="button" className="sample-link" onClick={startDemo}>Or investigate the sample case</button></form></Modal>}
    {modal==='evidence'&&selectedEvidence&&<Modal title={selectedEvidence.title} eyebrow={selectedEvidence.category||'FIELD NOTE'} onClose={()=>setModal('')} wide><div className="evidence-detail-meta"><span>{selectedEvidence.time||'CASE NOTE'}</span><span>·</span><span>{selectedEvidence.location||'PRIVATE'}</span><span className={`reliability ${(selectedEvidence.reliability||'').toLowerCase().replace(' ','-')}`}>{selectedEvidence.reliability||'PRIVATE NOTE'}</span></div><p className="evidence-detail-summary">{selectedEvidence.summary}</p><div className="evidence-document">{selectedEvidence.content}</div><div className="tag-row">{(selectedEvidence.tags||[]).map(t=><span key={t}># {t}</span>)}</div><button className="primary-button detail-action" onClick={()=>{setConnections(c=>[...c,{id:Date.now(),a:selectedEvidence.title,b:'Unlinked clue'}]);setModal('')}}>Add to evidence board <Icon name="plus" size={15}/></button></Modal>}
    {modal==='suspect'&&selectedSuspect&&<Modal title={selectedSuspect.name} eyebrow={selectedSuspect.role.toUpperCase()} onClose={()=>setModal('')}><div className="suspect-profile"><div className={`profile-portrait ${selectedSuspect.color}`}>{selectedSuspect.initials}</div><p>{selectedSuspect.detail}</p><div className="profile-fact"><small>POSSIBLE MOTIVE</small><span>{selectedSuspect.motive}</span></div><div className="profile-fact"><small>CLAIMED ALIBI</small><span>{selectedSuspect.alibi}</span></div><button className="primary-button" onClick={()=>{setAccusation(selectedSuspect.id);setModal('accuse')}}>Accuse this person <Icon name="arrow" size={15}/></button></div></Modal>}
    {modal==='accuse'&&<Modal title="Make your accusation" eyebrow="THE MOMENT OF TRUTH" onClose={()=>setModal('')}><p className="modal-intro">Who do you believe is responsible? You’ll see the full case explanation after you decide.</p><form onSubmit={submitAccusation}><div className="accuse-options">{caseData.suspects.map(s=><label className={`accuse-option ${accusation===s.id?'selected':''}`} key={s.id}><input type="radio" name="suspect" value={s.id} checked={accusation===s.id} onChange={e=>setAccusation(e.target.value)}/><span className={`mini-avatar ${s.color}`}>{s.initials}</span><span><b>{s.name}</b><small>{s.role}</small></span><i>{accusation===s.id&&<Icon name="check" size={13}/>}</i></label>)}</div>{error&&<div className="inline-error">{error}</div>}<button disabled={!accusation||!!result} className="primary-button">Submit final accusation <Icon name="arrow" size={15}/></button><small className="final-note"><Icon name="lock" size={12}/> Your accusation can only be submitted once.</small></form></Modal>}
    {modal==='result'&&<Modal title={result?.correct?'Case closed.':'A lead gone cold.'} eyebrow={result?.correct?'CORRECT ACCUSATION':'CASE REVEALED'} onClose={()=>setModal('')} wide><div className={`result-banner ${result?.correct?'correct':'incorrect'}`}><span>{result?.correct?'✓':'!'}</span><div><small>THE CULPRIT</small><b>{caseData.suspects.find(s=>s.id===result?.culpritId)?.name||'Unknown'}</b></div></div><div className="solution-copy"><span className="section-kicker">HOW THE EVIDENCE FITS</span><p>{result?.explanation}</p></div><div className="key-clue-list"><span className="section-kicker">KEY PIECES OF EVIDENCE</span>{(result?.keyClues||[]).map(id=>{const e=caseData.evidence.find(x=>x.id===id);return e&&<button key={id} onClick={()=>openEvidence(e)}>{e.title}<Icon name="arrow" size={13}/></button>})}</div><button className="primary-button" onClick={()=>setModal('')}>Return to case file <Icon name="arrow" size={15}/></button></Modal>}
    {modal==='board'&&<Modal title="Evidence board" eyebrow="CONNECT THE DOTS" onClose={()=>setModal('')} wide><p className="modal-intro">Choose two clues that you think share a connection. Your links are saved to this case.</p><div className="board-form"><select id="board-a"><option value="">Choose a clue…</option>{caseData.evidence.map(e=><option key={e.id}>{e.title}</option>)}</select><span>↔</span><select id="board-b"><option value="">Choose a clue…</option>{caseData.evidence.map(e=><option key={e.id}>{e.title}</option>)}</select><button className="primary-button" onClick={()=>{const a=document.getElementById('board-a').value;const b=document.getElementById('board-b').value;if(a&&b&&a!==b){setConnections(c=>[...c,{id:Date.now(),a,b}]);setModal('')}}}>Connect</button></div><div className="connections-list">{connections.map(c=><div key={c.id}><span>{c.a}</span><i>↔</i><span>{c.b}</span></div>)}</div></Modal>}
    {modal==='about'&&<Modal title="The Case Room" eyebrow="A QUIET ROOM FOR LOUD CLUES" onClose={()=>setModal('')}><p className="modal-intro">An interactive detective story. Read the evidence, connect the clues, and make your call. Every case is fictional and has one predetermined solution.</p><div className="about-rule"><Icon name="lock" size={16}/> Notes are stored only in this browser. Case data is sent to the server to investigate.</div><button className="primary-button" onClick={()=>setModal('')}>Back to the case <Icon name="arrow" size={15}/></button></Modal>}
    {error&&modal!=='create'&&modal!=='accuse'&&<div className="toast-error" role="alert">{error}<button onClick={()=>setError('')} aria-label="Dismiss"><Icon name="x" size={14}/></button></div>}
  </div>;
}

function EvidenceCard({item,index,onClick}){return <button className="evidence-card" onClick={onClick}><div className={`evidence-art art-${index%4}`}><span className="art-no">{item.id?.replace('ev-','EXHIBIT ')||'FIELD NOTE'}</span><span className="art-symbol">{categoryIcon(item.category)}</span><span className="art-type">{item.category}</span><span className="art-lines"></span></div><div className="evidence-card-body"><div className="card-meta"><span>{item.time||'FIELD NOTE'}</span><span className={`evidence-status ${(item.reliability||'').toLowerCase().replace(' ','-')}`}>{item.reliability||'PRIVATE'}</span></div><b>{item.title}</b><p>{item.summary}</p><div className="card-foot"><span>{item.location||'CASE FILE'}</span><Icon name="arrow" size={14}/></div></div></button>}

function Landing({onCreate,onDemo}){return <main className="landing-page"><header className="landing-top"><div className="brand"><div className="brand-mark"><span></span><span></span><span></span></div><span>THE CASE ROOM</span></div><button onClick={onDemo}>Open the sample case <Icon name="arrow" size={15}/></button></header><div className="landing-body"><div className="landing-copy"><div className="landing-eyebrow"><span></span> AN INTERACTIVE DETECTIVE STORY</div><h1>A quiet room<br/>for <em>loud clues.</em></h1><p>Every case has a story. Every story leaves a trail. Read between the lines, follow the evidence, and find the truth.</p><div className="landing-actions"><button className="landing-primary" onClick={onCreate}>Create a mystery <Icon name="arrow" size={16}/></button><button className="landing-secondary" onClick={onDemo}>Investigate the sample case</button></div><div className="landing-promise"><Icon name="lock" size={13}/> Entirely fictional. Built for curious minds.</div></div><div className="landing-preview"><div className="preview-paper"><span className="preview-stamp">CASE FILE · 0194</span><div className="preview-moon"></div><div className="preview-eyebrow">NORTHUMBERLAND · 14 OCT 2025</div><h2>The Last Light<br/>at Blackwood</h2><p>A death in the observatory.<br/>Four stories. One impossible hour.</p><span className="preview-rule"></span><div className="preview-footer"><span>OPEN INVESTIGATION</span><span>EXHIBIT A–F</span></div></div><div className="preview-note"><span className="preview-note-mark">“</span><span>Look for the detail<br/>that doesn’t belong.</span><small>FIELD NOTE · 04</small></div><div className="preview-index">THE CASE ROOM <span>NO. 01</span></div></div></div><footer className="landing-footer"><span>READ THE RECORD. CONNECT THE CLUES. MAKE YOUR CALL.</span><span>ALL CASES ARE FICTIONAL <i>·</i> YOUR NOTES STAY YOURS</span></footer></main>}

function Timeline({events,expanded=false}){return <div className={`timeline-list ${expanded?'timeline-expanded':''}`}>{events.map((event,i)=><div className="timeline-row" key={`${event.time}-${i}`}><span className="time-stamp">{event.time}</span><span className="timeline-pin"><i/></span><p>{event.event}</p></div>)}</div>}

function Modal({title,eyebrow,children,onClose,wide=false}){useEffect(()=>{const handle=e=>e.key==='Escape'&&onClose();window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle)},[onClose]);return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className={`modal ${wide?'modal-wide':''}`} role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><div><span className="section-kicker">{eyebrow}</span><h2>{title}</h2></div><button className="icon-button modal-close" onClick={onClose} aria-label="Close dialog"><Icon name="x"/></button></div>{children}</section></div>}
