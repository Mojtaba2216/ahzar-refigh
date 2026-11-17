import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, serverTimestamp, remove } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js';

// Firebase Console > Project settings: paste your web app values here.
const firebaseConfig = { apiKey:'YOUR_API_KEY', authDomain:'YOUR_PROJECT.firebaseapp.com', databaseURL:'https://YOUR_PROJECT-default-rtdb.firebaseio.com', projectId:'YOUR_PROJECT', storageBucket:'YOUR_PROJECT.appspot.com', messagingSenderId:'YOUR_SENDER_ID', appId:'YOUR_APP_ID' };
const vapidKey='YOUR_WEB_PUSH_CERTIFICATE_KEY_PAIR';
const demoMode=firebaseConfig.apiKey.startsWith('YOUR_');
let db=null, messaging=null, currentUser='', uid=crypto.randomUUID(), messagesRef=null, localMessages=[];
const USERS=['فردین','دوست ۱','دوست ۲','دوست ۳','دوست ۴'];
const $=s=>document.querySelector(s); const toast=t=>{const el=$('#toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600)};
function render(){const box=$('#messages');box.innerHTML=localMessages.length?localMessages.slice(-30).map(m=>`<div class="message ${m.uid===uid?'mine':''}"><div>${m.text}</div><div class="time">${m.uid===uid?'شما':'دوست'} · ${new Date(m.ts||Date.now()).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})}</div></div>`).join(''):'<div class="empty">هنوز پیامی نیست.</div>';box.scrollTop=box.scrollHeight}
function addMessage(text,mine=true,from=currentUser,to=''){localMessages.push({text,uid:mine?uid:'friend',from,to,ts:Date.now()});render()}
function setOnline(on){$('.dot').classList.toggle('online',on);$('.status span:last-child').textContent=on?'متصل هستید':'در حال اتصال…'}
async function join(name){currentUser=name;uid=crypto.randomUUID();localStorage.setItem('user',name);$('#userLabel').textContent=name;$('#joinCard').classList.add('hidden');$('#appCard').classList.remove('hidden');
 const target=$('#targetInput');target.innerHTML='<option value="">انتخاب دوست</option>'+USERS.filter(u=>u!==name).map(u=>`<option>${u}</option>`).join('');
 if(demoMode){setOnline(true);addMessage('حالت نمایشی فعال است؛ برای اتصال پنج گوشی، Firebase را در app.js تنظیم کن.',false,'سیستم');return}
 db=getDatabase(initializeApp(firebaseConfig));messagesRef=ref(db,'messages');onChildAdded(messagesRef,s=>{const m=s.val();if(m.uid!==uid&&(!m.to||m.to===currentUser)){addMessage(m.text,false,m.from,m.to);toast(`${m.from||'دوست'}: ${m.text}`);}});setOnline(true);
 try{messaging=getMessaging();if(Notification.permission==='default')$('#permissionNotice').classList.remove('hidden');if(Notification.permission==='granted')await registerPush();onMessage(m=>toast(m.notification?.body||'پیام جدید داری'));}catch(e){console.warn(e)}
}
async function registerPush(){if(!messaging||vapidKey.startsWith('YOUR_'))return;const token=await getToken(messaging,{vapidKey,serviceWorkerRegistration:await navigator.serviceWorker.register('./sw.js')});await set(ref(db,`tokens/${currentUser}`),token);$('#permissionNotice').classList.add('hidden');toast('اعلان‌ها فعال شد');}
async function send(text){const to=$('#targetInput').value;if(!to){toast('اول دوستت را انتخاب کن');return}if(demoMode){addMessage(text,true,currentUser,to);toast('در حالت نمایشی ثبت شد');return}await push(messagesRef,{text,uid,from:currentUser,to,ts:serverTimestamp()});addMessage(text,true,currentUser,to)}
$('#joinBtn').onclick=()=>{const n=$('#userInput').value;if(!n){$('#joinError').textContent='نامت را انتخاب کن.';return}join(n)};document.querySelectorAll('.call-btn').forEach(b=>b.onclick=()=>send(b.dataset.kind==='smoke'?'سیگار می‌کشی؟':'سیگار داری؟'));$('#replyBtn').onclick=()=>send('آره آره');$('#clearBtn').onclick=async()=>{localMessages=[];render();};$('#leaveBtn').onclick=()=>{localStorage.removeItem('user');location.reload()};$('#notifyBtn').onclick=async()=>{const p=await Notification.requestPermission();if(p==='granted')await registerPush()};
const saved=localStorage.getItem('user');if(saved&&USERS.includes(saved))join(saved);render();
