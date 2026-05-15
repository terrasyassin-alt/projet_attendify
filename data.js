// ─── DATA ─────────────────────────────────────────────────────
const avatarColors = [
  'linear-gradient(135deg,#004B8D,#0066BB)',
  'linear-gradient(135deg,#6D28D9,#8B5CF6)',
  'linear-gradient(135deg,#0B8457,#10b981)',
  'linear-gradient(135deg,#C2410C,#F97316)',
  'linear-gradient(135deg,#0369A1,#38BDF8)',
  'linear-gradient(135deg,#9D174D,#EC4899)',
  'linear-gradient(135deg,#065F46,#34D399)',
];

const attendance = [
  {id:1,name:"Ahmed Benali",role:"Stagiaire",group:"DEV101",cardId:"A3F2",time:"08:02",status:"present"},
  {id:2,name:"Sara Idrissi",role:"Formateur",group:"—",cardId:"B7C1",time:"08:19",status:"late"},
  {id:3,name:"Youssef Ait Taleb",role:"Stagiaire",group:"DEV101",cardId:"C9D4",time:"08:05",status:"present"},
  {id:4,name:"Fatima Zohra Alami",role:"Administrateur",group:"—",cardId:"D2E8",time:"07:55",status:"present"},
  {id:5,name:"Khalid Mansouri",role:"Stagiaire",group:"RES202",cardId:"E5F3",time:"—",status:"absent"},
  {id:6,name:"Nadia Tazi",role:"Formateur",group:"—",cardId:"F1G6",time:"08:31",status:"late"},
  {id:7,name:"Omar Berrada",role:"Stagiaire",group:"DEV101",cardId:"G4H9",time:"08:10",status:"present"},
];

const users = [
  {id:1,name:"Ahmed Benali",role:"Stagiaire",cardId:"A3F2",group:"DEV101",status:"active"},
  {id:2,name:"Sara Idrissi",role:"Formateur",cardId:"B7C1",group:"—",status:"active"},
  {id:3,name:"Youssef Ait Taleb",role:"Stagiaire",cardId:"C9D4",group:"DEV101",status:"active"},
  {id:4,name:"Fatima Zohra Alami",role:"Administrateur",cardId:"D2E8",group:"—",status:"active"},
  {id:5,name:"Khalid Mansouri",role:"Stagiaire",cardId:"E5F3",group:"RES202",status:"inactive"},
];

// ─── HELPERS ──────────────────────────────────────────────────
function initials(name){return name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
function avBg(i){return avatarColors[i % avatarColors.length]}

function badgeHTML(status){
  const map = {
    present:'<span class="badge badge-present">Présent / حاضر</span>',
    late:'<span class="badge badge-late">En retard / متأخر</span>',
    absent:'<span class="badge badge-absent">Absent / غائب</span>',
    active:'<span class="badge badge-active">Actif</span>',
    inactive:'<span class="badge badge-inactive">Inactif</span>',
  };
  return map[status] || '';
}

function roleChip(role){
  const cls = role.toLowerCase().replace(/é/g,'e');
  return `<span class="role-chip ${cls}">${role}</span>`;
}

function setDate(){
  const el = document.getElementById('page-date');
  if(el){
    const d = new Date();
    el.textContent = d.toLocaleDateString('fr-MA',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  }
}

// ─── SIDEBAR MOBILE ───────────────────────────────────────────
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}
function closeSidebar(){
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebar-overlay');
  if(s) s.classList.remove('open');
  if(o) o.classList.remove('open');
}

// ─── SIDEBAR HTML (shared component) ─────────────────────────
function renderSidebar(activePage){
  const pages = [
    {id:'index',label:'Tableau de bord',labelAr:'لوحة التحكم',icon:'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',badge:null},
    {id:'live',label:'Présence en direct',labelAr:'الحضور المباشر',icon:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z',badge:'7'},
    {id:'history',label:'Historique',labelAr:'السجل',icon:'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',badge:null},
  ];
  const mgmt = [
    {id:'users',label:'Utilisateurs',labelAr:'المستخدمون',icon:'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',badge:null},
    {id:'reports',label:'Rapports',labelAr:'التقارير',icon:'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',badge:null},
    {id:'profile',label:'Mon Profil',labelAr:'ملفي',icon:'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',badge:null},
  ];

  function navLink(item){
    const active = item.id === activePage ? 'active' : '';
    const badge = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
    return `<a href="${item.id}.html" class="nav-item ${active}">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="${item.icon}"/></svg>
      ${item.label}${badge}
    </a>`;
  }

  return `
  <div class="ofppt-stripe" style="position:fixed;top:0;left:0;right:0;z-index:200"></div>
  <div class="sidebar-overlay" id="sidebar-overlay" onclick="closeSidebar()"></div>
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">
        <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
      </div>
      <div class="sidebar-logo-text"><h2>CArdPr</h2><p>OFPPT System</p></div>
    </div>
    <div class="sidebar-section">Navigation</div>
    <nav>${pages.map(navLink).join('')}</nav>
    <div class="sidebar-section">Gestion</div>
    <nav>${mgmt.map(navLink).join('')}</nav>
    <div class="sidebar-footer">
      <div class="user-card">
        <div class="user-avatar">AD</div>
        <div class="user-info"><strong>Administrateur</strong><span>admin@ofppt.ma</span></div>
        <button class="logout-btn" onclick="location.href='login.html'" title="Déconnexion">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
        </button>
      </div>
    </div>
  </aside>`;
}

function renderTopbar(title, subtitle){
  return `
  <header class="topbar">
    <button class="hamburger" onclick="toggleSidebar()">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
    </button>
    <div class="topbar-title">
      <h2>${title}</h2>
      <p id="page-date">${subtitle||''}</p>
    </div>
    <div class="topbar-actions">
      <button class="topbar-btn">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
        <span class="notif-dot"></span>
      </button>
      <div class="topbar-user">
        <div class="topbar-avatar">AD</div>
        <div class="topbar-user-info"><strong>Administrateur</strong><span>admin@ofppt.ma</span></div>
        <div class="topbar-chevron"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg></div>
      </div>
    </div>
  </header>`;
}
