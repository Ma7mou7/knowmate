const {createClient}=supabase;let db,room,me,friend,id=localStorage.km_id||crypto.randomUUID(),phase=0,n=0,friendAnswers=[];
localStorage.km_id=id;const qs=[["What's your favorite food?","FOOD"],["What do you dream of becoming?","GOALS"],["What's your favorite game?","FAVORITES"],["Where do you most want to travel?","TRAVEL"],["What instantly makes you happy?","PERSONALITY"],["What's your favorite movie or show?","FAVORITES"],["What's your biggest goal right now?","GOALS"],["What could you never live without?","LIFESTYLE"],["What's your perfect weekend?","LIFESTYLE"],["What do you wish your friend understood about you?","FRIENDSHIP"]];
function show(x){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("on"));document.getElementById(x).classList.add("on")}function toast(t){let x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2000)}function lang(){document.documentElement.dir=document.documentElement.dir==="rtl"?"ltr":"rtl"}
async function hash(s){let b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}function code(){return Math.random().toString(36).slice(2,8).toUpperCase()}
async function create(){if(!db)return;me=document.getElementById("cn").value.trim()||"Player 1";let p=document.getElementById("cp").value;if(p.length<4)return toast("Password: 4+ characters");let {data,error}=await db.from("rooms").insert({code:code(),password_hash:await hash(p),player1_name:me,player1_id:id}).select().single();if(error)return toast(error.message);room=data;enter();sub()}
async function join(){if(!db)return;me=document.getElementById("jn").value.trim()||"Player 2";let c=document.getElementById("jc").value.trim().toUpperCase(),p=document.getElementById("jp").value,{data,error}=await db.from("rooms").select("*").eq("code",c).maybeSingle();if(error||!data)return toast("Room not found");if(data.password_hash!==await hash(p))return toast("Wrong password");if(data.player2_id&&data.player2_id!==id)return toast("Room full");let u=await db.from("rooms").update({player2_name:me,player2_id:id,status:"ready"}).eq("id",data.id);if(u.error)return toast(u.error.message);room={...data,player2_name:me,player2_id:id,status:"ready"};enter();sub()}
function enter(){document.getElementById("code").textContent=room.code;document.getElementById("me").textContent=me;document.getElementById("meA").textContent=me[0].toUpperCase();ui();show("room")}
function ui(){let p1=id===room.player1_id;friend=p1?room.player2_name:room.player1_name;document.getElementById("fr").textContent=friend||"Waiting...";document.getElementById("frA").textContent=friend?friend[0].toUpperCase():"?";let ready=!!room.player2_id;document.getElementById("msg").textContent=ready?"Both players are ready":"Waiting for your friend...";document.getElementById("start").disabled=!ready}
let pollTimer=null;
function sub(){
  const channel=db.channel("km"+room.id);
  channel.on("postgres_changes",{event:"*",schema:"public",table:"rooms",filter:"id=eq."+room.id},p=>{
    if(p.new){room={...room,...p.new};ui();}
    if(room.status==="profile"&&phase!==1)beginProfile();
    if(room.status==="guess"&&phase!==2)beginGuess();
  }).on("postgres_changes",{event:"*",schema:"public",table:"profile_answers",filter:"room_id=eq."+room.id},checkProfile).on("postgres_changes",{event:"*",schema:"public",table:"guesses",filter:"room_id=eq."+room.id},checkGuesses).subscribe();

  // Reliable fallback: poll the room every second. This makes the host detect a join
  // even if Realtime is delayed or unavailable on the current network.
  clearInterval(pollTimer);
  pollTimer=setInterval(async()=>{
    const {data,error}=await db.from("rooms").select("*").eq("id",room.id).maybeSingle();
    if(!error&&data){
      const changed=data.player2_id!==room.player2_id||data.status!==room.status;
      room=data;
      ui();
      if(changed&&room.status==="profile"&&phase!==1)beginProfile();
      if(changed&&room.status==="guess"&&phase!==2)beginGuess();
    }
  },1000);

  // Also poll guesses so the player who finishes first does not stay on Waiting
  // when Realtime is unavailable or delayed.
  const guessPollTimer=setInterval(async()=>{
    if(phase===2 || document.getElementById("wait").classList.contains("on")){
      await checkGuesses();
    }
  },1000);
  window.kmGuessPollTimer=guessPollTimer;
}
async function start(){await db.from("rooms").update({status:"profile",current_question:0}).eq("id",room.id);beginProfile()}
function beginProfile(){phase=1;n=0;draw("ABOUT YOU","Answer honestly. Your friend will guess this later.")}
function draw(kind,hint){document.getElementById("kind").textContent=kind;document.getElementById("num").textContent=n+1;document.getElementById("bar").style.width=(n+1)*10+"%";document.getElementById("q").textContent=qs[n][0];document.getElementById("cat").textContent=qs[n][1];document.getElementById("hint").textContent=hint;document.getElementById("ans").value="";show("quiz")}
async function answer(){let a=document.getElementById("ans").value.trim();if(!a)return toast("Write an answer first");if(phase===1){let r=await db.from("profile_answers").upsert({room_id:room.id,player_id:id,question_no:n,answer:a},{onConflict:"room_id,player_id,question_no"});if(r.error)return toast(r.error.message);if(n<9){n++;draw("ABOUT YOU","Answer honestly. Your friend will guess this later.")}else{show("wait");checkProfile()}}else{let target=id===room.player1_id?room.player2_id:room.player1_id,real=(friendAnswers.find(x=>x.question_no===n)||{}).answer||"",correct=norm(a)===norm(real),r=await db.from("guesses").upsert({room_id:room.id,question_no:n,guesser_id:id,target_id:target,answer:a,correct},{onConflict:"room_id,question_no,guesser_id"});if(r.error)return toast(r.error.message);if(n<9){n++;draw("GUESS YOUR FRIEND","What do you think your friend answered?")}else{show("wait");checkGuesses()}}}
async function checkProfile(){let {data}=await db.from("profile_answers").select("player_id,question_no").eq("room_id",room.id);if(data&&data.length>=20){await db.from("rooms").update({status:"guess",current_question:0}).eq("id",room.id);beginGuess()}}
async function beginGuess(){phase=2;n=0;let target=id===room.player1_id?room.player2_id:room.player1_id,{data}=await db.from("profile_answers").select("question_no,answer").eq("room_id",room.id).eq("player_id",target);friendAnswers=data||[];draw("GUESS YOUR FRIEND","What do you think your friend answered?")}
function norm(s){return s.toLowerCase().trim().replace(/[.,!?؟،]/g,"").replace(/\s+/g," ")}
let resultsShown=false;
async function checkGuesses(){
  if(resultsShown)return;
  let {data}=await db.from("guesses").select("*").eq("room_id",room.id);
  if(data&&data.length>=20){resultsShown=true;results(data)}
}
async function results(gs){let mine=gs.filter(x=>x.guesser_id===id),other=gs.filter(x=>x.guesser_id!==id),a=mine.filter(x=>x.correct).length*10,b=other.filter(x=>x.correct).length*10;document.getElementById("s1").textContent=a+"%";document.getElementById("s2").textContent=b+"%";document.getElementById("rn1").textContent=friend.toUpperCase();document.getElementById("rn2").textContent=friend.toUpperCase();let {data:p}=await db.from("profile_answers").select("*").eq("room_id",room.id);document.getElementById("list").innerHTML=mine.sort((x,y)=>x.question_no-y.question_no).map(g=>{let real=p.find(z=>z.player_id===g.target_id&&z.question_no===g.question_no)?.answer||"—";return `<div class="reveal"><b>${qs[g.question_no][0]}</b><span>Your guess: ${esc(g.answer)}</span><br><span>Real answer: ${esc(real)}</span> <b class="${g.correct?"ok":"no"}">${g.correct?"✓ CORRECT":"✕ WRONG"}</b></div>`}).join("");show("results");setTimeout(()=>{document.getElementById("l1").style.width=a+"%";document.getElementById("l2").style.width=b+"%"},100)}
function esc(s){return String(s).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]))}function copy(){navigator.clipboard?.writeText(room.code);toast("Copied ✦")}db=createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);