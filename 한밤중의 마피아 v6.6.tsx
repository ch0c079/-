import { useState, useEffect, useRef } from "react";

const TEAM_C = new Set(['경찰','영매','탐정','말썽쟁이','바보','시민']);
const TEAM_M = new Set(['마피아']);
const TEAM_N = new Set(['광인','스토커','주술사']);
const ROLE_POOL = ['경찰','영매','탐정','바보','말썽쟁이','광인','스토커','주술사','시민'];
const DISC_MIN = 5;

const shu = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=~~(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };
const rnd = a => a[~~(Math.random()*a.length)];
const teamOf = r => TEAM_M.has(r)?'m':TEAM_C.has(r)?'c':TEAM_N.has(r)?'n':'?';
const rclr = r => ({m:'#ff5566',c:'#3de888',n:'#5599ff'})[teamOf(r)]||'#ccc';

const G = {
  bg:'#070715', panel:'#0e0e20', border:'#1e1e38',
  txt:'#c8c8e0', dim:'#50508a',
  red:'#ff5566', grn:'#3de888', blu:'#5599ff', pur:'#b08eff',
  yel:'#ffcc44',
};

function RTag({role,big,xl}){
  const c=rclr(role);
  const fs=xl?'1.5rem':big?'1.15rem':'0.9rem';
  const pd=xl?'5px 14px':big?'3px 10px':'2px 7px';
  return <span style={{color:c,fontWeight:700,fontSize:fs,background:`${c}18`,
    border:`1px solid ${c}50`,borderRadius:5,padding:pd,
    textShadow:`0 0 8px ${c}70`,display:'inline-block'}}>{role}</span>;
}

function Btn({children,color=G.pur,onClick,disabled,sm,full=true,style:xs={}}){
  const [h,sh]=useState(false);
  return <button onClick={onClick} disabled={disabled}
    onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)}
    style={{padding:sm?'8px 14px':'13px 18px',
      background:disabled?'#111122':h?`${color}35`:`${color}15`,
      border:`2px solid ${disabled?'#252540':color}`,borderRadius:9,
      color:disabled?'#404060':color,fontSize:sm?'0.85rem':'0.95rem',fontWeight:700,
      cursor:disabled?'not-allowed':'pointer',width:full?'100%':'auto',
      transition:'all 0.15s',...xs}}>
    {children}
  </button>;
}

function Panel({children,style:xs={}}){
  return <div style={{background:G.panel,border:`1px solid ${G.border}`,
    borderRadius:12,padding:16,...xs}}>{children}</div>;
}

function Sc({children,center,style:xs={}}){
  return <div style={{width:'100%',maxWidth:460,margin:'0 auto',
    padding:'16px 14px',minHeight:'100vh',display:'flex',flexDirection:'column',
    gap:12,...(center?{justifyContent:'center',alignItems:'center'}:{}),...xs}}>
    {children}
  </div>;
}

function Title({text,sub,color=G.red}){
  return <div style={{textAlign:'center',marginBottom:4}}>
    {sub&&<div style={{fontSize:'0.78rem',color:G.dim,letterSpacing:3,marginBottom:6}}>{sub}</div>}
    <div style={{fontSize:'1.5rem',fontWeight:900,color,textShadow:`0 0 24px ${color}50`,letterSpacing:2}}>{text}</div>
  </div>;
}

function Hr(){return <div style={{borderTop:`1px solid ${G.border}`,margin:'4px 0'}}/> }

function Badge({text,color=G.pur}){
  return <span style={{background:`${color}20`,border:`1px solid ${color}55`,
    borderRadius:4,padding:'2px 8px',color,fontSize:'0.82rem',fontWeight:600}}>{text}</span>;
}

const WRAP = {
  minHeight:'100vh',
  background:'linear-gradient(160deg,#060614 0%,#0a0a1c 60%,#080818 100%)',
  color:G.txt,fontFamily:"'Segoe UI','Malgun Gothic',sans-serif",
  display:'flex',justifyContent:'center',
};

