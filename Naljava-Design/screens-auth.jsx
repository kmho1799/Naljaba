/* global React, useStore, useToast, navigate, MEMBER_COLORS, fmtKorean, fmtShort, parseKey, dateKey, buildMonthGrid */
const { useState: useS1, useEffect: useE1, useMemo: useM1 } = React;

/* ============ Login screen ============ */
function LoginScreen() {
  const { signIn } = useStore();
  const [loading, setLoading] = useS1(false);
  const handleSignIn = () => {
    setLoading(true);
    setTimeout(() => {signIn();navigate("#/rooms");}, 700);
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px",
      background: "radial-gradient(1200px 600px at 80% -10%, var(--brand-50), transparent 60%), radial-gradient(900px 500px at -10% 110%, #FFF4ED, transparent 60%), var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <IconLogo size={120} />
        </div>
        <h1 className="h1" style={{ marginBottom: 12, fontSize: 34 }}>
          여러 사람의 일정을<br />한 화면에서 맞춰보세요
        </h1>
        <p className="text-muted" style={{ fontSize: 15, lineHeight: 1.55, marginBottom: 36 }}>
          방을 만들고 초대 링크를 공유하면, 멤버들이 자신의 색상으로 일정을<br />입력할 수 있어요. 가능한 날짜를 한눈에 확인하세요.
        </p>
        <button className="btn btn-lg" onClick={handleSignIn} disabled={loading}
        style={{ width: "100%", background: "#fff", color: "var(--fg)", border: "1px solid var(--border-strong)", height: 52, fontSize: 15, boxShadow: "var(--shadow-sm)" }}>
          {loading ? <span style={{ opacity: 0.6 }}>로그인 중...</span> : <><IconGoogle /> Google 계정으로 시작하기</>}
        </button>
        <p className="text-xs text-subtle" style={{ marginTop: 20 }}>
          로그인하면 <a href="#" style={{ color: "var(--fg-muted)", textDecoration: "underline" }}>이용약관</a>과 <a href="#" style={{ color: "var(--fg-muted)", textDecoration: "underline" }}>개인정보처리방침</a>에 동의하는 것으로 간주됩니다
        </p>
        <div style={{ marginTop: 64, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          <FeatureBadge icon={<IconUsers size={14} />} label="방 기반 협업" />
          <FeatureBadge icon={<IconPalette size={14} />} label="멤버별 색상" />
          <FeatureBadge icon={<IconCalendar size={14} />} label="공동 캘린더" />
        </div>
      </div>
    </div>);

}
const FeatureBadge = ({ icon, label }) =>
<div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--fg-muted)" }}>
    <span style={{ color: "var(--brand)" }}>{icon}</span>{label}
  </div>;


/* ============ App shell (top bar) ============ */
function AppShell({ children, current }) {
  const { state, signOut } = useStore();
  const me = state.auth.user;
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ height: 60, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
        position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => navigate("#/rooms")}>
          <IconLogo size={44} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("#/rooms")}
          style={{ color: current === "rooms" ? "var(--fg)" : "var(--fg-muted)" }}>
            내 방
          </button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar user={me} size={28} />
            <span className="text-sm" style={{ fontWeight: 500 }}>{me.name}</span>
          </div>
          <button className="btn btn-ghost btn-icon" title="로그아웃" onClick={() => {signOut();navigate("#/login");}}>
            <IconLogout size={16} />
          </button>
        </div>
      </header>
      {children}
    </div>);

}
function Avatar({ user, size = 32, color, ring }) {
  const s = { width: size, height: size, fontSize: size * 0.4, background: color || "var(--surface-2)",
    color: color ? "#fff" : "var(--fg-muted)", border: ring ? `2px solid ${ring}` : undefined };
  return <span className="avatar" style={s}>{user?.initials || "?"}</span>;
}

