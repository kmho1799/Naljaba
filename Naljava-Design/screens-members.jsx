/* global React, useStore, useToast, navigate, MEMBER_COLORS, AppShell, Avatar, ColorPicker */
const { useState: useS3, useEffect: useE3 } = React;

/* ============ Members / Settings screen ============ */
function MembersScreen({ roomId }) {
  const { state, setMyColor, setRoomPassword, leaveRoom } = useStore();
  const toast = useToast();
  const room = state.rooms[roomId];
  const meId = state.auth.user.id;
  if (!room) return <AppShell><div style={{padding:40}}>방을 찾을 수 없어요.</div></AppShell>;

  const isOwner = room.ownerId === meId;
  const myMember = room.members.find(m => m.userId === meId);
  const myColorIdx = MEMBER_COLORS.findIndex(c => c.value === myMember?.color);

  const [pw, setPw] = useS3("");
  const [showPwModal, setShowPwModal] = useS3(false);
  const [showLeaveModal, setShowLeaveModal] = useS3(false);

  return (
    <AppShell current="rooms">
      <div style={{borderBottom:"1px solid var(--border)",background:"#fff"}}>
        <div style={{maxWidth:920,margin:"0 auto",padding:"14px 24px",display:"flex",alignItems:"center",gap:12}}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(`#/r/${room.id}`)}><IconArrowLeft size={16}/></button>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:"var(--fg-muted)",fontWeight:500}}>{room.name}</div>
            <h1 style={{fontSize:18,fontWeight:700,letterSpacing:"-0.01em",margin:0}}>방 관리</h1>
          </div>
        </div>
      </div>

      <main style={{maxWidth:920,margin:"0 auto",padding:"32px 24px 80px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        {/* Members */}
        <section className="card" style={{padding:24,gridColumn:"span 2"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <div>
              <h2 className="h2" style={{margin:0,fontSize:16}}>멤버 ({room.members.length})</h2>
              <p className="text-sm text-muted" style={{margin:"4px 0 0"}}>이 방에 참여 중인 활성 멤버예요.</p>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {room.members.map(mem => {
              const u = state.users[mem.userId];
              const isMe = mem.userId === meId;
              return (
                <div key={mem.userId} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,
                       background: isMe ? "var(--brand-50)" : "transparent"}}>
                  <Avatar user={u} size={36} color={mem.color}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                      {u.name}
                      {isMe && <span className="chip" style={{background:"#fff",color:"var(--brand-700)",fontWeight:600,fontSize:11}}>나</span>}
                      {mem.userId === room.ownerId && <span className="chip" style={{background:"#FFF4ED",color:"#B8531A",fontWeight:600,fontSize:11}}>방장</span>}
                    </div>
                    <div className="text-xs text-muted" style={{marginTop:2}}>{u.email}</div>
                  </div>
                  <span className="dot" style={{background:mem.color, width:14, height:14, border:"2px solid #fff", boxShadow:"0 0 0 1px var(--border)"}}/>
                </div>
              );
            })}
          </div>
        </section>

        {/* My color */}
        <section className="card" style={{padding:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:32,height:32,borderRadius:9,background:"var(--brand-50)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--brand)"}}>
              <IconPalette size={16}/>
            </div>
            <h2 className="h2" style={{margin:0,fontSize:15}}>내 색상</h2>
          </div>
          <p className="text-sm text-muted" style={{marginTop:0,marginBottom:14}}>
            방 안에서 내 일정에 표시될 색상이에요. 언제든 변경할 수 있어요.
          </p>
          <ColorPicker value={myColorIdx >= 0 ? myColorIdx : 0} size={32}
            onChange={(idx) => { setMyColor(roomId, MEMBER_COLORS[idx].value); toast("색상을 변경했어요", {icon:"check"}); }}/>
        </section>

        {/* Password */}
        <section className="card" style={{padding:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:32,height:32,borderRadius:9,background:"var(--brand-50)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--brand)"}}>
              <IconKey size={16}/>
            </div>
            <h2 className="h2" style={{margin:0,fontSize:15}}>방 비밀번호</h2>
          </div>
          <p className="text-sm text-muted" style={{marginTop:0,marginBottom:14}}>
            {isOwner ? "방장만 변경할 수 있어요. 변경 후 새로 입장하는 멤버는 새 비밀번호를 사용해야 해요." : "방장만 변경할 수 있어요."}
          </p>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"var(--surface-2)",fontFamily:"ui-monospace, monospace",fontSize:13,letterSpacing:"0.05em",marginBottom:12}}>
            <IconLock size={13} style={{color:"var(--fg-muted)"}}/>
            <span>{room.password.replace(/./g, "•")}</span>
          </div>
          {isOwner && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowPwModal(true)}>비밀번호 변경</button>
          )}
        </section>

        {/* Leave / owner restriction */}
        <section className="card" style={{padding:24,gridColumn:"span 2",borderColor: isOwner ? "var(--border)" : "#F4D6D2",background: isOwner ? "var(--surface)" : "#FFFCFB"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:20}}>
            <div>
              <h2 className="h2" style={{margin:"0 0 4px",fontSize:15,color: isOwner ? "var(--fg-muted)" : "#A03020"}}>
                {isOwner ? "방장은 퇴장할 수 없어요" : "방 나가기"}
              </h2>
              <p className="text-sm text-muted" style={{margin:0}}>
                {isOwner
                  ? "현재 버전에서는 방장 위임과 방 삭제를 지원하지 않아요. 곧 추가될 예정이에요."
                  : "방을 나가면 내가 작성한 일정은 다른 멤버에게 보이지 않아요. 다시 입장하면 일정이 복구돼요."}
              </p>
            </div>
            <button className="btn btn-danger" disabled={isOwner}
              style={{opacity: isOwner ? 0.4 : 1}}
              onClick={() => setShowLeaveModal(true)}>
              <IconLogout size={14}/> 방 나가기
            </button>
          </div>
        </section>
      </main>

      {showPwModal && (
        <PasswordModal current={room.password}
          onClose={() => setShowPwModal(false)}
          onSave={(np) => { setRoomPassword(roomId, np); setShowPwModal(false); toast("비밀번호를 변경했어요", {icon:"check"}); }}/>
      )}
      {showLeaveModal && (
        <ConfirmModal title="방을 나갈까요?"
          message={`'${room.name}' 방에서 나가면 이 방의 캘린더에 더 이상 접근할 수 없어요. 작성한 일정은 다른 멤버에게서 숨겨지지만, 다시 입장하면 복구돼요.`}
          confirmLabel="방 나가기"
          confirmVariant="danger"
          onClose={() => setShowLeaveModal(false)}
          onConfirm={() => { leaveRoom(roomId); toast("방에서 나갔어요"); navigate("#/rooms"); }}/>
      )}
    </AppShell>
  );
}

