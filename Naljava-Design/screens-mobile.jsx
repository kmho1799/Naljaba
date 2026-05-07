/* global React, useStore, MEMBER_COLORS, parseKey, dateKey, buildMonthGrid, fmtShort, IOSDevice, IOSStatusBar, Avatar */
const { useState: useS4, useMemo: useM4 } = React;

function MobileScreen() {
  return (
    <div style={{minHeight:"100vh",padding:"40px 24px",background:"linear-gradient(180deg, #FAFAF7 0%, #F0F0EA 100%)",
                 display:"flex",flexDirection:"column",alignItems:"center",gap:24}}>
      <div style={{textAlign:"center",maxWidth:600}}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("#/rooms")} style={{marginBottom:12}}>
          <IconArrowLeft size={14}/> 데스크탑으로 돌아가기
        </button>
        <h1 className="h1" style={{marginBottom:6}}>모바일 미리보기</h1>
        <p className="text-muted" style={{fontSize:14}}>좁은 뷰포트에서의 핵심 화면들. 가로로 스크롤해서 확인하세요.</p>
      </div>
      <div style={{display:"flex",gap:32,padding:"20px 40px 60px",overflowX:"auto",alignItems:"flex-start"}}>
        <PhoneFrame label="로그인"><MobileLogin/></PhoneFrame>
        <PhoneFrame label="방 목록"><MobileRoomList/></PhoneFrame>
        <PhoneFrame label="공동 캘린더"><MobileCalendar/></PhoneFrame>
        <PhoneFrame label="일정 추가"><MobileCompose/></PhoneFrame>
      </div>
    </div>
  );
}

function PhoneFrame({ label, children }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,flexShrink:0}}>
      <IOSDevice width={360} height={780}>
        <div style={{width:"100%",height:"100%",background:"var(--bg)",overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {children}
        </div>
      </IOSDevice>
      <span className="text-sm" style={{fontWeight:600,color:"var(--fg-muted)"}}>{label}</span>
    </div>
  );
}

