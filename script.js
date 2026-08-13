const {createClient}=supabase;let db,room,me,friend,id=localStorage.km_id||crypto.randomUUID(),phase=0,n=0,friendAnswers=[],resultsShown=false;
localStorage.km_id=id;let currentLang=localStorage.km_lang||"en";
const questionBank=[
["What's your comfort food?","إيه أكتر أكلة بتحسسك بالراحة؟","FOOD","أكل"],["What job would you try for one day?","إيه شغلانة نفسك تجربها ليوم واحد؟","GOALS","أهداف"],["What's a hobby you'd love to learn?","إيه هواية نفسك تتعلمها؟","HOBBIES","هوايات"],["If you could wake up anywhere tomorrow, where?","لو صحيت بكرة في أي مكان، تختار فين؟","TRAVEL","سفر"],["What small thing instantly improves your mood?","إيه حاجة صغيرة بتظبط مودك فورًا؟","PERSONALITY","شخصية"],["What's a movie you can rewatch forever?","إيه فيلم ممكن تتفرج عليه كل مرة؟","FAVORITES","مفضلات"],["What is one thing you want to achieve this year?","إيه حاجة واحدة نفسك تحققها السنة دي؟","GOALS","أهداف"],["Which app do you open way too often?","إيه أب بتفتحه أكتر من اللازم؟","LIFESTYLE","روتين"],["What's your ideal Friday night?","إيه شكل ليلة الجمعة المثالية بالنسبالك؟","LIFESTYLE","روتين"],["What is something people often misunderstand about you?","إيه حاجة الناس غالبًا بتفهمها غلط عنك؟","PERSONALITY","شخصية"],["What would you buy first with a surprise $1,000?","لو جالك 1000 دولار فجأة هتشتري إيه أول حاجة؟","MONEY","فلوس"],["What's your most useless talent?","إيه أغرب موهبة مالهاش لازمة عندك؟","FUN","مرح"],["What song matches your personality?","إيه أغنية شبه شخصيتك؟","MUSIC","موسيقى"],["Would you rather be famous or anonymous? Why?","تفضل تكون مشهور ولا مجهول؟ وليه؟","VALUES","اختيارات"],["What's one place you never get bored of?","إيه مكان عمرك ما بتزهق منه؟","PLACES","أماكن"],["What's your go-to late-night snack?","إيه سناكك المفضل بالليل؟","FOOD","أكل"],["What kind of weather makes you happiest?","إيه نوع الجو اللي بيخليك مبسوط؟","LIFESTYLE","جو"],["What is a childhood thing you still love?","إيه حاجة من طفولتك لسه بتحبها؟","MEMORIES","ذكريات"],["If you had a free plane ticket, where would you go?","لو معاك تذكرة طيران مجانية، هتروح فين؟","TRAVEL","سفر"],["What's something you could talk about for hours?","إيه موضوع ممكن تتكلم عنه بالساعات؟","INTERESTS","اهتمامات"],["What makes someone instantly trustworthy to you?","إيه اللي يخليك تثق في شخص بسرعة؟","FRIENDSHIP","صداقة"],["What's your dream room like?","غرفتك المثالية شكلها عامل إزاي؟","LIFESTYLE","روتين"],["What's one food you would never try?","إيه أكلة مستحيل تجربها؟","FOOD","أكل"],["Which game would you want to live inside?","إيه لعبة نفسك تعيش جوا عالمها؟","GAMES","ألعاب"],["What's a skill you wish you had right now?","إيه مهارة نفسك تكون عندك دلوقتي؟","GOALS","أهداف"],["What's your favorite way to spend a completely free day?","بتحب تقضي يوم فاضي تمامًا إزاي؟","LIFESTYLE","روتين"],["What's a tiny purchase that made your life better?","إيه حاجة صغيرة اشتريتها وحسنت حياتك؟","LIFE","حياة"],["Who would you invite to your perfect dinner?","مين هتعزمه على العشا المثالي بتاعك؟","FUN","مرح"],["What is your biggest pet peeve?","إيه أكتر حاجة صغيرة بتضايقك؟","PERSONALITY","شخصية"],["What would your perfect weekend trip look like?","رحلة الويك إند المثالية بالنسبالك شكلها إيه؟","TRAVEL","سفر"],["What's something you want to be better at?","إيه حاجة نفسك تبقى أحسن فيها؟","GOALS","أهداف"],["What is your favorite smell?","إيه ريحتك المفضلة؟","FAVORITES","مفضلات"],["What's one rule you'd remove from the world?","إيه قانون واحد نفسك تلغيه من العالم؟","FUN","مرح"],["What's your favorite thing about your best friend?","إيه أكتر حاجة بتحبها في صاحبك المقرب؟","FRIENDSHIP","صداقة"],["What kind of content do you never get tired of?","إيه نوع المحتوى اللي عمرك ما بتزهق منه؟","MEDIA","محتوى"],["What's your dream project?","إيه المشروع اللي نفسك تعمله؟","GOALS","أهداف"],["What's one thing you would save in a fire?","لو في حريق، إيه حاجة واحدة هتنقذها؟","VALUES","قيم"],["What is your most used emoji?","إيه الإيموجي اللي بتستخدمه أكتر حاجة؟","FUN","مرح"],["What's a place you want your friend to visit with you?","إيه مكان نفسك تزوره مع صاحبك؟","FRIENDSHIP","صداقة"],["What is your ideal breakfast?","إيه الفطار المثالي بالنسبالك؟","FOOD","أكل"]
];
function seedFromCode(code){return [...String(code||'')].reduce((a,c)=>((a*31+c.charCodeAt(0))>>>0),2166136261)>>>0}
function makeQuestions(){let pool=questionBank.map((q,i)=>({q,i}));let seed=seedFromCode(room?.code||'KNOWMATE');for(let i=pool.length-1;i>0;i--){seed=(seed*1664525+1013904223)>>>0;let j=seed%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]]}return pool.slice(0,10).map(x=>x.q)}
let qs=[];
const T={en:{eyebrow:"REAL-TIME FRIENDSHIP GAME",heroTitle:"How well do you<br><em>really</em> know them?",heroDesc:"Answer about yourself. Your friend predicts your answers. No peeking.",createRoom:"Create a room",joinRoom:"Join a room",private:"Private by design",live:"Live multiplayer",floating1:"You know Sara",floating2:"No peeking",back:"Back",createEyebrow:"CREATE ROOM",createTitle:"Start your room.",createDesc:"Invite one friend. The rest happens automatically.",joinEyebrow:"JOIN ROOM",joinTitle:"Your turn to guess.",joinDesc:"Enter your friend's room code and password.",name:"Name",password:"Password",roomCode:"Room code",copy:"Copy",you:"YOU",friend:"FRIEND",waiting:"Waiting for your friend...",start:"Start the game",saveNext:"Save & next",synced:"SYNCED",waitingTitle:"Your answers are locked.",waitingDesc:"No peeking. We're waiting for your friend to finish.",reveal:"THE REVEAL",truth:"Now you know the truth.",resultSub:"Two scores. Ten tiny secrets. One very honest friendship report.",youKnow:"You know",knowsYou:"knows you",answers:"THE ANSWERS",homeAgain:"Play again"},ar:{eyebrow:"لعبة الأصدقاء المباشرة",heroTitle:"قد إيه إنت<br><em>عارف</em> صاحبك؟",heroDesc:"جاوب عن نفسك. صاحبك هيحاول يتوقع إجاباتك. ممنوع الغش.",createRoom:"اعمل روم",joinRoom:"ادخل روم",private:"خصوصية أولًا",live:"لعب مباشر",floating1:"إنت عارف صاحبك 87%",floating2:"ممنوع الغش",back:"رجوع",createEyebrow:"إنشاء روم",createTitle:"ابدأ الروم بتاعتك.",createDesc:"ادعُ صاحب واحد. والباقي هيحصل تلقائيًا.",joinEyebrow:"دخول روم",joinTitle:"دورك تتوقع.",joinDesc:"اكتب كود الروم والباسورد بتوع صاحبك.",name:"الاسم",password:"الباسورد",roomCode:"كود الروم",copy:"نسخ",you:"إنت",friend:"صاحبك",waiting:"مستني صاحبك...",start:"ابدأ اللعبة",saveNext:"حفظ والتالي",synced:"متزامن",waitingTitle:"إجاباتك اتقفلت.",waitingDesc:"ممنوع الغش. مستنيين صاحبك يخلص.",reveal:"لحظة الكشف",truth:"دلوقتي عرفت الحقيقة.",resultSub:"نسبتين. عشر إجابات. وتقرير صريح جدًا عن صداقتكم.",youKnow:"إنت عارف",knowsYou:"صاحبك عارفك",answers:"الإجابات",homeAgain:"العب تاني"}};

