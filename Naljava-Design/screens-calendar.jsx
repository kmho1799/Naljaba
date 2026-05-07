/* global React, useStore, useToast, navigate, MEMBER_COLORS, fmtKorean, fmtShort, parseKey, dateKey, buildMonthGrid, AppShell, Avatar, ColorPicker */
const { useState: useS2, useEffect: useE2, useMemo: useM2, useRef: useR2 } = React;

/* ============ Calendar (main) ============ */
function CalendarScreen({ roomId }) {
  const { state, addEvent, updateEvent, deleteEvent } = useStore();
  const toast = useToast();
  const room = state.rooms[roomId];
  const meId = state.auth.user.id;
  const me = room?.members.find(m => m.userId === meId);

  // current displayed month
  const [year, setYear] = useS2(2026);
  const [month, setMonth] = useS2(4); // May (0-indexed)
  const [selected, setSelected] = useS2("2026-05-08");
  const [composer, setComposer] = useS2(null); // {date, eventId?}
  const [filterMembers, setFilterMembers] = useS2(null); // null = all, else Set of userIds
  const [showInvite, setShowInvite] = useS2(false);

  if (!room) {
    return <AppShell><div style={{padding:40}}>방을 찾을 수 없어요. <a href="#/rooms">내 방으로</a></div></AppShell>;
  }
  const isOwner = room.ownerId === meId;

  const colorByUser = useM2(() => {
    const m = {};
    room.members.forEach(mem => { m[mem.userId] = mem.color; });
    return m;
  }, [room.members]);

  const monthEvents = useM2(() => {
    const map = {};
    const filtered = filterMembers ? room.events.filter(e => filterMembers.has(e.authorId)) : room.events;
    filtered.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [room.events, filterMembers]);

  const grid = useM2(() => buildMonthGrid(year, month), [year, month]);
  const monthName = `${year}년 ${month + 1}월`;
  const todayKey = state.todayKey;

  const goPrev = () => { if (month === 0) { setYear(y=>y-1); setMonth(11); } else setMonth(m => m-1); };
  const goNext = () => { if (month === 11) { setYear(y=>y+1); setMonth(0); } else setMonth(m => m+1); };
  const goToday = () => { setYear(2026); setMonth(4); setSelected(todayKey); };

  const selectedEvents = monthEvents[selected] || [];

  return (
    <AppShell current="rooms">
      <RoomBar room={room} meId={meId} onInvite={() => setShowInvite(true)}/>
      <main style={{maxWidth:1280,margin:"0 auto",padding:"20px 24px 60px",display:"grid",
                    gridTemplateColumns:"minmax(0, 1fr) 360px",gap:20}}>
        {/* Calendar grid */}
        <section className="card" style={{overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",
                       borderBottom:"1px solid var(--border)"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <h2 className="h2" style={{margin:0}}>{monthName}</h2>
              <div style={{display:"flex",gap:2}}>
                <button className="btn btn-ghost btn-icon" onClick={goPrev}><IconChevronLeft size={16}/></button>
                <button className="btn btn-ghost btn-icon" onClick={goNext}><IconChevronRight size={16}/></button>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={goToday}>오늘</button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <MemberFilter room={room} users={state.users} filterMembers={filterMembers} setFilterMembers={setFilterMembers}/>
              <button className="btn btn-primary btn-sm" onClick={() => setComposer({ date: selected })}>
                <IconPlus size={14}/> 일정 추가
              </button>
            </div>
          </div>
          <CalendarGrid
            grid={grid} year={year} month={month}
            events={monthEvents} colorByUser={colorByUser}
            selected={selected} onSelect={setSelected}
            todayKey={todayKey}
            onCreate={(date) => setComposer({ date })}
            onOpenEvent={(ev) => setComposer({ date: ev.date, eventId: ev.id })}
          />
        </section>

        {/* Side panel — selected day */}
        <DayPanel
          dateKey={selected}
          events={selectedEvents}
          users={state.users}
          colorByUser={colorByUser}
          meId={meId}
          isOwner={isOwner}
          onCreate={() => setComposer({ date: selected })}
          onEdit={(ev) => setComposer({ date: ev.date, eventId: ev.id })}
          onDelete={(ev) => {
            if (confirm(`"${ev.title}" 일정을 삭제할까요?`)) {
              deleteEvent(roomId, ev.id);
              toast("일정을 삭제했어요");
            }
          }}
          room={room}
        />
      </main>

      {composer && (
        <EventComposer
          room={room}
          users={state.users}
          colorByUser={colorByUser}
          meId={meId}
          isOwner={isOwner}
          dateKey={composer.date}
          eventId={composer.eventId}
          onClose={() => setComposer(null)}
          onSave={(data) => {
            if (composer.eventId) {
              updateEvent(roomId, composer.eventId, data);
              toast("일정을 수정했어요", { icon: "check" });
            } else {
              addEvent(roomId, data);
              toast("일정을 추가했어요", { icon: "check" });
            }
            setComposer(null);
          }}
          onDelete={() => {
            if (composer.eventId && confirm("일정을 삭제할까요?")) {
              deleteEvent(roomId, composer.eventId);
              toast("일정을 삭제했어요");
              setComposer(null);
            }
          }}
        />
      )}

      {showInvite && <InviteModal room={room} onClose={() => setShowInvite(false)}/>}
    </AppShell>
  );
}

/* --------- Sub-bar with room name, member chips, member-area link --------- */
function RoomBar({ room, meId, onInvite }) {
  const { state } = useStore();
  return (
    <div style={{borderBottom:"1px solid var(--border)",background:"#fff"}}>
      <div style={{maxWidth:1280,margin:"0 auto",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:14,minWidth:0}}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate("#/rooms")} title="내 방으로">
            <IconArrowLeft size={16}/>
          </button>
          <div style={{minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <h1 style={{fontSize:18,fontWeight:700,letterSpacing:"-0.01em",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{room.name}</h1>
              {room.ownerId === meId && <span className="chip" style={{background:"var(--brand-50)",color:"var(--brand-700)",fontWeight:600}}>방장</span>}
            </div>
            <div className="text-xs text-muted" style={{marginTop:2,display:"flex",alignItems:"center",gap:6}}>
              <IconUsers size={12}/> 멤버 {room.members.length}명
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="avatar-stack">
            {room.members.map(m => (
              <Avatar key={m.userId} user={state.users[m.userId]} size={30} color={m.color}/>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onInvite}>
            <IconLink size={14}/> 초대
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`#/r/${room.id}/members`)}>
            <IconSettings size={14}/> 방 관리
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------- Member filter ----------- */
function MemberFilter({ room, users, filterMembers, setFilterMembers }) {
  const [open, setOpen] = useS2(false);
  const ref = useR2(null);
  useE2(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const allOn = !filterMembers;
  const toggle = (uid) => {
    const set = new Set(filterMembers || room.members.map(m => m.userId));
    if (set.has(uid)) set.delete(uid); else set.add(uid);
    if (set.size === room.members.length) setFilterMembers(null);
    else setFilterMembers(set);
  };
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)}>
        <IconUsers size={14}/> {allOn ? "모든 멤버" : `${filterMembers.size}명`} <IconChevronDown size={12}/>
      </button>
      {open && (
        <div className="card" style={{position:"absolute",top:"calc(100% + 6px)",right:0,width:240,padding:6,zIndex:20,boxShadow:"var(--shadow-lg)"}}>
          <button onClick={() => { setFilterMembers(null); }}
            style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"none",background:allOn?"var(--surface-2)":"transparent",
                    display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",fontSize:13,fontWeight:500}}>
            <span>모든 멤버 보기</span>
            {allOn && <IconCheck size={14} style={{color:"var(--brand)"}}/>}
          </button>
          <div style={{height:1,background:"var(--border)",margin:"4px 0"}}/>
          {room.members.map(mem => {
            const u = users[mem.userId];
            const on = !filterMembers || filterMembers.has(mem.userId);
            return (
              <button key={mem.userId} onClick={() => toggle(mem.userId)}
                style={{width:"100%",padding:"6px 10px",borderRadius:8,border:"none",background:"transparent",
                        display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,opacity:on?1:0.4}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--surface-2)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span className="dot" style={{background:mem.color, width:10, height:10}}/>
                <span style={{flex:1,textAlign:"left"}}>{u.name}</span>
                {on && <IconCheck size={14} style={{color:"var(--brand)"}}/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* --------- Calendar grid ---------- */
function CalendarGrid({ grid, year, month, events, colorByUser, selected, onSelect, todayKey, onCreate, onOpenEvent }) {
  const dayLabels = ["일","월","화","수","목","금","토"];
  return (
    <div style={{display:"flex",flexDirection:"column",flex:1}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",borderBottom:"1px solid var(--border)"}}>
        {dayLabels.map((d, i) => (
          <div key={d} style={{padding:"10px 12px",fontSize:12,fontWeight:600,
                color: i===0 ? "#E26B6B" : i===6 ? "#5B8DEF" : "var(--fg-muted)",
                textAlign:"left",letterSpacing:"-0.005em"}}>{d}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gridAutoRows:"minmax(118px, 1fr)",flex:1}}>
        {grid.map((cell, idx) => {
          const isSel = cell.key === selected;
          const isToday = cell.key === todayKey;
          const dayEvents = events[cell.key] || [];
          const inMonth = cell.inMonth;
          const dayColor = cell.dow === 0 ? "#E26B6B" : cell.dow === 6 ? "#5B8DEF" : "var(--fg)";
          const showEvents = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - 3;
          return (
            <div key={cell.key+"-"+idx} role="button" tabIndex={0}
              onClick={() => onSelect(cell.key)}
              onDoubleClick={() => onCreate(cell.key)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(cell.key); } }}
              style={{position:"relative",borderRight:idx%7===6?"none":"1px solid var(--border)",
                      borderBottom: idx<35 ? "1px solid var(--border)" : "none",
                      background: isSel ? "var(--brand-50)" : "transparent",
                      padding:"8px 8px 8px 8px",cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",gap:4,
                      opacity: inMonth ? 1 : 0.4, transition:"background 0.1s",overflow:"hidden",userSelect:"none"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:22}}>
                <span style={{
                  fontSize:13, fontWeight: isToday ? 700 : 500,
                  color: isToday ? "#fff" : (inMonth ? dayColor : "var(--fg-subtle)"),
                  background: isToday ? "var(--brand)" : "transparent",
                  width: isToday ? 22 : "auto", height: isToday ? 22 : "auto",
                  borderRadius: "50%", display:"inline-flex", alignItems:"center", justifyContent:"center",
                  minWidth: isToday ? 22 : "auto",
                  paddingLeft: isToday ? 0 : 2,
                }}>{cell.day}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {showEvents.map(ev => (
                  <EventPill key={ev.id} event={ev} color={colorByUser[ev.authorId]} onClick={(e)=>{e.stopPropagation(); onOpenEvent(ev);}}/>
                ))}
                {overflow > 0 && <span className="text-xs text-muted" style={{paddingLeft:2,fontWeight:500}}>+ {overflow}개 더</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventPill({ event, color, onClick }) {
  return (
    <button onClick={onClick}
      style={{display:"flex",alignItems:"center",gap:6,padding:"3px 6px",borderRadius:6,
              border:"none",background:"transparent",cursor:"pointer",textAlign:"left",
              fontSize:12,fontWeight:500,color:"var(--fg)",transition:"background 0.1s"}}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.04)"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <span className="dot" style={{background:color, width:7, height:7, flexShrink:0}}/>
      <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{event.title}</span>
    </button>
  );
}

/* --------- Day side panel ---------- */
function DayPanel({ dateKey: dk, events, users, colorByUser, meId, isOwner, onCreate, onEdit, onDelete, room }) {
  const dt = parseKey(dk);
  const dayName = ["일","월","화","수","목","금","토"][dt.getDay()];
  const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;

  // members with no event on this day = "free"
  const busyIds = new Set(events.map(e => e.authorId));
  const freeMembers = room.members.filter(m => !busyIds.has(m.userId));

  return (
    <aside className="card" style={{padding:0,position:"sticky",top:80,alignSelf:"flex-start",height:"calc(100vh - 100px)",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"20px 20px 16px",borderBottom:"1px solid var(--border)"}}>
        <div className="text-xs" style={{color: dt.getDay()===0 ? "#E26B6B" : dt.getDay()===6 ? "#5B8DEF" : "var(--fg-muted)",fontWeight:600,marginBottom:4}}>
          {dt.getMonth()+1}월 · {dayName}요일
        </div>
        <h2 className="h1" style={{fontSize:32,margin:0,letterSpacing:"-0.02em"}}>{dt.getDate()}<span style={{fontSize:18,fontWeight:500,color:"var(--fg-muted)",marginLeft:4}}>일</span></h2>
        <p className="text-sm text-muted" style={{margin:"8px 0 0"}}>{events.length}개 일정</p>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"12px 12px"}}>
        {events.length === 0 ? (
          <div style={{padding:"32px 16px",textAlign:"center"}}>
            <div style={{width:48,height:48,borderRadius:14,background:"var(--surface-2)",
                  display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:12,color:"var(--fg-subtle)"}}>
              <IconCalendar size={20}/>
            </div>
            <p className="text-sm text-muted" style={{margin:"0 0 14px"}}>이 날짜의 일정이 없어요</p>
            <button className="btn btn-secondary btn-sm" onClick={onCreate}>
              <IconPlus size={14}/> 일정 추가
            </button>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {events.map(ev => (
              <EventCard key={ev.id} event={ev} author={users[ev.authorId]} color={colorByUser[ev.authorId]}
                canEdit={ev.authorId === meId || isOwner} canDelete={ev.authorId === meId || isOwner}
                onEdit={() => onEdit(ev)} onDelete={() => onDelete(ev)}/>
            ))}
          </div>
        )}

        {freeMembers.length > 0 && events.length > 0 && (
          <div style={{marginTop:20,padding:"14px 12px",borderRadius:12,background:"var(--brand-50)"}}>
            <div className="text-xs" style={{fontWeight:600,color:"var(--brand-700)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <IconCheck size={12}/> 일정 없는 멤버 {freeMembers.length}명
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              {freeMembers.map(m => (
                <div key={m.userId} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 8px 4px 4px",borderRadius:999,background:"#fff"}}>
                  <Avatar user={users[m.userId]} size={20} color={m.color}/>
                  <span className="text-xs" style={{fontWeight:500}}>{users[m.userId].name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{padding:14,borderTop:"1px solid var(--border)"}}>
        <button className="btn btn-primary" style={{width:"100%"}} onClick={onCreate}>
          <IconPlus size={14}/> {fmtShort(dk)}에 일정 추가
        </button>
      </div>
    </aside>
  );
}

function EventCard({ event, author, color, canEdit, canDelete, onEdit, onDelete }) {
  const [hover, setHover] = useS2(false);
  return (
    <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 10px",borderRadius:10,
              background: hover ? "var(--surface-2)" : "transparent", transition:"background 0.1s",position:"relative"}}>
      <span className="dot" style={{background:color, width:10, height:10, marginTop:6, flexShrink:0}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:600,letterSpacing:"-0.005em"}}>{event.title}</div>
        {event.description && <div className="text-sm text-muted" style={{marginTop:2,lineHeight:1.4}}>{event.description}</div>}
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:6}}>
          <Avatar user={author} size={16} color={color}/>
          <span className="text-xs text-muted">{author?.name}</span>
        </div>
      </div>
      {hover && (canEdit || canDelete) && (
        <div style={{display:"flex",gap:2}}>
          {canEdit && <button className="btn btn-ghost btn-icon" style={{width:28,height:28}} onClick={onEdit} title="수정"><IconEdit size={14}/></button>}
          {canDelete && <button className="btn btn-ghost btn-icon" style={{width:28,height:28,color:"#C0392B"}} onClick={onDelete} title="삭제"><IconTrash size={14}/></button>}
        </div>
      )}
    </div>
  );
}

/* --------- Event composer (modal) ---------- */
function EventComposer({ room, users, colorByUser, meId, isOwner, dateKey: dk, eventId, onClose, onSave, onDelete }) {
  const existing = eventId ? room.events.find(e => e.id === eventId) : null;
  const [title, setTitle] = useS2(existing?.title || "");
  const [desc, setDesc] = useS2(existing?.description || "");
  const [date, setDate] = useS2(existing?.date || dk);
  const isMine = !existing || existing.authorId === meId;
  const canEdit = isMine || isOwner;
  const valid = title.trim().length > 0;

  // close on Esc
  useE2(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h3 className="h2" style={{margin:0,fontSize:17}}>{existing ? "일정 수정" : "일정 추가"}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><IconX size={16}/></button>
        </div>
        <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label className="label">날짜</label>
            <DatePicker value={date} onChange={setDate} disabled={!canEdit}/>
          </div>
          <div>
            <label className="label">제목</label>
            <input className="input" placeholder="일정 제목" value={title}
              onChange={e => setTitle(e.target.value)} disabled={!canEdit} autoFocus={!existing} maxLength={50}/>
          </div>
          <div>
            <label className="label">설명 <span className="text-subtle text-xs" style={{fontWeight:400,marginLeft:6}}>선택</span></label>
            <textarea className="input textarea" placeholder="일정에 대한 짧은 설명"
              value={desc} onChange={e => setDesc(e.target.value)} disabled={!canEdit} maxLength={200}/>
          </div>
          {existing && (
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:"var(--surface-2)",borderRadius:10}}>
              <Avatar user={users[existing.authorId]} size={22} color={colorByUser[existing.authorId]}/>
              <span className="text-sm">
                <strong>{users[existing.authorId]?.name}</strong>님이 작성
                {!isMine && isOwner && <span className="text-muted" style={{marginLeft:6}}>· 방장 권한으로 편집 중</span>}
              </span>
            </div>
          )}
          {!canEdit && <p className="text-sm text-muted">작성자만 수정/삭제할 수 있어요.</p>}
        </div>
        <div style={{padding:"14px 20px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",gap:8}}>
          <div>
            {existing && canEdit && (
              <button className="btn btn-danger btn-sm" onClick={onDelete}><IconTrash size={14}/> 삭제</button>
            )}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-secondary" onClick={onClose}>취소</button>
            <button className="btn btn-primary" disabled={!valid || !canEdit}
              onClick={() => onSave({ title: title.trim(), description: desc.trim(), date })}
              style={{opacity: (valid && canEdit) ? 1 : 0.5}}>
              {existing ? "저장" : "추가"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DatePicker({ value, onChange, disabled }) {
  // Simple inline date pill — clicking shows a mini month picker
  const [open, setOpen] = useS2(false);
  const ref = useR2(null);
  useE2(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const dt = parseKey(value);
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={() => !disabled && setOpen(o => !o)} disabled={disabled}
        className="input"
        style={{textAlign:"left",cursor: disabled ? "default" : "pointer", display:"flex",alignItems:"center",gap:8}}>
        <IconCalendar size={14} style={{color:"var(--fg-muted)"}}/>
        {fmtKorean(value)}
      </button>
      {open && <MiniMonth value={value} onChange={(v) => { onChange(v); setOpen(false); }}/>}
    </div>
  );
}
function MiniMonth({ value, onChange }) {
  const dt = parseKey(value);
  const [year, setYear] = useS2(dt.getFullYear());
  const [month, setMonth] = useS2(dt.getMonth());
  const grid = useM2(() => buildMonthGrid(year, month), [year, month]);
  return (
    <div className="card" style={{position:"absolute",top:"calc(100% + 6px)",left:0,padding:14,zIndex:30,boxShadow:"var(--shadow-lg)",width:300}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button className="btn btn-ghost btn-icon" style={{width:28,height:28}}
          onClick={() => { if(month===0){setYear(y=>y-1);setMonth(11);} else setMonth(m=>m-1); }}>
          <IconChevronLeft size={14}/>
        </button>
        <span className="text-sm" style={{fontWeight:600}}>{year}년 {month+1}월</span>
        <button className="btn btn-ghost btn-icon" style={{width:28,height:28}}
          onClick={() => { if(month===11){setYear(y=>y+1);setMonth(0);} else setMonth(m=>m+1); }}>
          <IconChevronRight size={14}/>
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {["일","월","화","수","목","금","토"].map((d, i) => (
          <div key={d} className="text-xs" style={{textAlign:"center",fontWeight:600,
                color: i===0?"#E26B6B":i===6?"#5B8DEF":"var(--fg-muted)",padding:"4px 0"}}>{d}</div>
        ))}
        {grid.map(c => {
          const sel = c.key === value;
          return (
            <button key={c.key} onClick={() => onChange(c.key)}
              style={{width:"100%",height:32,border:"none",borderRadius:8,
                      background: sel ? "var(--brand)" : "transparent",
                      color: sel ? "#fff" : (c.inMonth ? "var(--fg)" : "var(--fg-subtle)"),
                      fontSize:13,fontWeight:sel?600:500,cursor:"pointer",transition:"background 0.1s"}}
              onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background="var(--surface-2)"; }}
              onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background="transparent"; }}>
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------- Invite modal ---------- */
function InviteModal({ room, onClose }) {
  const toast = useToast();
  const link = "https://" + room.inviteCode;
  const copy = (text) => {
    try { navigator.clipboard?.writeText(text); } catch {}
    toast("복사했어요", { icon: "check" });
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{width:440}}>
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h3 className="h2" style={{margin:0,fontSize:17}}>방으로 초대하기</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><IconX size={16}/></button>
        </div>
        <div style={{padding:24}}>
          <p className="text-sm text-muted" style={{marginTop:0,marginBottom:18}}>
            아래 링크와 비밀번호를 함께 공유해주세요. 받은 사람은 Google 로그인 후 방에 입장할 수 있어요.
          </p>
          <label className="label">초대 링크</label>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <input className="input" readOnly value={link} style={{fontFamily:"ui-monospace, monospace",fontSize:13}}/>
            <button className="btn btn-secondary" onClick={() => copy(link)}><IconCopy size={14}/></button>
          </div>
          <label className="label">방 비밀번호</label>
          <div style={{display:"flex",gap:8}}>
            <input className="input" readOnly value={room.password} style={{fontFamily:"ui-monospace, monospace",fontSize:13,letterSpacing:"0.05em"}}/>
            <button className="btn btn-secondary" onClick={() => copy(room.password)}><IconCopy size={14}/></button>
          </div>
          <button className="btn btn-primary btn-lg" style={{width:"100%",marginTop:24}}
            onClick={() => copy(`${link}\n비밀번호: ${room.password}`)}>
            <IconCopy size={14}/> 링크와 비밀번호 함께 복사
          </button>
        </div>
      </div>
    </div>
  );
}

window.CalendarScreen = CalendarScreen;
window.InviteModal = InviteModal;