/* ============ Room list ============ */
function RoomListScreen() {
  const { state } = useStore();
  const meId = state.auth.user.id;
  const myRooms = Object.values(state.rooms).filter((r) => r.members.some((m) => m.userId === meId));
  return (
    <AppShell current="rooms">
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 className="h1" style={{ marginBottom: 6 }}>내 방</h1>
            <p className="text-muted" style={{ fontSize: 14 }}>참여 중인 캘린더 방 {myRooms.length}개</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("#/rooms/new")}>
            <IconPlus size={16} /> 새 방 만들기
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {myRooms.map((r) => <RoomCard key={r.id} room={r} meId={meId} users={state.users} />)}
          <button onClick={() => navigate("#/rooms/new")}
          style={{ minHeight: 200, border: "1.5px dashed var(--border-strong)", borderRadius: "var(--radius-lg)",
            background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 10, color: "var(--fg-muted)", fontSize: 14, fontWeight: 500, transition: "all 0.15s" }}
          onMouseEnter={(e) => {e.currentTarget.style.background = "var(--surface-2)";e.currentTarget.style.borderColor = "var(--brand-200)";e.currentTarget.style.color = "var(--brand)";}}
          onMouseLeave={(e) => {e.currentTarget.style.background = "transparent";e.currentTarget.style.borderColor = "var(--border-strong)";e.currentTarget.style.color = "var(--fg-muted)";}}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconPlus size={20} />
            </div>
            새 방 만들기
          </button>
        </div>
        {myRooms.length === 0 &&
        <div className="card" style={{ padding: 60, textAlign: "center", marginTop: 24 }}>
            <p className="text-muted">참여 중인 방이 없어요. 새 방을 만들어 보세요.</p>
          </div>
        }
      </main>
    </AppShell>);

}