function PasswordModal({ current, onClose, onSave }) {
  const [pw, setPw] = useS3("");
  const [confirm, setConfirm] = useS3("");
  const valid = pw.length >= 4 && pw === confirm;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{width:420}}>
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h3 className="h2" style={{margin:0,fontSize:17}}>비밀번호 변경</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><IconX size={16}/></button>
        </div>
        <div style={{padding:24,display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label className="label">새 비밀번호</label>
            <input className="input" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="4자 이상" autoFocus/>
          </div>
          <div>
            <label className="label">확인</label>
            <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="다시 입력"/>
            {confirm && pw !== confirm && <p style={{color:"#C0392B",fontSize:12,marginTop:6}}>비밀번호가 일치하지 않아요</p>}
          </div>
        </div>
        <div style={{padding:"14px 20px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8}}>
          <button className="btn btn-secondary" onClick={onClose}>취소</button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onSave(pw)}
            style={{opacity: valid ? 1 : 0.5}}>변경하기</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, confirmVariant, onClose, onConfirm }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{width:400}}>
        <div style={{padding:"24px 24px 8px"}}>
          <h3 className="h2" style={{margin:"0 0 8px",fontSize:17}}>{title}</h3>
          <p className="text-sm text-muted" style={{margin:0,lineHeight:1.5}}>{message}</p>
        </div>
        <div style={{padding:"20px 20px 20px",display:"flex",justifyContent:"flex-end",gap:8}}>
          <button className="btn btn-secondary" onClick={onClose}>취소</button>
          <button className={`btn ${confirmVariant === "danger" ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

window.MembersScreen = MembersScreen;
