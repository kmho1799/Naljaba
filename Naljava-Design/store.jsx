/* global React */
const { useState, useEffect, useMemo, useRef, useCallback } = React;

/* ============== STORE ============== */
// Single in-memory store for the prototype. Persisted to sessionStorage so refresh keeps state.

const MEMBER_COLORS = [
  { name: "blue",     value: "#5B8DEF" },
  { name: "coral",    value: "#FF8A65" },
  { name: "mint",     value: "#5BC4A8" },
  { name: "lavender", value: "#C28DEF" },
  { name: "honey",    value: "#F5C16C" },
  { name: "pink",     value: "#EF7AA0" },
  { name: "slate",    value: "#7A8FA6" },
];

const SEED = () => {
  // today, etc. We'll use 2026-05 as the displayed month since "current date" is May 7 2026.
  const todayKey = "2026-05-07";
  const me = { id: "u_me", name: "김지원", email: "jiwon@gmail.com", initials: "김" };
  const others = [
    { id: "u_2", name: "박서연", email: "seoyeon@gmail.com", initials: "박" },
    { id: "u_3", name: "이도윤", email: "doyoon@gmail.com", initials: "이" },
    { id: "u_4", name: "최민수", email: "minsu@gmail.com", initials: "최" },
  ];
  return {
    auth: { signedIn: false, user: me },
    rooms: {
      r_1: {
        id: "r_1",
        name: "디자인 스터디",
        password: "study2026",
        ownerId: "u_me",
        inviteCode: "naljaba.app/r/x7K2pQ",
        members: [
          { userId: "u_me", color: "#5B8DEF", joinedAt: "2026-04-15", role: "owner" },
          { userId: "u_2",  color: "#FF8A65", joinedAt: "2026-04-15", role: "member" },
          { userId: "u_3",  color: "#5BC4A8", joinedAt: "2026-04-18", role: "member" },
          { userId: "u_4",  color: "#C28DEF", joinedAt: "2026-04-22", role: "member" },
        ],
        events: [
          { id: "e1", date: "2026-05-04", title: "스터디 모임", description: "Figma 컴포넌트 시스템", authorId: "u_me" },
          { id: "e2", date: "2026-05-04", title: "회사 회식", description: "", authorId: "u_2" },
          { id: "e3", date: "2026-05-06", title: "병원 예약", description: "오후 2시", authorId: "u_3" },
          { id: "e4", date: "2026-05-08", title: "프로젝트 데모", description: "팀 발표 리허설", authorId: "u_me" },
          { id: "e5", date: "2026-05-08", title: "출장", description: "부산 1박 2일", authorId: "u_4" },
          { id: "e6", date: "2026-05-09", title: "출장", description: "부산 1박 2일", authorId: "u_4" },
          { id: "e7", date: "2026-05-12", title: "스터디 모임", description: "리서치 공유", authorId: "u_me" },
          { id: "e8", date: "2026-05-13", title: "치과", description: "", authorId: "u_2" },
          { id: "e9", date: "2026-05-15", title: "어버이날 가족 모임", description: "", authorId: "u_3" },
          { id: "e10", date: "2026-05-15", title: "친구 결혼식", description: "오후 1시", authorId: "u_2" },
          { id: "e11", date: "2026-05-19", title: "스터디 모임", description: "프로토타이핑", authorId: "u_me" },
          { id: "e12", date: "2026-05-21", title: "워크숍", description: "", authorId: "u_4" },
          { id: "e13", date: "2026-05-22", title: "워크숍", description: "", authorId: "u_4" },
          { id: "e14", date: "2026-05-26", title: "스터디 모임", description: "최종 발표 준비", authorId: "u_me" },
          { id: "e15", date: "2026-05-28", title: "휴가", description: "제주도", authorId: "u_2" },
          { id: "e16", date: "2026-05-29", title: "휴가", description: "제주도", authorId: "u_2" },
          { id: "e17", date: "2026-05-29", title: "마감일", description: "디자인 시스템 v1", authorId: "u_3" },
        ],
      },
      r_2: {
        id: "r_2",
        name: "주말 등산 모임",
        password: "mountain",
        ownerId: "u_2",
        inviteCode: "naljaba.app/r/m4N9wL",
        members: [
          { userId: "u_2",  color: "#FF8A65", joinedAt: "2026-03-01", role: "owner" },
          { userId: "u_me", color: "#5BC4A8", joinedAt: "2026-03-02", role: "member" },
          { userId: "u_3",  color: "#C28DEF", joinedAt: "2026-03-05", role: "member" },
        ],
        events: [
          { id: "e21", date: "2026-05-10", title: "북한산", description: "", authorId: "u_me" },
          { id: "e22", date: "2026-05-17", title: "관악산", description: "", authorId: "u_2" },
          { id: "e23", date: "2026-05-24", title: "설악산 1박", description: "", authorId: "u_3" },
          { id: "e24", date: "2026-05-25", title: "설악산 1박", description: "", authorId: "u_3" },
        ],
      },
      r_3: {
        id: "r_3",
        name: "친구들 여행",
        password: "trip!",
        ownerId: "u_3",
        inviteCode: "naljaba.app/r/v8R3kT",
        members: [
          { userId: "u_3",  color: "#5B8DEF", joinedAt: "2026-04-01", role: "owner" },
          { userId: "u_me", color: "#F5C16C", joinedAt: "2026-04-02", role: "member" },
          { userId: "u_2",  color: "#EF7AA0", joinedAt: "2026-04-02", role: "member" },
          { userId: "u_4",  color: "#7A8FA6", joinedAt: "2026-04-03", role: "member" },
        ],
        events: [
          { id: "e31", date: "2026-05-23", title: "여행 가능", description: "", authorId: "u_me" },
          { id: "e32", date: "2026-05-24", title: "여행 가능", description: "", authorId: "u_me" },
          { id: "e33", date: "2026-05-30", title: "여행 가능", description: "", authorId: "u_2" },
          { id: "e34", date: "2026-05-31", title: "여행 가능", description: "", authorId: "u_2" },
        ],
      },
    },
    users: { u_me: me, u_2: others[0], u_3: others[1], u_4: others[2] },
    todayKey,
  };
};

