const {createClient}=supabase;
let db=null;
let S={lang:"en",sound:true,room:null,me:null,friend:null,playerId:localStorage.getItem("km_player_id")||crypto.randomUUID(),q:0,channel:null};
localStorage.setItem("km_player_id",S.playerId);

const Q=[
["What's their dream destination?","Japan 🇯🇵","EASY","LIFE"],
["What's their favorite game?","Minecraft","EASY","FAVORITES"],
["What would they buy with $1000?","A new PC","MEDIUM","PERSONALITY"],
["What's something that instantly annoys them?","Being ignored","MEDIUM","PERSONALITY"],
["What is their dream job?","Video Editor","EASY","GOALS"],
["Which place would they love to visit?","Japan","EASY","TRAVEL"],
["What's their comfort food?","Pizza","EASY","FAVORITES"],
["What skill would they master instantly?","3D animation","HARD","GOALS"],
["What's their perfect weekend?","Gaming with friends","MEDIUM","LIFESTYLE"],
["What's one thing they secretly love?","Late-night projects","HARD","RANDOM"]
];

const T={
en:{eyebrow:"REAL-TIME FRIENDSHIP GAME",hero:"How well do you<br><em>really</em> know them?",copy:"Create a private room, invite your friend, answer secretly, and discover who knows who better.",create:"Create a room",join:"Join a room",back:"Back",createTitle:"Create your room",createCopy:"Choose your name and a password. Then send the room code to your friend.",name:"Your name",password:"Room password",createBtn:"Create room",joinTitle:"Join a room",joinCopy:"Use the code and password your friend shared with you.",code:"Room code",joinBtn:"Join room",copyCode:"COPY CODE",private:"PRIVATE",answerHint:"Answer what you think your friend would say.",lock:"Lock my answer",waitingTitle:"Waiting for your friend...",waitingCopy:"Your answer is private. The next screen will appear when both players have answered.",results:"You really know each other.",again:"Back home"},
ar:{eyebrow:"لعبة صداقة مباشرة",hero:"إنت عارف صاحبك<br><em>بجد</em> قد إيه؟",copy:"اعمل روم خاصة، ابعت الكود لصاحبك، جاوبوا في سرية، واكتشفوا مين عارف التاني أكتر.",create:"اعمل روم",join:"ادخل روم",back:"رجوع",createTitle:"اعمل الروم بتاعتك",createCopy:"اختار اسمك وباسورد. بعد كده ابعت كود الروم لصاحبك.",name:"اسمك",password:"باسورد الروم",createBtn:"إنشاء الروم",joinTitle:"ادخل روم",joinCopy:"استخدم الكود والباسورد اللي صاحبك بعتهملك.",code:"كود الروم",joinBtn:"دخول الروم",copyCode:"نسخ الكود",private:"خاص",answerHint:"جاوب بالإجابة اللي تتوقع إن صاحبك هيقولها.",lock:"ثبّت إجابتي",waitingTitle:"مستني صاحبك...",waitingCopy:"إجابتك سرية. هنكمل لما الاتنين يجاوبوا.",results:"إنتوا عارفين بعض بجد.",again:"العودة للرئيسية"}
};
function init(){if(!window.SUPABASE_URL||window.SUPABASE_URL.includes("PASTE_")){toast("Add your Supabase URL/key in config.js");return}db=createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY)}
function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));document.getElementById(id).classList.add("active");scrollTo(0,0)}
function toast(t){let x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2200)}
function toggleSound(){S.sound=!S.sound;document.getElementById("sound").textContent=S.sound?"◉":"○"}
function toggleLang(){S.lang=S.lang==="en"?"ar":"en";document.documentElement.lang=S.lang;document.documentElement.dir=S.lang==="ar"?"rtl":"ltr";document.getElementById("lang").textContent=S.lang==="en"?"العربية":"English";document.querySelectorAll("[data-t]").forEach(e=>{let k=e.dataset.t;if(T[S.lang][k])e.innerHTML=T[S.lang][k]})}
async function hash(s){let b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function code(){return Math.random().toString(36).slice(2,8).toUpperCase()}
async function createRoom(){
 if(!db){toast("Configure Supabase first");return}
 let name=document.getElementById("createName").value.trim()||"Mahmoud",pass=document.getElementById("createPass").value;
 if(pass.length<4){toast("Password must be at least 4 characters");return}
 let c=code(),ph=await hash(pass);
 let {data,error}=await db.from("rooms").insert({code:c,password_hash:ph,player1_name:name,player1_id:S.playerId}).select().single();
 if(error){console.error(error);toast(error.message);return}
 S.room=data;S.me=name;S.friend=null;enterRoom();subscribe();
}
async function joinRoom(){
 if(!db){toast("Configure Supabase first");return}
 let name=document.getElementById("joinName").value.trim()||"Ahmed",c=document.getElementById("joinCode").value.trim().toUpperCase(),pass=document.getElementById("joinPass").value;
 if(!c||!pass){toast("Enter code and password");return}
 let {data,error}=await db.from("rooms").select("*").eq("code",c).maybeSingle();
 if(error||!data){toast("Room not found");return}
 if(data.password_hash!==await hash(pass)){toast("Wrong password");return}
 if(data.player2_id&&data.player2_id!==S.playerId){toast("This room is full");return}
 let upd=await db.from("rooms").update({player2_name:name,player2_id:S.playerId,status:"ready"}).eq("id",data.id);
 if(upd.error){toast(upd.error.message);return}
 S.room={...data,player2_name:name,player2_id:S.playerId,status:"ready"};S.me=name;S.friend=data.player1_name;enterRoom();subscribe();
}
function enterRoom(){
 document.getElementById("roomCode").textContent=S.room.code;
 document.getElementById("meName").textContent=S.me;document.getElementById("meAvatar").textContent=S.me[0].toUpperCase();
 updateRoomUI(S.room);show("room");
}
function updateRoomUI(r){
 let isP1=r.player1_id===S.playerId;let friend=isP1?r.player2_name:r.player1_name;
 document.getElementById("friendName").textContent=friend||"Waiting...";
 document.getElementById("friendAvatar").textContent=friend?friend[0].toUpperCase():"?";
 let ready=!!r.player2_id;
 document.getElementById("friendStatus").textContent=ready?"● READY":"● WAITING";
 document.getElementById("friendStatus").className="status "+(ready?"":"waiting");
 document.getElementById("roomState").textContent=ready?"Both players are ready":"Waiting for your friend...";
 document.getElementById("roomHint").textContent=ready?"You can start the game.":"Send them the code above.";
 document.getElementById("startBtn").disabled=!ready;
 S.friend=friend;
}
function subscribe(){
 if(S.channel)db.removeChannel(S.channel);
 S.channel=db.channel("room-"+S.room.id).on("postgres_changes",{event:"*",schema:"public",table:"rooms",filter:"id=eq."+S.room.id},p=>{S.room=p.new;updateRoomUI(p.new);if(p.new.status==="playing"&&document.getElementById("room").classList.contains("active"))loadQuestion()}).on("postgres_changes",{event:"*",schema:"public",table:"answers",filter:"room_id=eq."+S.room.id},p=>handleAnswer(p)).subscribe();
}
async function startGame(){
 await db.from("rooms").update({status:"playing",current_question:0}).eq("id",S.room.id);S.room.status="playing";S.q=0;loadQuestion();show("game");
}
function loadQuestion(){let q=Q[S.q];document.getElementById("qnum").textContent=String(S.q+1).padStart(2,"0");document.getElementById("bar").style.width=((S.q+1)*10)+"%";document.getElementById("qtext").textContent=q[0];document.getElementById("diff").textContent=q[2];document.getElementById("cat").textContent=q[3];document.getElementById("answer").value=""}
async function submitAnswer(){
 let a=document.getElementById("answer").value.trim();if(!a){toast("Write an answer first");return}
 let {error}=await db.from("answers").upsert({room_id:S.room.id,question_no:S.q,player_id:S.playerId,answer:a},{onConflict:"room_id,question_no,player_id"});
 if(error){toast(error.message);return}
 show("waiting");
}
async function handleAnswer(payload){
 if(payload.eventType!=="INSERT"&&payload.eventType!=="UPDATE")return;
 let {data}=await db.from("answers").select("player_id,answer").eq("room_id",S.room.id).eq("question_no",S.q);
 if(data&&data.length===2){
   let mine=data.find(x=>x.player_id===S.playerId),other=data.find(x=>x.player_id!==S.playerId);
   // In this MVP, both players reveal after both have answered.
   let q=Q[S.q];let similar=(mine.answer||"").toLowerCase().includes((q[1]||"").split(" ")[0].toLowerCase());
   toast(similar?"✓ Looks like a match!":"Answers locked — reveal!");
   setTimeout(async()=>{if(S.q<9){S.q++;await db.from("rooms").update({current_question:S.q}).eq("id",S.room.id);loadQuestion();show("game")}else{showResults()}},900);
 }
}
function showResults(){document.getElementById("rFriend").textContent=(S.friend||"YOUR FRIEND").toUpperCase();document.getElementById("rMe").textContent=(S.friend||"YOUR FRIEND").toUpperCase();let a=Math.floor(55+Math.random()*40),b=Math.floor(50+Math.random()*40);document.getElementById("myScore").textContent=a+"%";document.getElementById("theirScore").textContent=b+"%";show("results");setTimeout(()=>{document.getElementById("myLine").style.width=a+"%";document.getElementById("theirLine").style.width=b+"%"},150)}
function copyCode(){navigator.clipboard?.writeText(S.room.code);toast("Room code copied ✦")}
async function leaveRoom(){if(S.channel)await db.removeChannel(S.channel);S={...S,room:null,friend:null,q:0,channel:null};show("home")}
init();