function MobileLogin() {
  return (
    <>
      <IOSStatusBar/>
      <div style={{flex:1,padding:"20px 24px 32px",display:"flex",flexDirection:"column",justifyContent:"space-between",
                   background:"radial-gradient(600px 400px at 100% -20%, var(--brand-50), transparent 60%), var(--bg)"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",textAlign:"center"}}>
          <div style={{alignSelf:"center",marginBottom:24}}>
            <IconLogo size={110}/>
          </div>
          <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-0.02em",margin:"0 0 10px",lineHeight:1.25}}>
            여러 사람의 일정을<br/>한 화면에
          </h1>
          <p className="text-muted text-sm" style={{margin:0,lineHeight:1.5}}>
            방을 만들고 색상별로 일정을 입력하면<br/>가능한 날짜가 한눈에 보여요
          </p>
        </div>
        <div>
          <button className="btn btn-lg" style={{width:"100%",background:"#fff",border:"1px solid var(--border-strong)",height:52,boxShadow:"var(--shadow-sm)"}}>
            <IconGoogle/> Google로 시작하기
          </button>
          <p className="text-xs text-subtle" style={{textAlign:"center",margin:"14px 0 0",lineHeight:1.5}}>
            로그인하면 이용약관과<br/>개인정보처리방침에 동의하게 돼요
          </p>
        </div>
      </div>
    </>
  );
}

function MobileRoomList() {
  const { state } = useStore();
  const meId = state.auth.user.id;
  const myRooms = Object.values(state.rooms).filter(r => r.members.some(m => m.userId === meId));
  return (
    <>
      <IOSStatusBar/>
      <div style={{padding:"4px 20px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h1 style={{fontSize:24,fontWeight:700,letterSpacing:"-0.02em",margin:0}}>내 방</h1>
        <button className="btn btn-primary btn-sm" style={{height:36,paddingLeft:14,paddingRight:14}}><IconPlus size={14}/> 새 방</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"6px 16px 24px",display:"flex",flexDirection:"column",gap:12}}>
        {myRooms.map(r => {
          const me = r.members.find(m => m.userId === meId);
          const upcoming = r.events.filter(e => e.date >= "2026-05-07").length;
          return (
            <div key={r.id} className="card" style={{overflow:"hidden",background:"#fff"}}>
              <div style={{height:5,background:me?.color}}/>
              <div style={{padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <h3 style={{fontSize:15,fontWeight:700,margin:0}}>{r.name}</h3>
                  {r.ownerId === meId && <span className="chip" style={{background:"var(--brand-50)",color:"var(--brand-700)",fontSize:11,fontWeight:600}}>방장</span>}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div className="avatar-stack">
                    {r.members.slice(0, 4).map(m => <Avatar key={m.userId} user={state.users[m.userId]} size={24} color={m.color}/>)}
                  </div>
                  <span className="text-xs text-muted">{r.members.length}명 · 일정 {upcoming}개</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function MobileCalendar() {
  const { state } = useStore();
  const room = state.rooms.r_1;
  const meId = state.auth.user.id;
  const grid = useM4(() => buildMonthGrid(2026, 4), []);
  const [selected, setSelected] = useS4("2026-05-08");
  const colorByUser = useM4(() => {
    const m = {}; room.members.forEach(mm => m[mm.userId] = mm.color); return m;
  }, [room]);
  const eventsByDate = useM4(() => {
    const map = {};
    room.events.forEach(e => { if (!map[e.date]) map[e.date] = []; map[e.date].push(e); });
    return map;
  }, [room.events]);
  const todayKey = "2026-05-07";
  const dayEvents = eventsByDate[selected] || [];
  return (
    <>
      <IOSStatusBar/>
      <div style={{padding:"6px 16px 12px",borderBottom:"1px solid var(--border)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <button className="btn btn-ghost btn-icon" style={{width:32,height:32}}><IconArrowLeft size={14}/></button>
          <div style={{textAlign:"center",flex:1}}>
            <div style={{fontSize:14,fontWeight:700}}>{room.name}</div>
            <div className="text-xs text-muted">멤버 {room.members.length}명</div>
          </div>
          <button className="btn btn-ghost btn-icon" style={{width:32,height:32}}><IconSettings size={14}/></button>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 4px"}}>
          <h2 style={{fontSize:18,fontWeight:700,margin:0}}>2026년 5월</h2>
          <div style={{display:"flex",gap:2}}>
            <button className="btn btn-ghost btn-icon" style={{width:30,height:30}}><IconChevronLeft size={14}/></button>
            <button className="btn btn-ghost btn-icon" style={{width:30,height:30}}><IconChevronRight size={14}/></button>
          </div>
        </div>
      </div>
      <div style={{padding:"4px 8px 0"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {["일","월","화","수","목","금","토"].map((d, i) => (
            <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:600,padding:"6px 0",
                  color: i===0?"#E26B6B":i===6?"#5B8DEF":"var(--fg-muted)"}}>{d}</div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {grid.map((c, idx) => {
            const isSel = c.key === selected;
            const isToday = c.key === todayKey;
            const evs = eventsByDate[c.key] || [];
            return (
              <button key={idx} onClick={() => setSelected(c.key)}
                style={{height:44,border:"none",background:"transparent",padding:0,position:"relative",cursor:"pointer",
                        opacity:c.inMonth?1:0.35}}>
                <div style={{
                  width:30,height:30,borderRadius:"50%",margin:"0 auto",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:13, fontWeight: isToday||isSel ? 700 : 500,
                  background: isSel ? "var(--brand)" : isToday ? "var(--brand-50)" : "transparent",
                  color: isSel ? "#fff" : isToday ? "var(--brand)" : (c.dow===0?"#E26B6B":c.dow===6?"#5B8DEF":"var(--fg)"),
                }}>{c.day}</div>
                <div style={{display:"flex",justifyContent:"center",gap:2,marginTop:2,height:5}}>
                  {evs.slice(0,4).map(e => (
                    <span key={e.id} className="dot" style={{background: colorByUser[e.authorId], width:4, height:4}}/>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{flex:1,borderTop:"1px solid var(--border)",marginTop:8,padding:"14px 16px",overflowY:"auto",background:"#fff"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:12}}>
          <div>
            <div className="text-xs text-muted" style={{fontWeight:600}}>{fmtShort(selected)}</div>
            <div style={{fontSize:14,fontWeight:600,marginTop:2}}>일정 {dayEvents.length}개</div>
          </div>
          <button className="btn btn-primary btn-sm"><IconPlus size={13}/> 추가</button>
        </div>
        {dayEvents.map(e => (
          <div key={e.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
            <span className="dot" style={{background:colorByUser[e.authorId], width:10, height:10, marginTop:6, flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:600}}>{e.title}</div>
              {e.description && <div className="text-xs text-muted" style={{marginTop:2}}>{e.description}</div>}
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:5}}>
                <Avatar user={state.users[e.authorId]} size={14} color={colorByUser[e.authorId]}/>
                <span className="text-xs text-muted">{state.users[e.authorId]?.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function MobileCompose() {
  return (
    <>
      <IOSStatusBar/>
      <div style={{padding:"6px 16px 12px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button className="btn btn-ghost btn-sm" style={{padding:"0 4px"}}>취소</button>
        <span style={{fontSize:15,fontWeight:700}}>일정 추가</span>
        <button className="btn btn-primary btn-sm" style={{padding:"0 14px"}}>저장</button>
      </div>
      <div style={{flex:1,padding:"20px 18px",display:"flex",flexDirection:"column",gap:16,background:"#fff"}}>
        <div>
          <label className="label">날짜</label>
          <div className="input" style={{display:"flex",alignItems:"center",gap:8}}>
            <IconCalendar size={14} style={{color:"var(--fg-muted)"}}/>
            <span style={{fontSize:14}}>2026년 5월 8일 (금)</span>
          </div>
        </div>
        <div>
          <label className="label">제목</label>
          <input className="input" defaultValue="프로젝트 데모"/>
        </div>
        <div>
          <label className="label">설명 <span className="text-subtle text-xs" style={{fontWeight:400,marginLeft:4}}>선택</span></label>
          <textarea className="input textarea" defaultValue="팀 발표 리허설"/>
        </div>
        <div style={{padding:"10px 12px",background:"var(--surface-2)",borderRadius:10,display:"flex",alignItems:"center",gap:8,marginTop:"auto"}}>
          <span className="dot" style={{background:"#5B8DEF", width:10, height:10}}/>
          <span className="text-sm">내 색상으로 표시돼요</span>
        </div>
      </div>
    </>
  );
}

window.MobileScreen = MobileScreen;