function show(x){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("on"));document.getElementById(x).classList.add("on")}function toast(t){let x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2000)}function applyLang(){
  let d=T[currentLang];
  document.documentElement.lang=currentLang;
  document.documentElement.dir=currentLang==="ar"?"rtl":"ltr";
  document.querySelectorAll("[data-i18n]").forEach(e=>{
    if(d[e.dataset.i18n]) e.textContent=d[e.dataset.i18n];
  });
  document.querySelectorAll("[data-i18n-html]").forEach(e=>{
    if(d[e.dataset.i18nHtml]) e.innerHTML=d[e.dataset.i18nHtml];
  });
  document.getElementById("langBtn").textContent=currentLang==="ar"?"English":"العربية";
  document.getElementById("themeBtn").textContent=document.body.classList.contains("light")?"☀":"☾";
  // Translate input placeholders too.
  const ph={
    cn:currentLang==="ar"?"محمود":"Mahmoud",
    cp:currentLang==="ar"?"4 أحرف أو أكثر":"4+ characters",
    jn:currentLang==="ar"?"أحمد":"Ahmed",
    jc:currentLang==="ar"?"ABC123":"ABC123",
    jp:currentLang==="ar"?"••••••":"••••••"
  };
  Object.keys(ph).forEach(k=>{
    const el=document.getElementById(k);
    if(el) el.placeholder=ph[k];
  });
  const ans=document.getElementById("ans");
  if(ans) ans.placeholder=currentLang==="ar"?"اكتب إجابتك هنا...":"Type your answer...";
}function toggleLanguage(){
  const keepPhase=phase, keepQuestion=n;
  currentLang=currentLang==="ar"?"en":"ar";
  localStorage.km_lang=currentLang;
  applyLang();
  if(keepPhase===1||keepPhase===2){ phase=keepPhase; n=keepQuestion; draw(false); }
}function toggleTheme(){document.body.classList.toggle("light");localStorage.km_theme=document.body.classList.contains("light")?"light":"dark";document.getElementById("themeBtn").textContent=document.body.classList.contains("light")?"☀":"☾"}
async function hash(s){let b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}function code(){return Math.random().toString(36).slice(2,8).toUpperCase()}
async function create(){if(!db)return;me=document.getElementById("cn").value.trim()||"Player 1";let p=document.getElementById("cp").value;if(p.length<4)return toast("Password: 4+ characters");let {data,error}=await db.from("rooms").insert({code:code(),password_hash:await hash(p),player1_name:me,player1_id:id}).select().single();if(error)return toast(error.message);room=data;enter();sub()}
async function join(){if(!db)return;me=document.getElementById("jn").value.trim()||"Player 2";let c=document.getElementById("jc").value.trim().toUpperCase(),p=document.getElementById("jp").value,{data,error}=await db.from("rooms").select("*").eq("code",c).maybeSingle();if(error||!data)return toast("Room not found");if(data.password_hash!==await hash(p))return toast("Wrong password");if(data.player2_id&&data.player2_id!==id)return toast("Room full");let u=await db.from("rooms").update({player2_name:me,player2_id:id,status:"ready"}).eq("id",data.id);if(u.error)return toast(u.error.message);room={...data,player2_name:me,player2_id:id,status:"ready"};enter();sub()}
function enter(){qs=makeQuestions();document.getElementById("code").textContent=room.code;document.getElementById("me").textContent=me;document.getElementById("meA").textContent=me[0].toUpperCase();ui();show("room")}
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

    // Also poll guesses. Realtime can miss an event on some networks,
    // so the host must independently notice when both players finish.
    if(room){
      const {data:gs}=await db.from("guesses").select("*").eq("room_id",room.id);
      const p1=gs?.filter(x=>x.guesser_id===room.player1_id).length||0;
      const p2=gs?.filter(x=>x.guesser_id===room.player2_id).length||0;
      if(p1>=10&&p2>=10&&!resultsShown){
        resultsShown=true;
        results(gs);
      }
    }
  },1000);
}
async function start(){await db.from("rooms").update({status:"profile",current_question:0}).eq("id",room.id);beginProfile()}
function beginProfile(){phase=1;n=0;draw()}
function draw(clearAnswer=true){let ar=currentLang==="ar";document.getElementById("kind").textContent=phase===1?(ar?"عنك":"ABOUT YOU"):(ar?"توقع صاحبك":"GUESS YOUR FRIEND");document.getElementById("num").textContent=n+1;document.getElementById("bar").style.width=(n+1)*10+"%";document.getElementById("q").textContent=ar?qs[n][1]:qs[n][0];document.getElementById("cat").textContent=ar?qs[n][3]:qs[n][2];document.getElementById("hint").textContent=phase===1?(ar?"جاوب بصراحة. صاحبك هيحاول يتوقعها بعدين.":"Answer honestly. Your friend will guess this later."):(ar?"إيه توقعك لإجابة صاحبك؟":"What do you think your friend answered?");if(clearAnswer) document.getElementById("ans").value="";show("quiz")}
async function answer(){let a=document.getElementById("ans").value.trim();if(!a)return toast("Write an answer first");if(phase===1){let r=await db.from("profile_answers").upsert({room_id:room.id,player_id:id,question_no:n,answer:a},{onConflict:"room_id,player_id,question_no"});if(r.error)return toast(r.error.message);if(n<9){n++;draw()}else{show("wait");checkProfile()}}else{let target=id===room.player1_id?room.player2_id:room.player1_id,real=(friendAnswers.find(x=>x.question_no===n)||{}).answer||"",correct=norm(a)===norm(real),r=await db.from("guesses").upsert({room_id:room.id,question_no:n,guesser_id:id,target_id:target,answer:a,correct},{onConflict:"room_id,question_no,guesser_id"});if(r.error)return toast(r.error.message);if(n<9){n++;draw()}else{show("wait");checkGuesses()}}}
async function checkProfile(){let {data}=await db.from("profile_answers").select("player_id,question_no").eq("room_id",room.id);if(data&&data.length>=20){await db.from("rooms").update({status:"guess",current_question:0}).eq("id",room.id);beginGuess()}}
async function beginGuess(){phase=2;n=0;let target=id===room.player1_id?room.player2_id:room.player1_id,{data}=await db.from("profile_answers").select("question_no,answer").eq("room_id",room.id).eq("player_id",target);friendAnswers=data||[];draw()}
function norm(s){return s.toLowerCase().trim().replace(/[.,!?؟،]/g,"").replace(/\s+/g," ")}
async function checkGuesses(){let {data}=await db.from("guesses").select("*").eq("room_id",room.id);let p1=data?.filter(x=>x.guesser_id===room.player1_id).length||0,p2=data?.filter(x=>x.guesser_id===room.player2_id).length||0;if(p1>=10&&p2>=10&&!resultsShown){resultsShown=true;results(data)}}
async function results(gs){let mine=gs.filter(x=>x.guesser_id===id),other=gs.filter(x=>x.guesser_id!==id),a=mine.filter(x=>x.correct).length*10,b=other.filter(x=>x.correct).length*10;document.getElementById("s1").textContent=a+"%";document.getElementById("s2").textContent=b+"%";document.getElementById("rn1").textContent=friend.toUpperCase();document.getElementById("rn2").textContent=friend.toUpperCase();document.getElementById("s1label").textContent=a>=80?(currentLang==="ar"?"بتعرفه بشكل رهيب ✦":"You know them really well ✦"):a>=50?(currentLang==="ar"?"معرفة حلوة، بس لسه في مفاجآت":"Pretty good, but there are surprises"):(currentLang==="ar"?"محتاجين قعدة طويلة 😂":"You two need a long chat 😂");document.getElementById("s2label").textContent=b>=80?(currentLang==="ar"?"صاحبك حافظك ✦":"They know you really well ✦"):b>=50?(currentLang==="ar"?"قريبين جدًا":"Getting there"):(currentLang==="ar"?"في حاجات كتير لسه 😂":"There is a lot to discover 😂");let {data:p}=await db.from("profile_answers").select("*").eq("room_id",room.id);document.getElementById("list").innerHTML=mine.sort((x,y)=>x.question_no-y.question_no).map(g=>{let real=p.find(z=>z.player_id===g.target_id&&z.question_no===g.question_no)?.answer||"—";return `<div class="reveal"><b>${currentLang==="ar"?qs[g.question_no][1]:qs[g.question_no][0]}</b><span>${currentLang==="ar"?"توقعك: ":"Your guess: "}${esc(g.answer)}</span><br><span>${currentLang==="ar"?"الإجابة الحقيقية: ":"Real answer: "}${esc(real)}</span> <b class="${g.correct?"ok":"no"}">${g.correct?(currentLang==="ar"?"✓ صح":"✓ CORRECT"):(currentLang==="ar"?"✕ غلط":"✕ WRONG")}</b></div>`}).join("");show("results");celebrate();setTimeout(()=>{document.getElementById("l1").style.width=a+"%";document.getElementById("l2").style.width=b+"%"},100)}
function celebrate(){const c=document.getElementById("confetti"),x=c.getContext("2d");c.width=innerWidth;c.height=innerHeight;let pieces=Array.from({length:110},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.3,s:3+Math.random()*5,v:2+Math.random()*4,r:Math.random()*6,vr:(Math.random()-.5)*.2,a:Math.random()*6.28}));let start=performance.now();function frame(t){x.clearRect(0,0,c.width,c.height);pieces.forEach(p=>{p.y+=p.v;p.x+=Math.sin(p.y*.02+p.a)*1.4;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=`hsl(${260+Math.random()*90} 80% 68%)`;x.fillRect(-p.s/2,-p.s/2,p.s*1.6,p.s);x.restore()});if(t-start<2300)requestAnimationFrame(frame);else x.clearRect(0,0,c.width,c.height)}requestAnimationFrame(frame)}
function esc(s){return String(s).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]))}function copy(){navigator.clipboard?.writeText(room.code);toast("Copied ✦")}if(localStorage.km_theme==="light")document.body.classList.add("light");applyLang();db=createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);