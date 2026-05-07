/* global React, ReactDOM, StoreProvider, ToastProvider, useStore, useHashRoute, parseRoute, navigate,
   LoginScreen, RoomListScreen, CreateRoomScreen, InviteJoinScreen, CalendarScreen, MembersScreen, MobileScreen,
   TweaksPanel, useTweaks, TweakSection, TweakColor */
const { useEffect: useEa, useState: useSa } = React;

// Brand color presets exposed via Tweaks
const BRAND_PRESETS = [
  { name: "Indigo blue", base: "#3B5BFF", b50: "#EEF1FF", b100: "#DDE4FF", b200: "#BCC8FF", b500: "#3B5BFF", b600: "#2D49DB", b700: "#243BB8" },
  { name: "Coral",       base: "#FF6B4A", b50: "#FFF1EC", b100: "#FFDDD0", b200: "#FFB59A", b500: "#FF6B4A", b600: "#E0533A", b700: "#B53C29" },
  { name: "Forest",      base: "#1F8A5B", b50: "#EAF7F0", b100: "#D0EDDB", b200: "#9FD8B6", b500: "#1F8A5B", b600: "#176E48", b700: "#125236" },
  { name: "Violet",      base: "#7C3AED", b50: "#F3EEFF", b100: "#E5DBFF", b200: "#C9B0FF", b500: "#7C3AED", b600: "#6428D1", b700: "#4F1FA6" },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "brandIdx": 0
}/*EDITMODE-END*/;

function applyBrand(idx) {
  const p = BRAND_PRESETS[idx] || BRAND_PRESETS[0];
  const r = document.documentElement.style;
  r.setProperty("--brand", p.base);
  r.setProperty("--brand-50", p.b50);
  r.setProperty("--brand-100", p.b100);
  r.setProperty("--brand-200", p.b200);
  r.setProperty("--brand-500", p.b500);
  r.setProperty("--brand-600", p.b600);
  r.setProperty("--brand-700", p.b700);
}

function Router() {
  const hash = useHashRoute();
  const { state } = useStore();
  const { parts } = parseRoute(hash);

  // Auth gate
  useEa(() => {
    const path = "/" + parts.join("/");
    const isInvite = parts[0] === "invite";
    const isLogin = parts[0] === "login";
    const isMobile = parts[0] === "mobile";
    if (!state.auth.signedIn && !isLogin && !isInvite && !isMobile) {
      navigate("#/login");
    } else if (state.auth.signedIn && isLogin) {
      navigate("#/rooms");
    }
  }, [state.auth.signedIn, parts.join("/")]);

  if (parts[0] === "mobile") return <MobileScreen/>;
  if (!state.auth.signedIn) {
    if (parts[0] === "invite") return <InviteJoinScreen code={parts[1]}/>;
    return <LoginScreen/>;
  }
  if (parts[0] === "login") return <LoginScreen/>;
  if (parts[0] === "invite") return <InviteJoinScreen code={parts[1]}/>;
  if (parts[0] === "rooms" && parts[1] === "new") return <CreateRoomScreen/>;
  if (parts[0] === "rooms") return <RoomListScreen/>;
  if (parts[0] === "r" && parts[1] && parts[2] === "members") return <MembersScreen roomId={parts[1]}/>;
  if (parts[0] === "r" && parts[1]) return <CalendarScreen roomId={parts[1]}/>;
  return <RoomListScreen/>;
}

function FloatingHelpers() {
  // Small overlay: jump to mobile mockup, simulate invite link, and a brief route hint.
  // Hidden when on mobile preview or tweaks panel covers it.
  const hash = useHashRoute();
  const { parts } = parseRoute(hash);
  const [open, setOpen] = useSa(false);
  if (parts[0] === "mobile") return null;
  return (
    <div style={{position:"fixed",bottom:24,left:24,zIndex:40}}>
      {open ? (
        <div className="card" style={{padding:14,width:260,boxShadow:"var(--shadow-lg)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:13,fontWeight:600}}>프로토타입 메뉴</span>
            <button className="btn btn-ghost btn-icon" style={{width:24,height:24}} onClick={() => setOpen(false)}><IconX size={12}/></button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("#/login")}>로그인 화면</button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("#/rooms")}>방 목록</button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("#/rooms/new")}>방 만들기</button>
            <button className="btn btn-secondary btn-sm" onClick={() => { 
              const { signOut } = window.__store; signOut(); navigate("#/invite/m4N9wL"); 
            }}>초대 링크 시뮬레이션</button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("#/mobile")}>모바일 미리보기</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { 
              window.__store.resetAll(); 
              setTimeout(() => location.reload(), 100);
            }}>샘플 데이터 초기화</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-secondary"
          style={{borderRadius:999,height:40,padding:"0 16px",boxShadow:"var(--shadow)"}}
          onClick={() => setOpen(true)}>
          <IconCalendar size={14}/> 화면 이동
        </button>
      )}
    </div>
  );
}

// Expose store for the FloatingHelpers (avoid hook-in-button complexity)
function StoreExposer() {
  const store = useStore();
  useEa(() => { window.__store = store; }, [store]);
  return null;
}

function NalJabaTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEa(() => { applyBrand(t.brandIdx); }, [t.brandIdx]);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="브랜드 컬러" subtitle="앱 전반의 포인트 색상을 바꿔보세요">
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
          {BRAND_PRESETS.map((p, i) => (
            <button key={p.name} onClick={() => setTweak("brandIdx", i)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:10,
                      border: t.brandIdx === i ? `1.5px solid ${p.base}` : "1px solid #2a2a2a",
                      background: t.brandIdx === i ? "rgba(255,255,255,0.08)" : "transparent",
                      cursor:"pointer", color:"#e5e5e5", fontSize:12, fontWeight:500, textAlign:"left"}}>
              <span style={{width:14,height:14,borderRadius:"50%",background:p.base,flexShrink:0}}/>
              {p.name}
            </button>
          ))}
        </div>
      </TweakSection>
    </TweaksPanel>
  );
}

function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <StoreExposer/>
        <Router/>
        <FloatingHelpers/>
        <NalJabaTweaks/>
      </ToastProvider>
    </StoreProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