const StoreContext = React.createContext(null);
function StoreProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const cached = sessionStorage.getItem("naljaba-state");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return SEED();
  });
  useEffect(() => {
    try { sessionStorage.setItem("naljaba-state", JSON.stringify(state)); } catch (e) {}
  }, [state]);

  const actions = useMemo(() => ({
    signIn: () => setState(s => ({ ...s, auth: { ...s.auth, signedIn: true }})),
    signOut: () => setState(s => ({ ...s, auth: { ...s.auth, signedIn: false }})),
    createRoom: ({ name, password, color }) => {
      const id = "r_" + Math.random().toString(36).slice(2, 8);
      const code = "naljaba.app/r/" + Math.random().toString(36).slice(2, 8);
      setState(s => ({
        ...s,
        rooms: {
          ...s.rooms,
          [id]: {
            id, name, password, ownerId: s.auth.user.id, inviteCode: code,
            members: [{ userId: s.auth.user.id, color, joinedAt: s.todayKey, role: "owner" }],
            events: [],
          }
        }
      }));
      return id;
    },
    addEvent: (roomId, { date, title, description }) => setState(s => {
      const room = s.rooms[roomId];
      const ev = { id: "e_" + Math.random().toString(36).slice(2, 7), date, title, description, authorId: s.auth.user.id };
      return { ...s, rooms: { ...s.rooms, [roomId]: { ...room, events: [...room.events, ev] }}};
    }),
    updateEvent: (roomId, eventId, patch) => setState(s => {
      const room = s.rooms[roomId];
      return { ...s, rooms: { ...s.rooms, [roomId]: { ...room, events: room.events.map(e => e.id === eventId ? {...e, ...patch} : e) }}};
    }),
    deleteEvent: (roomId, eventId) => setState(s => {
      const room = s.rooms[roomId];
      return { ...s, rooms: { ...s.rooms, [roomId]: { ...room, events: room.events.filter(e => e.id !== eventId) }}};
    }),
    setMyColor: (roomId, color) => setState(s => {
      const room = s.rooms[roomId];
      const meId = s.auth.user.id;
      return { ...s, rooms: { ...s.rooms, [roomId]: {
        ...room,
        members: room.members.map(m => m.userId === meId ? {...m, color} : m),
        events: room.events.map(e => e.authorId === meId ? e : e), // colors live on member; events resolve dynamically
      }}};
    }),
    setRoomPassword: (roomId, password) => setState(s => ({
      ...s, rooms: { ...s.rooms, [roomId]: { ...s.rooms[roomId], password }}
    })),
    leaveRoom: (roomId) => setState(s => {
      const room = s.rooms[roomId];
      const meId = s.auth.user.id;
      return { ...s, rooms: { ...s.rooms, [roomId]: { ...room, members: room.members.filter(m => m.userId !== meId) }}};
    }),
    resetAll: () => setState(SEED()),
  }), []);

  return <StoreContext.Provider value={{ state, ...actions }}>{children}</StoreContext.Provider>;
}
const useStore = () => React.useContext(StoreContext);