function RoomCard({ room, meId, users }) {
  const me = room.members.find((m) => m.userId === meId);
  const upcomingCount = room.events.filter((e) => e.date >= "2026-05-07").length;
  const isOwner = room.ownerId === meId;
  return (
    <button onClick={() => navigate(`#/r/${room.id}`)}
    className="card"
    style={{ textAlign: "left", padding: 0, border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.15s", overflow: "hidden", background: "#fff" }}
    onMouseEnter={(e) => {e.currentTarget.style.transform = "translateY(-2px)";e.currentTarget.style.boxShadow = "var(--shadow)";}}
    onMouseLeave={(e) => {e.currentTarget.style.transform = "none";e.currentTarget.style.boxShadow = "var(--shadow-sm)";}}>
      <div style={{ height: 6, background: me?.color || "var(--brand)" }} />
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 className="h2" style={{ fontSize: 17, margin: 0 }}>{room.name}</h3>
          {isOwner && <span className="chip" style={{ background: "var(--brand-50)", color: "var(--brand-700)", fontWeight: 600 }}>방장</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="avatar-stack">
            {room.members.slice(0, 4).map((m) =>
            <Avatar key={m.userId} user={users[m.userId]} size={28} color={m.color} />
            )}
            {room.members.length > 4 && <span className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>+{room.members.length - 4}</span>}
          </div>
          <span className="text-xs text-muted">멤버 {room.members.length}명 · 일정 {upcomingCount}개</span>
        </div>
      </div>
    </button>);

}

/* ============ Create room ============ */
function CreateRoomScreen() {
  const { createRoom } = useStore();
  const toast = useToast();
  const [name, setName] = useS1("");
  const [pw, setPw] = useS1("");
  const [colorIdx, setColorIdx] = useS1(0);
  const valid = name.trim().length > 0 && pw.trim().length >= 4;
  const submit = () => {
    if (!valid) return;
    const id = createRoom({ name: name.trim(), password: pw.trim(), color: MEMBER_COLORS[colorIdx].value });
    toast("방이 생성되었어요", { icon: "check" });
    navigate(`#/r/${id}`);
  };
  return (
    <AppShell current="rooms">
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 80px" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("#/rooms")} style={{ marginBottom: 20, marginLeft: -12 }}>
          <IconArrowLeft size={14} /> 내 방으로
        </button>
        <h1 className="h1" style={{ marginBottom: 6 }}>새 방 만들기</h1>
        <p className="text-muted" style={{ marginBottom: 32, fontSize: 14 }}>방 이름과 비밀번호만 있으면 시작할 수 있어요.</p>
        <div className="card" style={{ padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <label className="label">방 이름</label>
            <input className="input" placeholder="예: 디자인 스터디" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} autoFocus />
            <p className="help">방 이름이 중복되어도 괜찮아요. 초대 링크는 자동으로 만들어져요.</p>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="label">방 비밀번호</label>
            <input className="input" placeholder="4자 이상" value={pw} onChange={(e) => setPw(e.target.value)} maxLength={20} />
            <p className="help">초대 링크와 함께 비밀번호를 공유해주세요.</p>
          </div>
          <div style={{ marginBottom: 28 }}>
            <label className="label">내 색상</label>
            <p className="help" style={{ marginTop: 0, marginBottom: 10 }}>방 안에서 내 일정에 표시될 색상이에요.</p>
            <ColorPicker value={colorIdx} onChange={setColorIdx} />
          </div>
          <button className="btn btn-primary btn-lg" onClick={submit} disabled={!valid}
          style={{ width: "100%", opacity: valid ? 1 : 0.5 }}>
            방 만들기 <IconArrowRight size={16} />
          </button>
        </div>
      </main>
    </AppShell>);

}

function ColorPicker({ value, onChange, size = 36 }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {MEMBER_COLORS.map((c, i) =>
      <button key={c.name} onClick={() => onChange(i)}
      aria-label={c.name}
      style={{ width: size, height: size, borderRadius: "50%", border: "none", padding: 0,
        background: c.value, cursor: "pointer", position: "relative", transition: "transform 0.15s",
        boxShadow: value === i ? `0 0 0 3px #fff, 0 0 0 5px ${c.value}` : "var(--shadow-sm)",
        transform: value === i ? "scale(1.05)" : "none" }}>
          {value === i && <IconCheck size={16} style={{ color: "#fff", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />}
        </button>
      )}
    </div>);

}

/* ============ Invite Join ============ */
function InviteJoinScreen({ code }) {
  const { state } = useStore();
  const toast = useToast();
  // Simulate: any code matches a fixed room. We'll use r_2 as the "invited" room demo.
  const room = state.rooms.r_2;
  const meId = state.auth.user.id;
  const alreadyJoined = room.members.some((m) => m.userId === meId);
  const [pw, setPw] = useS1("");
  const [colorIdx, setColorIdx] = useS1(2);
  const [error, setError] = useS1("");
  const submit = () => {
    if (pw !== room.password) {setError("비밀번호가 올바르지 않아요");return;}
    toast("방에 입장했어요", { icon: "check" });
    navigate(`#/r/${room.id}`);
  };
  if (alreadyJoined) {
    useE1(() => {navigate(`#/r/${room.id}`);}, []);
    return null;
  }
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
      <div className="card" style={{ width: 480, maxWidth: "100%", padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <IconLogo size={48} />
        </div>
        <div className="chip" style={{ marginBottom: 14, background: "var(--brand-50)", color: "var(--brand-700)" }}>
          <IconLink size={12} /> 초대 링크
        </div>
        <h1 className="h2" style={{ marginBottom: 6 }}>{room.name}</h1>
        <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
          방장 <strong style={{ color: "var(--fg)" }}>{state.users[room.ownerId]?.name}</strong>님이 초대했어요. 비밀번호와 색상을 입력하면 입장할 수 있어요.
        </p>
        <div style={{ marginBottom: 18 }}>
          <label className="label">방 비밀번호</label>
          <input className="input" type="password" placeholder="비밀번호" value={pw} onChange={(e) => {setPw(e.target.value);setError("");}} autoFocus />
          {error && <p style={{ color: "#C0392B", fontSize: 12, marginTop: 6 }}>{error}</p>}
          <p className="help">힌트: <code className="kbd">mountain</code></p>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label className="label">내 색상</label>
          <ColorPicker value={colorIdx} onChange={setColorIdx} size={32} />
        </div>
        <button className="btn btn-primary btn-lg" onClick={submit} style={{ width: "100%" }}>
          방 입장 <IconArrowRight size={16} />
        </button>
      </div>
    </div>);

}

window.LoginScreen = LoginScreen;
window.RoomListScreen = RoomListScreen;
window.CreateRoomScreen = CreateRoomScreen;
window.InviteJoinScreen = InviteJoinScreen;
window.AppShell = AppShell;
window.Avatar = Avatar;
window.ColorPicker = ColorPicker;