export default function MafiaGame(){
  const [phase,setPhase]=useState('MENU');
  const [np,setNp]=useState(4);
  const [nc,setNc]=useState(3);
  const [names,setNames]=useState([]);
  const [nameIn,setNameIn]=useState('');
  const [deck,setDeck]=useState([]);
  const [gCards,setGCards]=useState({});
  const [iCards,setICards]=useState({});
  const [foolD,setFoolD]=useState({});
  const [stalkT,setStalkT]=useState(null);
  const [swapPair,setSwapPair]=useState(null);
  const [ni,setNi]=useState(0);
  const [nSub,setNSub]=useState('PASS');
  const [aStep,setAStep]=useState('SEL');
  const [aSel,setASel]=useState(null);
  const [aInfo,setAInfo]=useState(null);
  const [memo,setMemo]=useState('');
  const [shamanName,setShamanName]=useState('');
  const [shamanGs,setShamanGs]=useState({});
  const [shamanGi,setShamanGi]=useState(0);
  const [shamanOk,setShamanOk]=useState(false);
  const [voted,setVoted]=useState(null);
  const [tsec,setTsec]=useState(DISC_MIN*60);
  const [tOn,setTOn]=useState(false);
  const tRef=useRef();
  const nameRef=useRef();

  useEffect(()=>{
    if(tOn&&tsec>0) tRef.current=setTimeout(()=>setTsec(s=>s-1),1000);
    else if(tsec<=0) setTOn(false);
    return()=>clearTimeout(tRef.current);
  },[tOn,tsec]);

  const total=np+nc;
  const centers=Array.from({length:nc},(_,i)=>`바닥${i+1}`);
  const curP=names[ni]||'';
  const curActual=iCards[curP];
  const curDisp=foolD[curP]||curActual;

  function reset(){
    setPhase('MENU');setNp(4);setNc(3);setNames([]);setNameIn('');setDeck([]);
    setGCards({});setICards({});setFoolD({});setStalkT(null);setSwapPair(null);
    setNi(0);setNSub('PASS');setAStep('SEL');setASel(null);setAInfo(null);setMemo('');
    setShamanName('');setShamanGs({});setShamanGi(0);setShamanOk(false);setVoted(null);
    setTsec(DISC_MIN*60);setTOn(false);
  }

  function addName(){
    const n=nameIn.trim();
    if(!n||names.includes(n)||n.startsWith('바닥')) return;
    const nn=[...names,n];
    setNames(nn);setNameIn('');
    if(nn.length===np){setDeck(['마피아']);setPhase('DECK');}
  }

  function addRole(r){
    if(deck.length>=total) return;
    if(r!=='시민'&&deck.includes(r)) return;
    setDeck([...deck,r]);
  }
  function removeRole(){if(deck.length>1)setDeck(deck.slice(0,-1));}

  function startNight(){
    const sh=shu(deck);
    const c={};
    names.forEach((p,i)=>c[p]=sh[i]);
    centers.forEach((k,i)=>c[k]=sh[np+i]);
    const pool=deck.filter(r=>TEAM_C.has(r)&&r!=='바보');
    const fp=pool.length?pool:['시민'];
    const fd={};
    names.forEach(p=>{if(c[p]==='바보')fd[p]=rnd(fp);});
    setGCards({...c});setICards({...c});setFoolD(fd);
    setStalkT(null);setSwapPair(null);
    setNi(0);setNSub('PASS');setAStep('SEL');setASel(null);setAInfo(null);
    setPhase('NIGHT');
  }

  function resolveAbil(){
    const isFool=curActual==='바보';
    let info=null;
    if(curDisp==='마피아'){
      let r=iCards[aSel];
      if(r==='바보'){const cp=deck.filter(x=>TEAM_C.has(x)&&x!=='바보');r=rnd(cp.length?cp:['시민']);}
      info={t:'reveal',label:`${aSel}의 카드`,role:r};
    } else if(curDisp==='경찰'){
      let real=iCards[aSel];
      if(!isFool&&(real==='바보'||real==='경찰')){
        const v=deck.filter(r=>['영매','탐정','말썽쟁이','시민'].includes(r));
        real=rnd(v.length?v:['시민']);
      } else if(isFool){
        const all=[...new Set(deck)].filter(r=>r!==iCards[aSel]);
        real=rnd(all.length?all:['시민']);
      }
      const wp=[...new Set(deck)].filter(r=>r!==real&&r!=='바보'&&r!=='경찰');
      const fake=rnd(wp.length?wp:['마피아','영매','탐정','시민'].filter(r=>r!==real));
      info={t:'hints',label:`${aSel}님의 직업`,hints:shu([real,fake])};
    } else if(curDisp==='영매'){
      let real=iCards[aSel];
      if(!isFool&&(real==='바보'||real==='영매')){
        const v=deck.filter(r=>['경찰','탐정','말썽쟁이','시민'].includes(r));
        real=rnd(v.length?v:['시민']);
      }
      const wp=[...new Set(deck)].filter(r=>r!==real&&r!=='바보'&&r!=='영매');
      const fake=rnd(wp.length?wp:['경찰','탐정','시민','마피아'].filter(r=>r!==real));
      info={t:'hints',label:`${aSel}의 카드`,hints:shu([real,fake])};
    } else if(curDisp==='탐정'){
      if(isFool) info={t:'loc',role:aSel,loc:rnd(['바닥','플레이어 중 한 명'])};
      else {
        const onF=centers.some(c=>iCards[c]===aSel);
        info={t:'loc',role:aSel,loc:onF?'바닥':'플레이어 중 한 명'};
      }
    } else if(curDisp==='말썽쟁이'){
      if(!isFool){
        const possible=names.filter(p=>p!==aSel).concat(centers);
        const swp=rnd(possible);
        setSwapPair([aSel,swp]);
        info={t:'swap',t1:aSel,t2:swp};
      } else {
        const f1=rnd(names);
        const possible=names.filter(p=>p!==f1).concat(centers);
        info={t:'swap',t1:f1,t2:rnd(possible),fake:true};
      }
    } else if(curDisp==='스토커'){
      if(!isFool) setStalkT(aSel);
      info={t:'stalk',target:aSel};
    } else {
      info={t:'memo'};
    }
    setAInfo(info);setAStep('RES');
  }

  function goNextNight(){
    const next=ni+1;
    if(next>=names.length){
      if(swapPair){
        const[p1,p2]=swapPair;
        setGCards(prev=>{const n={...prev};[n[p1],n[p2]]=[n[p2],n[p1]];return n;});
      }
      setTsec(DISC_MIN*60);setTOn(false);
      setShamanName('');setShamanGs({});setShamanGi(0);setShamanOk(false);
      setPhase('DAY');
    } else {
      setNi(next);setNSub('PASS');setAStep('SEL');setASel(null);setAInfo(null);setMemo('');
    }
  }

  function doShamanGuess(role){
    const p=names[shamanGi];
    const ng={...shamanGs,[p]:role};
    setShamanGs(ng);
    if(shamanGi+1>=names.length){
      const ok=names.every(x=>ng[x]===gCards[x]);
      setShamanOk(ok);
      setPhase(ok?'SHAMAN_WIN':'VOTE');
    } else {
      setShamanGi(shamanGi+1);
    }
  }

  function calcWin(){
    const madman=voted!=='none'&&gCards[voted]==='광인';
    const sHolder=names.find(p=>gCards[p]==='스토커');
    const stalker=!!sHolder&&!!stalkT&&voted===stalkT;
    const mHolder=Object.entries(gCards).find(([_,v])=>v==='마피아');
    const mInPlay=mHolder&&names.includes(mHolder[0]);
    let cWin=false,mWin=false,cLose=false;
    if(voted==='none'){if(mInPlay)mWin=true;else cWin=true;}
    else{if(gCards[voted]==='마피아')cWin=true;else if(!mInPlay)cLose=true;else mWin=true;}
    return{madman,stalker,cWin,mWin,cLose};
  }

  const tmStr=`${String(~~(tsec/60)).padStart(2,'0')}:${String(tsec%60).padStart(2,'0')}`;
  const deckRoles=[...new Set(deck)];
  const needsSel=['마피아','경찰','영매','탐정','말썽쟁이','스토커'].includes(curDisp);
  const getTargets=()=>{
    if(curDisp==='마피아'||curDisp==='영매') return centers;
    if(curDisp==='경찰') return names.filter(p=>p!==curP);
    if(curDisp==='탐정') return [...new Set(deck)].filter(r=>!['마피아','탐정','바보'].includes(r));
    if(curDisp==='말썽쟁이') return names;
    if(curDisp==='스토커') return names.filter(p=>p!==curP);
    return[];
  };

  /* ===== MENU ===== */
  if(phase==='MENU') return (
    <div style={WRAP}>
      <Sc center>
        <div style={{textAlign:'center',marginBottom:8}}>
          <div style={{fontSize:'0.75rem',color:G.dim,letterSpacing:5,marginBottom:10}}>공동 전선전</div>
          <div style={{fontSize:'2.4rem',fontWeight:900,color:G.red,
            textShadow:'0 0 40px #ff556645',letterSpacing:4,lineHeight:1.15}}>한밤중의<br/>마피아</div>
          <div style={{color:G.dim,fontSize:'0.78rem',marginTop:8}}>v6.6</div>
        </div>
        <Panel style={{textAlign:'center',marginBottom:4}}>
          <div style={{color:'#8080b0',fontSize:'0.88rem',lineHeight:1.9}}>
            탈락자 없이 즐기는 초스피드 심리전 🌙<br/>
            <span style={{color:G.dim,fontSize:'0.8rem'}}>밤사이 카드가 몰래 바뀔 수 있습니다...</span>
          </div>
        </Panel>
        <Btn color='#7070aa' onClick={()=>setPhase('RULES')}>📖 규칙 &amp; 직업 설명</Btn>
        <Btn color={G.red} onClick={()=>setPhase('SETUP')}>🌙 게임 시작</Btn>
      </Sc>
    </div>
  );

  /* ===== RULES ===== */
  if(phase==='RULES') return (
    <div style={WRAP}>
      <Sc>
        <Title text="게임 가이드" color={G.pur} sub="한밤중의 마피아"/>
        <Panel style={{overflowY:'auto',maxHeight:'72vh',fontSize:'0.85rem',lineHeight:1.8,color:'#a0a0c8'}}>
          <b style={{color:G.pur}}>핵심 포인트</b>
          <div style={{marginTop:6,marginBottom:10}}>
            1. 내 직업은 바뀔 수 있음 — 말썽쟁이가 몰래 카드를 교환합니다.<br/>
            2. 남는 카드는 <b style={{color:G.yel}}>바닥</b>에 — 실제 마피아가 없을 수도 있습니다.<br/>
            3. 단 한 번의 투표로 승패 결정 — 탈락자 없이 끝납니다.
          </div>
          <Hr/>
          <b style={{color:G.red}}>마피아 팀</b>
          <div style={{marginTop:4,marginBottom:10}}>
            🎯 목표: 처형당하지 않고 살아남기<br/>
            <RTag role="마피아"/> 바닥 카드 1장을 몰래 확인합니다.
          </div>
          <Hr/>
          <b style={{color:G.grn}}>시민 팀</b>
          <div style={{marginTop:4,marginBottom:10}}>
            🎯 목표: 마피아를 찾아 처형하기 (없으면 아무도 처형 X)<br/>
            <RTag role="경찰"/> 플레이어 1명 조사 → 진짜+가짜 2개 힌트<br/>
            <RTag role="영매"/> 바닥 카드 1장 조사 → 진짜+가짜 2개 힌트<br/>
            <RTag role="탐정"/> 특정 직업이 바닥인지 손에 있는지 위치 파악<br/>
            <RTag role="말썽쟁이"/> 1명 지목 → 무작위 대상과 카드 교환<br/>
            <RTag role="바보"/> 자신이 바보인 줄 모름! 가짜 정보를 봄<br/>
            <RTag role="시민"/> 능력 없음. 연기만 합니다.
          </div>
          <Hr/>
          <b style={{color:G.blu}}>중립 팀</b>
          <div style={{marginTop:4,marginBottom:4}}>
            <RTag role="광인"/> 투표에서 자신이 처형당하면 단독 승리!<br/>
            <RTag role="스토커"/> 지정한 타깃이 처형당하면 공동 승리!<br/>
            <RTag role="주술사"/> 모든 플레이어의 최종 직업을 맞히면 단독 승리!
          </div>
        </Panel>
        <Btn color='#7070aa' onClick={()=>setPhase('MENU')}>← 메인 메뉴</Btn>
      </Sc>
    </div>
  );

  /* ===== SETUP ===== */
  if(phase==='SETUP') return (
    <div style={WRAP}>
      <Sc>
        <Title text="게임 설정" color={G.pur}/>
        <Panel>
          <div style={{color:G.dim,fontSize:'0.85rem',marginBottom:10}}>인원 수</div>
          <div style={{display:'flex',gap:8}}>
            {[3,4,5].map(n=>(
              <button key={n} onClick={()=>setNp(n)} style={{
                flex:1,padding:'14px 0',borderRadius:8,fontWeight:700,fontSize:'1.1rem',
                background:np===n?`${G.pur}35`:'#12122a',
                border:`2px solid ${np===n?G.pur:G.border}`,
                color:np===n?G.pur:G.dim,cursor:'pointer'}}>
                {n}명
              </button>
            ))}
          </div>
        </Panel>
        <Panel>
          <div style={{color:G.dim,fontSize:'0.85rem',marginBottom:10}}>바닥 카드 수</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>setNc(n)} style={{
                flex:1,minWidth:48,padding:'12px 0',borderRadius:8,fontWeight:700,fontSize:'1rem',
                background:nc===n?`${G.yel}30`:'#12122a',
                border:`2px solid ${nc===n?G.yel:G.border}`,
                color:nc===n?G.yel:G.dim,cursor:'pointer'}}>
                {n}장
              </button>
            ))}
          </div>
        </Panel>
        <Panel style={{background:`${G.pur}12`,borderColor:`${G.pur}40`}}>
          <div style={{color:G.dim,fontSize:'0.82rem',textAlign:'center'}}>
            총 카드: <b style={{color:G.pur}}>{total}장</b> &nbsp;|&nbsp; 플레이어: <b style={{color:G.grn}}>{np}명</b> &nbsp;|&nbsp; 바닥: <b style={{color:G.yel}}>{nc}장</b>
          </div>
        </Panel>
        <Btn color={G.grn} onClick={()=>setPhase('NAMES')}>다음 → 플레이어 이름 입력</Btn>
        <Btn color='#7070aa' onClick={()=>setPhase('MENU')}>← 뒤로</Btn>
      </Sc>
    </div>
  );

  /* ===== NAMES ===== */
  if(phase==='NAMES') return (
    <div style={WRAP}>
      <Sc>
        <Title text="플레이어 이름" color={G.grn}/>
        <Panel>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,minHeight:40}}>
            {names.map((n,i)=>(
              <span key={i} style={{background:`${G.grn}18`,border:`1px solid ${G.grn}40`,
                borderRadius:6,padding:'4px 12px',color:G.grn,fontWeight:600,fontSize:'0.9rem'}}>
                {i+1}. {n}
              </span>
            ))}
            {names.length===0&&<span style={{color:G.dim,fontSize:'0.85rem'}}>이름을 입력해주세요...</span>}
          </div>
        </Panel>
        <div style={{color:G.dim,fontSize:'0.82rem',textAlign:'center'}}>
          {names.length} / {np}명 입력됨
        </div>
        <Panel style={{display:'flex',gap:8}}>
          <input ref={nameRef} value={nameIn} onChange={e=>setNameIn(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addName()}
            placeholder={`플레이어 ${names.length+1} 이름`}
            style={{flex:1,background:'#0a0a1e',border:`1px solid ${G.border}`,borderRadius:7,
              padding:'10px 12px',color:G.txt,fontSize:'0.95rem',outline:'none'}}/>
          <button onClick={addName} style={{
            padding:'10px 16px',background:`${G.grn}20`,border:`2px solid ${G.grn}`,
            borderRadius:7,color:G.grn,fontWeight:700,cursor:'pointer',fontSize:'0.9rem'}}>
            추가
          </button>
        </Panel>
        <Btn color='#7070aa' onClick={()=>{setNames([]);setPhase('SETUP');}}>← 뒤로</Btn>
      </Sc>
    </div>
  );

  /* ===== DECK BUILDER ===== */
  if(phase==='DECK') return (
    <div style={WRAP}>
      <Sc>
        <Title text="카드 덱 구성" color={G.yel}/>
        <Panel style={{background:`${G.yel}10`,borderColor:`${G.yel}30`}}>
          <div style={{fontSize:'0.82rem',color:G.dim,marginBottom:8}}>
            현재 구성 ({deck.length}/{total}) — <span style={{color:G.red}}>마피아 1장 기본 포함</span>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {deck.map((r,i)=><RTag key={i} role={r}/>)}
            {Array.from({length:total-deck.length}).map((_,i)=>(
              <span key={i} style={{background:'#151530',border:`1px dashed ${G.border}`,
                borderRadius:4,padding:'2px 10px',color:G.dim,fontSize:'0.88rem'}}>?</span>
            ))}
          </div>
        </Panel>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {ROLE_POOL.map(r=>{
            const taken=r!=='시민'&&deck.includes(r);
            const c=rclr(r);
            return <button key={r} onClick={()=>addRole(r)} disabled={taken||deck.length>=total}
              style={{padding:'10px 8px',background:taken?'#0e0e20':`${c}12`,
                border:`2px solid ${taken?'#222240':c}`,borderRadius:8,
                color:taken?'#303050':c,fontWeight:700,fontSize:'0.9rem',
                cursor:(taken||deck.length>=total)?'not-allowed':'pointer',
                transition:'all 0.15s',textAlign:'center'}}>
              {r}{taken&&' ✓'}
            </button>;
          })}
        </div>
        <div style={{display:'flex',gap:8}}>
          <Btn color='#cc4455' onClick={removeRole} sm full={false} style={{width:'auto',padding:'10px 16px'}}>
            ✕ 마지막 제거
          </Btn>
          <Btn color={G.grn} onClick={startNight} disabled={deck.length<total}
            style={{flex:1}}>
            {deck.length<total?`${total-deck.length}장 더 필요`:'🌙 밤 단계 시작'}
          </Btn>
        </div>
      </Sc>
    </div>
  );

  /* ===== NIGHT PHASE ===== */
  if(phase==='NIGHT'){
    /* --- PASS screen --- */
    if(nSub==='PASS') return (
      <div style={WRAP}>
        <Sc center>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'3rem',marginBottom:16}}>🌙</div>
            <div style={{fontSize:'0.8rem',color:G.dim,letterSpacing:3,marginBottom:8}}>다음 차례</div>
            <div style={{fontSize:'2rem',fontWeight:900,color:G.pur,
              textShadow:`0 0 20px ${G.pur}60`,marginBottom:6}}>
              {curP}
            </div>
            <div style={{fontSize:'0.8rem',color:G.dim,marginBottom:32}}>
              {ni+1} / {names.length}번째 플레이어
            </div>
            <Panel style={{marginBottom:16,maxWidth:340,textAlign:'center'}}>
              <div style={{color:G.dim,fontSize:'0.85rem',lineHeight:1.7}}>
                다른 사람들은 눈을 감고,<br/>
                <b style={{color:G.yel}}>{curP}</b>님만 화면을 확인하세요.
              </div>
            </Panel>
            <Btn color={G.grn} onClick={()=>setNSub('SHOW')}>
              ✅ 준비됨 — 직업 확인하기
            </Btn>
          </div>
        </Sc>
      </div>
    );

    /* --- SHOW + ABILITY screen --- */
    if(nSub==='SHOW') {
      const targets=getTargets();
      const isNoop=['시민','바보','광인','주술사'].includes(curDisp)&&!needsSel;
      
      return (
        <div style={WRAP}>
          <Sc>
            <div style={{textAlign:'center',paddingTop:8}}>
              <div style={{fontSize:'0.8rem',color:G.dim,marginBottom:6}}>당신의 직업</div>
              <RTag role={curDisp} xl/>
              {iCards[curP]==='바보'&&(
                <div style={{fontSize:'0.75rem',color:'#cc8844',marginTop:6}}>
                  (실제로는 <RTag role="바보"/>이지만 모릅니다)
                </div>
              )}
            </div>

            {aStep==='SEL'&&(
              <>
                {needsSel?(
                  <Panel>
                    <div style={{color:G.dim,fontSize:'0.82rem',marginBottom:10}}>
                      {curDisp==='마피아'&&'확인할 바닥 카드를 선택하세요:'}
                      {curDisp==='경찰'&&'조사할 플레이어를 선택하세요:'}
                      {curDisp==='영매'&&'확인할 바닥 카드를 선택하세요:'}
                      {curDisp==='탐정'&&'위치를 추적할 직업을 선택하세요:'}
                      {curDisp==='말썽쟁이'&&'카드를 교환할 플레이어를 선택하세요:'}
                      {curDisp==='스토커'&&'타깃으로 삼을 플레이어를 선택하세요:'}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:6}}>
                      {targets.map(t=>{
                        const c=curDisp==='탐정'?rclr(t):G.pur;
                        return <button key={t} onClick={()=>setASel(aSel===t?null:t)}
                          style={{padding:'10px 14px',textAlign:'left',
                            background:aSel===t?`${c}30`:`${c}10`,
                            border:`2px solid ${aSel===t?c:c+'40'}`,
                            borderRadius:7,color:aSel===t?c:'#9090b8',
                            fontWeight:aSel===t?700:400,cursor:'pointer',
                            fontSize:'0.92rem',transition:'all 0.12s'}}>
                          {curDisp==='탐정'?<RTag role={t}/>:t}
                          {aSel===t&&' ✓'}
                        </button>;
                      })}
                    </div>
                    <div style={{marginTop:10}}>
                      <Btn color={G.grn} onClick={resolveAbil} disabled={!aSel}>
                        능력 사용하기 →
                      </Btn>
                    </div>
                  </Panel>
                ):(
                  <Panel>
                    <div style={{color:G.dim,fontSize:'0.85rem',marginBottom:10}}>
                      {curDisp==='시민'&&'시민은 능력이 없습니다. 타이핑 연기 후 기기를 넘기세요.'}
                      {curDisp==='광인'&&'광인은 밤 능력이 없습니다. 전략을 세우세요.'}
                      {curDisp==='주술사'&&'주술사는 밤 능력이 없습니다. 낮에 선언 기회가 옵니다.'}
                      {iCards[curP]==='바보'&&'(바보는 가짜 정보를 받는 역할입니다.)'}
                    </div>
                    <textarea value={memo} onChange={e=>setMemo(e.target.value)}
                      placeholder="메모 또는 블러핑 연기용 타이핑..."
                      style={{width:'100%',minHeight:60,background:'#0a0a1e',border:`1px solid ${G.border}`,
                        borderRadius:7,padding:'8px 10px',color:G.txt,fontSize:'0.85rem',
                        resize:'none',outline:'none',boxSizing:'border-box'}}/>
                    <div style={{marginTop:8}}>
                      <Btn color={G.grn} onClick={()=>{setAInfo({t:'memo'});setAStep('RES');}}>
                        완료 →
                      </Btn>
                    </div>
                  </Panel>
                )}
              </>
            )}

            {aStep==='RES'&&aInfo&&(
              <Panel style={{background:'#0a1520',borderColor:'#1a3050'}}>
                <div style={{fontSize:'0.8rem',color:G.dim,marginBottom:8}}>🔍 정보</div>
                {aInfo.t==='reveal'&&(
                  <div style={{textAlign:'center',padding:'8px 0'}}>
                    <div style={{color:'#8888b0',fontSize:'0.85rem',marginBottom:6}}>{aInfo.label}</div>
                    <RTag role={aInfo.role} big/>
                  </div>
                )}
                {aInfo.t==='hints'&&(
                  <div style={{textAlign:'center',padding:'8px 0'}}>
                    <div style={{color:'#8888b0',fontSize:'0.85rem',marginBottom:10}}>{aInfo.label}</div>
                    <div style={{display:'flex',gap:8,justifyContent:'center',alignItems:'center'}}>
                      <RTag role={aInfo.hints[0]} big/>
                      <span style={{color:G.dim}}>또는</span>
                      <RTag role={aInfo.hints[1]} big/>
                    </div>
                    <div style={{color:G.dim,fontSize:'0.75rem',marginTop:8}}>* 둘 중 하나가 진짜입니다</div>
                  </div>
                )}
                {aInfo.t==='loc'&&(
                  <div style={{textAlign:'center',padding:'8px 0'}}>
                    <RTag role={aInfo.role} big/>
                    <div style={{color:'#8888b0',fontSize:'0.85rem',marginTop:8}}>카드 위치</div>
                    <div style={{color:G.yel,fontWeight:700,fontSize:'1.15rem',marginTop:4}}>
                      {aInfo.loc}
                    </div>
                  </div>
                )}
                {aInfo.t==='swap'&&(
                  <div style={{textAlign:'center',padding:'8px 0'}}>
                    <div style={{color:'#8888b0',fontSize:'0.85rem',marginBottom:8}}>카드 교환 완료</div>
                    <div style={{display:'flex',gap:10,justifyContent:'center',alignItems:'center'}}>
                      <span style={{background:`${G.pur}20`,border:`1px solid ${G.pur}40`,
                        borderRadius:5,padding:'4px 10px',color:G.pur,fontWeight:700}}>
                        {aInfo.t1}
                      </span>
                      <span style={{color:G.yel,fontWeight:700}}>⇄</span>
                      <span style={{background:`${G.pur}20`,border:`1px solid ${G.pur}40`,
                        borderRadius:5,padding:'4px 10px',color:G.pur,fontWeight:700}}>
                        {aInfo.t2}
                      </span>
                    </div>
                  </div>
                )}
                {aInfo.t==='stalk'&&(
                  <div style={{textAlign:'center',padding:'8px 0'}}>
                    <div style={{color:'#8888b0',fontSize:'0.85rem',marginBottom:6}}>타깃 고정</div>
                    <div style={{color:G.blu,fontWeight:700,fontSize:'1.2rem'}}>{aInfo.target}</div>
                    <div style={{color:G.dim,fontSize:'0.78rem',marginTop:6}}>낮 투표에서 이 사람이 처형되면 승리!</div>
                  </div>
                )}
                {aInfo.t==='memo'&&(
                  <div style={{textAlign:'center',padding:'4px 0',color:G.dim,fontSize:'0.85rem'}}>
                    행동 완료
                  </div>
                )}
                <div style={{marginTop:12}}>
                  <Btn color={G.yel} onClick={goNextNight}>
                    확인 완료 — 화면 지우고 기기 넘기기 →
                  </Btn>
                </div>
              </Panel>
            )}
          </Sc>
        </div>
      );
    }
  }

  /* ===== DAY PHASE ===== */
  if(phase==='DAY') return (
    <div style={WRAP}>
      <Sc>
        <div style={{textAlign:'center',padding:'8px 0'}}>
          <div style={{fontSize:'2rem',marginBottom:6}}>☀️</div>
          <Title text="아침이 밝았습니다!" color={G.yel}/>
          <div style={{color:G.dim,fontSize:'0.85rem',marginTop:4}}>모두 눈을 뜨세요!</div>
        </div>
        <Panel>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
            {names.map((n,i)=>(
              <span key={i} style={{background:`${G.grn}15`,border:`1px solid ${G.grn}35`,
                borderRadius:5,padding:'3px 10px',color:G.grn,fontSize:'0.85rem',fontWeight:600}}>
                {n}
              </span>
            ))}
          </div>
          <div style={{fontSize:'0.82rem',color:G.dim}}>이번 판 카드 구성:</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}}>
            {deck.map((r,i)=><RTag key={i} role={r}/>)}
          </div>
        </Panel>

        <Panel style={{textAlign:'center'}}>
          <div style={{color:G.dim,fontSize:'0.82rem',marginBottom:8}}>토론 타이머 ({DISC_MIN}분)</div>
          <div style={{fontSize:'3rem',fontWeight:900,color:tsec<60?G.red:tsec<120?G.yel:G.grn,
            fontFamily:'monospace',textShadow:`0 0 20px ${tsec<60?G.red:tsec<120?G.yel:G.grn}60`}}>
            {tmStr}
          </div>
          <div style={{display:'flex',gap:8,marginTop:10}}>
            <Btn color={G.grn} onClick={()=>setTOn(true)} disabled={tOn||tsec===0} sm>▶ 시작</Btn>
            <Btn color={G.yel} onClick={()=>setTOn(false)} disabled={!tOn} sm>⏸ 정지</Btn>
            <Btn color={G.dim} onClick={()=>{setTsec(DISC_MIN*60);setTOn(false);}} sm>↺ 초기화</Btn>
          </div>
        </Panel>

        <Panel style={{borderColor:`${G.blu}40`}}>
          <div style={{color:G.blu,fontWeight:700,marginBottom:8}}>주술사 선언</div>
          <div style={{color:G.dim,fontSize:'0.83rem',marginBottom:10}}>
            정체를 밝히고 직업을 선언할 주술사가 있습니까?
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn color={G.blu} onClick={()=>setPhase('SHAMAN')} sm>예 — 주술사 있음</Btn>
            <Btn color={G.dim} onClick={()=>setPhase('VOTE')} sm>아니오 — 투표로</Btn>
          </div>
        </Panel>
      </Sc>
    </div>
  );

  /* ===== SHAMAN ===== */
  if(phase==='SHAMAN') return (
    <div style={WRAP}>
      <Sc>
        <Title text="주술사 선언" color={G.blu} sub="중립 진영"/>
        <Panel>
          <div style={{color:G.dim,fontSize:'0.85rem',marginBottom:10}}>
            정체를 밝히는 플레이어는?
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {names.map(n=>(
              <button key={n} onClick={()=>setShamanName(n)}
                style={{padding:'10px 14px',background:shamanName===n?`${G.blu}30`:`${G.blu}10`,
                  border:`2px solid ${shamanName===n?G.blu:G.blu+'30'}`,borderRadius:7,
                  color:shamanName===n?G.blu:'#8888b8',fontWeight:shamanName===n?700:400,
                  cursor:'pointer',fontSize:'0.92rem',textAlign:'left',transition:'all 0.12s'}}>
                {n} {shamanName===n&&'✓'}
              </button>
            ))}
          </div>
        </Panel>
        {shamanName&&gCards[shamanName]!=='주술사'&&(
          <Panel style={{background:'#2a0a0a',borderColor:'#6a2020',textAlign:'center'}}>
            <div style={{color:G.red,fontWeight:700}}>⚠️ {shamanName}님은 주술사가 아닙니다!</div>
          </Panel>
        )}
        <Btn color={G.blu} disabled={!shamanName||gCards[shamanName]!=='주술사'}
          onClick={()=>{setShamanGi(0);setShamanGs({});}}>
          {shamanName&&gCards[shamanName]==='주술사'?'예언 시작 →':'올바른 주술사를 선택하세요'}
        </Btn>
        {shamanName&&gCards[shamanName]==='주술사'&&(
          <Btn color={G.blu} onClick={()=>{setShamanGi(0);setShamanGs({});setPhase('SHAMAN_GUESS');}}>
            예언 시작 →
          </Btn>
        )}
        <Btn color='#7070aa' onClick={()=>setPhase('DAY')}>← 돌아가기</Btn>
      </Sc>
    </div>
  );

  if(phase==='SHAMAN_GUESS'){
    const p=names[shamanGi];
    return (
      <div style={WRAP}>
        <Sc>
          <Title text="주술사 예언" color={G.blu}/>
          <Panel>
            <div style={{color:G.dim,fontSize:'0.82rem',marginBottom:4}}>
              {shamanGi+1} / {names.length}
            </div>
            <div style={{fontSize:'1.1rem',fontWeight:700,color:G.yel,marginBottom:12}}>
              {p}님의 최종 직업은?
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
              {deckRoles.map(r=>(
                <button key={r} onClick={()=>doShamanGuess(r)}
                  style={{padding:'10px 8px',background:`${rclr(r)}12`,
                    border:`2px solid ${rclr(r)}50`,borderRadius:7,
                    color:rclr(r),fontWeight:700,fontSize:'0.9rem',
                    cursor:'pointer',transition:'all 0.12s'}}>
                  {r}
                </button>
              ))}
            </div>
          </Panel>
        </Sc>
      </div>
    );
  }

  if(phase==='SHAMAN_WIN'){
    return (
      <div style={WRAP}>
        <Sc center>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'3rem',marginBottom:16}}>🔮</div>
            <Title text="예언 적중!" color={G.blu}/>
            <div style={{color:G.dim,fontSize:'0.9rem',marginTop:4,marginBottom:20}}>주술사 단독 승리!</div>
          </div>
          <Panel>
            {names.map(p=>(
              <div key={p} style={{display:'flex',justifyContent:'space-between',
                alignItems:'center',padding:'8px 4px',borderBottom:`1px solid ${G.border}`}}>
                <span style={{fontWeight:600}}>{p}</span>
                <RTag role={gCards[p]}/>
              </div>
            ))}
            {centers.map(c=>(
              <div key={c} style={{display:'flex',justifyContent:'space-between',
                alignItems:'center',padding:'8px 4px',borderBottom:`1px solid ${G.border}`}}>
                <span style={{color:G.dim}}>{c}</span>
                <RTag role={gCards[c]}/>
              </div>
            ))}
          </Panel>
          <Btn color={G.pur} onClick={reset}>🌙 다시 게임하기</Btn>
        </Sc>
      </div>
    );
  }

  /* ===== VOTE ===== */
  if(phase==='VOTE') return (
    <div style={WRAP}>
      <Sc>
        <Title text="최종 투표" color={G.red}/>
        <Panel>
          <div style={{color:G.dim,fontSize:'0.85rem',marginBottom:10}}>
            처형할 플레이어를 선택하세요
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {[...names,'none'].map(n=>(
              <button key={n} onClick={()=>setVoted(voted===n?null:n)}
                style={{padding:'12px 14px',textAlign:'left',
                  background:voted===n?`${n==='none'?G.dim:G.red}30`:`${n==='none'?G.dim:G.red}10`,
                  border:`2px solid ${voted===n?n==='none'?G.dim:G.red:(n==='none'?G.dim:G.red)+'35'}`,
                  borderRadius:7,color:voted===n?n==='none'?'#aaa':G.red:'#9090b8',
                  fontWeight:voted===n?700:400,cursor:'pointer',fontSize:'0.95rem',transition:'all 0.12s'}}>
                {n==='none'?'🤝 아무도 처형하지 않음 (none)':n}
                {voted===n&&' ✓'}
              </button>
            ))}
          </div>
        </Panel>
        <Btn color={G.red} disabled={!voted} onClick={()=>{setPhase('RESULTS');}}>
          처형 결정 →
        </Btn>
      </Sc>
    </div>
  );

  /* ===== RESULTS ===== */
  if(phase==='RESULTS'){
    const w=calcWin();
    const banners=[];
    if(w.madman) banners.push({text:'중립 [광인] 단독 승리!',c:G.blu});
    else {
      if(w.cWin) banners.push({text:'시민 팀 승리!',c:G.grn});
      if(w.mWin) banners.push({text:'마피아 팀 승리!',c:G.red});
      if(w.cLose) banners.push({text:'시민 팀 패배 (마피아가 바닥에 있었음)',c:'#cc6644'});
      if(w.stalker) banners.push({text:'중립 [스토커] 공동 승리!',c:G.blu});
    }
    return (
      <div style={WRAP}>
        <Sc>
          <Title text="게임 종료" color={G.pur}/>
          <Panel style={{textAlign:'center',borderColor:`${G.yel}40`,background:`${G.yel}08`}}>
            <div style={{fontSize:'0.82rem',color:G.dim,marginBottom:8}}>처형: <b style={{color:'#ccc'}}>{voted==='none'?'없음':voted}</b></div>
            {banners.map((b,i)=>(
              <div key={i} style={{color:b.c,fontWeight:900,fontSize:'1.3rem',
                textShadow:`0 0 16px ${b.c}60`,marginBottom:4}}>{b.text}</div>
            ))}
          </Panel>
          <div style={{fontWeight:700,color:G.dim,fontSize:'0.85rem',marginBottom:-4}}>최초 배분 카드</div>
          <Panel>
            {names.map(p=>(
              <div key={p} style={{display:'flex',justifyContent:'space-between',
                alignItems:'center',padding:'7px 4px',borderBottom:`1px solid ${G.border}`}}>
                <span style={{fontWeight:600}}>{p}</span>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <RTag role={iCards[p]}/>
                  {foolD[p]&&<span style={{color:G.dim,fontSize:'0.75rem'}}>→ 보기엔 <RTag role={foolD[p]}/></span>}
                </div>
              </div>
            ))}
            {centers.map(c=>(
              <div key={c} style={{display:'flex',justifyContent:'space-between',
                alignItems:'center',padding:'7px 4px',borderBottom:`1px solid ${G.border}`}}>
                <span style={{color:G.dim}}>{c}</span>
                <RTag role={iCards[c]}/>
              </div>
            ))}
          </Panel>
          <div style={{fontWeight:700,color:G.dim,fontSize:'0.85rem',marginBottom:-4}}>최종 카드</div>
          <Panel>
            {names.map(p=>(
              <div key={p} style={{display:'flex',justifyContent:'space-between',
                alignItems:'center',padding:'7px 4px',borderBottom:`1px solid ${G.border}`}}>
                <span style={{fontWeight:600}}>{p}</span>
                <RTag role={gCards[p]}/>
              </div>
            ))}
            {centers.map(c=>(
              <div key={c} style={{display:'flex',justifyContent:'space-between',
                alignItems:'center',padding:'7px 4px',borderBottom:`1px solid ${G.border}`}}>
                <span style={{color:G.dim}}>{c}</span>
                <RTag role={gCards[c]}/>
              </div>
            ))}
          </Panel>
          {(swapPair||stalkT)&&(
            <Panel style={{fontSize:'0.83rem',color:G.dim}}>
              {swapPair&&<div>🔀 말썽쟁이 교환: <b style={{color:G.pur}}>{swapPair[0]}</b> ⇄ <b style={{color:G.pur}}>{swapPair[1]}</b></div>}
              {stalkT&&<div style={{marginTop:swapPair?4:0}}>👁️ 스토커 타깃: <b style={{color:G.blu}}>{stalkT}</b></div>}
            </Panel>
          )}
          <Btn color={G.pur} onClick={reset}>🌙 다시 게임하기</Btn>
        </Sc>
      </div>
    );
  }

  return null;
}