/* ============== HELPERS ============== */

const PALETTE = MEMBER_COLORS;

function pad(n){ return String(n).padStart(2, "0"); }
function dateKey(y, m, d){ return `${y}-${pad(m+1)}-${pad(d)}`; }
function parseKey(k){ const [y,m,d] = k.split("-").map(Number); return new Date(y, m-1, d); }
function fmtKorean(k) {
  const dt = parseKey(k);
  const dow = ["일","월","화","수","목","금","토"][dt.getDay()];
  return `${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 (${dow})`;
}
function fmtShort(k) {
  const dt = parseKey(k);
  const dow = ["일","월","화","수","목","금","토"][dt.getDay()];
  return `${dt.getMonth()+1}월 ${dt.getDate()}일 ${dow}`;
}

function buildMonthGrid(year, monthIdx) {
  // Returns 6 rows x 7 days, with previous/next month overflow.
  const first = new Date(year, monthIdx, 1);
  const startDow = first.getDay(); // 0=Sun
  const cells = [];
  // Lead with previous month
  const prevLast = new Date(year, monthIdx, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevLast - i;
    const dt = new Date(year, monthIdx - 1, d);
    cells.push({ key: dateKey(dt.getFullYear(), dt.getMonth(), d), day: d, inMonth: false, dow: dt.getDay() });
  }
  // This month
  const last = new Date(year, monthIdx + 1, 0).getDate();
  for (let d = 1; d <= last; d++) {
    cells.push({ key: dateKey(year, monthIdx, d), day: d, inMonth: true, dow: new Date(year, monthIdx, d).getDay() });
  }
  // Trailing
  while (cells.length < 42) {
    const idx = cells.length - (startDow + last);
    const d = idx + 1;
    const dt = new Date(year, monthIdx + 1, d);
    cells.push({ key: dateKey(dt.getFullYear(), dt.getMonth(), d), day: d, inMonth: false, dow: dt.getDay() });
  }
  return cells;
}

/* ============== ROUTING ============== */
// Hash routes:
//   #/login
//   #/rooms
//   #/rooms/new
//   #/invite/:code     (simulated invite link)
//   #/r/:roomId        (calendar — main)
//   #/r/:roomId/members
//   #/mobile           (phone mockup variant)

function useHashRoute() {
  const [hash, setHash] = useState(() => location.hash || "#/login");
  useEffect(() => {
    const onHash = () => setHash(location.hash || "#/login");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return hash;
}
function navigate(to) { location.hash = to; }
function parseRoute(hash) {
  const path = hash.replace(/^#/, "") || "/login";
  const parts = path.split("/").filter(Boolean);
  return { path, parts };
}

/* ============== TOASTS ============== */
const ToastContext = React.createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, icon: opts.icon }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2400);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-area">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.icon === "check" ? <IconCheck size={14}/> : null}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
const useToast = () => React.useContext(ToastContext);

Object.assign(window, {
  StoreProvider, useStore, ToastProvider, useToast,
  useHashRoute, navigate, parseRoute,
  PALETTE, MEMBER_COLORS,
  dateKey, parseKey, fmtKorean, fmtShort, buildMonthGrid,
  pad,
});
