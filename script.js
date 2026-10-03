
const KEY="studentManagementStudents";
const SESSION="studentManagementLoggedIn";
const USERS="studentManagementUsers";
let students=JSON.parse(localStorage.getItem(KEY)||"[]");
let currentPage=1, rowsPerPage=5, sortDesc=true;

function saveStudents(){localStorage.setItem(KEY,JSON.stringify(students));}
function navigate(url){window.location.href=url;}
function toggleSidebar(){document.getElementById("sidebar")?.classList.toggle("collapsed");}
function toast(msg){const t=document.getElementById("toast");if(!t)return;t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200);}
function openLogout(e){e?.preventDefault();document.getElementById("logoutModal")?.classList.add("show");}
function closeLogout(){document.getElementById("logoutModal")?.classList.remove("show");}
function confirmLogout(){localStorage.removeItem(SESSION);navigate("index.html");}
function score(s){return Math.round(((+s.math||0)+(+s.science||0)+(+s.english||0))/3);}
function avatarFor(s){const arr=s.gender==="female"?["female1.jpeg","female2.jpeg","female3.jpeg","female4.jpeg"]:["male1.jpeg","male2.jpeg","male3.jpeg","male4.jpeg"];let n=[...s.name].reduce((a,c)=>a+c.charCodeAt(0),0);return "images/"+arr[n%arr.length];}
function initials(name){return name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();}

function requireLogin(){
 if(location.pathname.endsWith("index.html")||location.pathname.endsWith("/")) return;
 if(localStorage.getItem(SESSION)!=="1"){navigate("index.html");}
}

function getUsers(){
 let users=JSON.parse(localStorage.getItem(USERS)||"null");
 if(!Array.isArray(users)){
   users=[{name:"Admin",username:"admin",email:"admin@example.com",password:"admin"}];
   localStorage.setItem(USERS,JSON.stringify(users));
 }
 return users;
}
function initLogin(){
 const f=document.getElementById("loginForm"); if(!f)return;
 getUsers();
 f.addEventListener("submit",e=>{e.preventDefault();const u=document.getElementById("username").value.trim(),p=document.getElementById("password").value;
 const user=getUsers().find(x=>x.username.toLowerCase()===u.toLowerCase()&&x.password===p);
 if(user){localStorage.setItem(SESSION,"1");localStorage.setItem("studentManagementCurrentUser",JSON.stringify({name:user.name,username:user.username,email:user.email}));navigate("dashboard.html");}
 else toast("Invalid username or password");
 });
}
function initRegister(){
 const f=document.getElementById("registerForm"); if(!f)return;
 getUsers();
 f.addEventListener("submit",e=>{
   e.preventDefault();
   const name=document.getElementById("regName").value.trim();
   const username=document.getElementById("regUsername").value.trim();
   const email=document.getElementById("regEmail").value.trim();
   const password=document.getElementById("regPassword").value;
   const confirm=document.getElementById("regConfirm").value;
   if(password.length<4){toast("Password must be at least 4 characters");return;}
   if(password!==confirm){toast("Passwords do not match");return;}
   const users=getUsers();
   if(users.some(x=>x.username.toLowerCase()===username.toLowerCase())){toast("Username already exists");return;}
   if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())){toast("Email already exists");return;}
   users.push({name,username,email,password});
   localStorage.setItem(USERS,JSON.stringify(users));
   toast("Account created successfully");
   setTimeout(()=>navigate("index.html"),700);
 });
}

function initDashboard(){
 const total=document.getElementById("totalStudents"); if(!total)return;
 document.getElementById("welcomeTitle").textContent="Welcome back, Admin 👋";
 const scores=students.map(score), avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;
 total.textContent=students.length;document.getElementById("avgScore").textContent=avg;document.getElementById("topScore").textContent=scores.length?Math.max(...scores):0;
 const perf=document.getElementById("performanceList");perf.innerHTML="";
 students.slice().sort((a,b)=>score(b)-score(a)).forEach(s=>{perf.insertAdjacentHTML("beforeend",`<div class="student-row"><span>${esc(s.name)}</span><div class="bar"><div class="progress" style="width:${score(s)}%"></div></div><span>${score(s)}</span></div>`)});
 const grid=document.getElementById("studentGrid");grid.innerHTML="";
 students.slice(0,8).forEach(s=>grid.insertAdjacentHTML("beforeend",`<div class="student-card" data-id="${s.id}" onclick="openStudent(${s.id})"><div class="avatar"><img src="${avatarFor(s)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></div><h3>${esc(s.name)}</h3><p>Score: ${score(s)}</p></div>`));
 document.getElementById("noStudents").style.display=students.length?"none":"block";
}
function openStudent(id){
 const s=students.find(x=>x.id===id);if(!s)return;
 document.getElementById("modalName").textContent=s.name;document.getElementById("modalScore").textContent="Score: "+score(s);
 document.getElementById("modalAttendance").textContent=(s.attendance??"N/A")+"%";
 [["Math","modalMath",s.math],["Science","modalScience",s.science],["English","modalEnglish",s.english]].forEach(([n,id,v])=>{document.getElementById(id+"Text").textContent=" "+(+v||0);document.getElementById(id+"Bar").style.width=(+v||0)+"%";});
 document.getElementById("modalAvatar").innerHTML=`<img src="${avatarFor(s)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
 document.getElementById("studentModal").classList.add("show");
}
function closeStudentModal(){document.getElementById("studentModal")?.classList.remove("show");}

function initAdd(){
 const f=document.getElementById("addStudentForm");if(!f)return;
 const inputs=["math","science","english"].map(n=>f.querySelector(`[name=${n}]`));const preview=document.getElementById("scorePreview");
 function calc(){const vals=inputs.map(i=>+i.value||0);preview.textContent=inputs.every(i=>!i.value)?"Average Score: --":"Average Score: "+Math.round(vals.reduce((a,b)=>a+b,0)/3);}
 inputs.forEach(i=>i.addEventListener("input",calc));
 f.addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(f);const name=fd.get("name").trim(),email=fd.get("email").trim();
 if(!name||!email||!fd.get("gender")){toast("Please fill required fields");return;}
 const s={id:Date.now(),name,email,phone:fd.get("phone"),gender:fd.get("gender"),dob:fd.get("dob"),address:fd.get("address"),degree:fd.get("degree"),admission_date:fd.get("admission_date"),math:+fd.get("math")||0,science:+fd.get("science")||0,english:+fd.get("english")||0,attendance:100};
 students.push(s);saveStudents();recordActivity(`Added student: ${name}`);f.reset();preview.textContent="Average Score: --";toast("Student added successfully");setTimeout(()=>navigate("edit_students.html"),500);});
}

function renderEdit(){
 const body=document.getElementById("studentsTableBody");if(!body)return;
 const q=(document.getElementById("searchInput").value||"").toLowerCase();
 let list=students.filter(s=>(s.name+" "+s.email).toLowerCase().includes(q)).sort((a,b)=>sortDesc?score(b)-score(a):score(a)-score(b));
 const totalPages=Math.max(1,Math.ceil(list.length/rowsPerPage));if(currentPage>totalPages)currentPage=totalPages;
 const page=list.slice((currentPage-1)*rowsPerPage,currentPage*rowsPerPage);body.innerHTML="";
 page.forEach(s=>body.insertAdjacentHTML("beforeend",`<tr style="border-top:1px solid #eee;"><td><div style="display:flex;align-items:center;gap:12px;"><div class="avatar" style="width:40px;height:40px;font-size:14px;margin:0;"><img src="${avatarFor(s)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></div><div style="font-weight:600;">${esc(s.name)}</div></div></td><td style="color:gray;">${esc(s.email)}</td><td style="text-align:center;font-weight:600;">${score(s)}</td><td style="text-align:center;"><div class="action-group"><button class="icon-btn edit-btn" onclick="openEdit(${s.id})"><i class="ri-pencil-line"></i></button><button class="icon-btn delete-btn" onclick="deleteStudent(${s.id})"><i class="ri-delete-bin-line"></i></button></div></td></tr>`));
 document.getElementById("pageInfo").textContent=`Page ${currentPage} of ${totalPages} • ${list.length} students`;
 const p=document.getElementById("pagination");p.innerHTML="";
 for(let i=1;i<=totalPages;i++){const b=document.createElement("button");b.textContent=i;b.className=i===currentPage?"active":"";b.onclick=()=>{currentPage=i;renderEdit()};p.appendChild(b);}
}
function initEdit(){
 if(!document.getElementById("studentsTableBody"))return;
 document.getElementById("searchInput").addEventListener("input",()=>{currentPage=1;renderEdit()});
 document.getElementById("rowsSelect").addEventListener("change",e=>{rowsPerPage=+e.target.value;currentPage=1;renderEdit()});
 renderEdit();
}
function sortStudents(){sortDesc=!sortDesc;renderEdit();}
function deleteStudent(id){if(!confirm("Delete this student?"))return;students=students.filter(s=>s.id!==id);saveStudents();renderEdit();toast("Student deleted");}
function openEdit(id){
 const s=students.find(x=>x.id===id);if(!s)return;
 document.getElementById("editId").value=id;["Name","Dob","Gender","Email","Phone","Degree","Address","Math","Science","English"].forEach(k=>{const el=document.getElementById("edit"+k);if(el)el.value=s[k.toLowerCase()==="dob"?"dob":k.toLowerCase()==="gender"?"gender":k.toLowerCase()==="email"?"email":k.toLowerCase()==="phone"?"phone":k.toLowerCase()==="degree"?"degree":k.toLowerCase()==="address"?"address":k.toLowerCase()]??""});
 document.getElementById("editModal").classList.add("show");
}
function closeEditModal(){document.getElementById("editModal")?.classList.remove("show");}
function initEditForm(){
 const f=document.getElementById("editForm");if(!f)return;
 f.addEventListener("submit",e=>{e.preventDefault();const id=+document.getElementById("editId").value,s=students.find(x=>x.id===id);if(!s)return;
 s.name=document.getElementById("editName").value.trim();s.dob=document.getElementById("editDob").value;s.gender=document.getElementById("editGender").value;s.email=document.getElementById("editEmail").value.trim();s.phone=document.getElementById("editPhone").value.trim();s.degree=document.getElementById("editDegree").value;s.address=document.getElementById("editAddress").value;s.math=+document.getElementById("editMath").value||0;s.science=+document.getElementById("editScience").value||0;s.english=+document.getElementById("editEnglish").value||0;
 saveStudents();recordActivity(`Updated student: ${s.name}`);closeEditModal();renderEdit();toast("Student updated");
 });
}

let subjectChart,genderChart;
function initAnalytics(){
 const a=document.getElementById("aTotal");if(!a)return;
 const av=n=>students.length?Math.round(students.reduce((t,s)=>t+(+s[n]||0),0)/students.length):0;
 document.getElementById("aTotal").textContent=students.length;document.getElementById("aMath").textContent=av("math");document.getElementById("aScience").textContent=av("science");document.getElementById("aEnglish").textContent=av("english");
 const sorted=students.slice().sort((a,b)=>score(b)-score(a));document.getElementById("aTop").textContent=sorted[0]?.name||"N/A";document.getElementById("aLow").textContent=sorted.at(-1)?.name||"N/A";
 if(typeof Chart==="undefined")return;
 subjectChart?.destroy();genderChart?.destroy();
 subjectChart=new Chart(document.getElementById("subjectChart"),{type:"bar",data:{labels:["Math","Science","English"],datasets:[{label:"Average Score",data:[av("math"),av("science"),av("english")],backgroundColor:["rgba(99,102,241,.7)","rgba(139,92,246,.7)","rgba(168,85,247,.7)"],borderRadius:10}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
 const male=students.filter(s=>s.gender==="male").length,female=students.filter(s=>s.gender==="female").length,other=students.length-male-female;
 genderChart=new Chart(document.getElementById("genderChart"),{type:"doughnut",data:{labels:["Male","Female","Other"],datasets:[{data:[male,female,other],backgroundColor:["#3b82f6","#ef4444","#a855f7"],borderWidth:0}]},options:{cutout:"65%"}});
 document.getElementById("insight1").textContent=`Highest average subject: ${["Math","Science","English"][[av("math"),av("science"),av("english")].indexOf(Math.max(av("math"),av("science"),av("english")))]}.`;
 document.getElementById("insight2").textContent=students.length?`Current class average: ${Math.round(students.map(score).reduce((a,b)=>a+b,0)/students.length)}.`:"Add students to generate insights.";
}

function initLeaderboard(){
 const b=document.getElementById("leaderBody");if(!b)return;b.innerHTML="";
 students.slice().sort((a,b)=>score(b)-score(a)).forEach((s,i)=>b.insertAdjacentHTML("beforeend",`<tr><td>#${i+1}</td><td>${esc(s.name)}</td><td>${score(s)}</td><td>${s.attendance??100}%</td></tr>`));
}

function saveProfile(){toast("Profile saved locally");}
function changePassword(){const u=currentUser();if(!u){toast("Please login again");return;}const oldP=prompt("Current password");if(oldP===null)return;const users=getUsers();const user=users.find(x=>x.username===u.username);if(!user||user.password!==oldP){toast("Current password is incorrect");return;}const newP=prompt("New password (minimum 4 characters)");if(!newP)return;if(newP.length<4){toast("Password must be at least 4 characters");return;}const confirm=prompt("Confirm new password");if(newP!==confirm){toast("Passwords do not match");return;}user.password=newP;localStorage.setItem(USERS,JSON.stringify(users));toast("Password changed successfully");}
function initProfile(){
 const up=document.getElementById("profileUpload");if(up)up.addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{document.getElementById("profileImg").src=r.result;localStorage.setItem("profileImage",r.result)};r.readAsDataURL(f);});
 const img=localStorage.getItem("profileImage");if(img&&document.getElementById("profileImg"))document.getElementById("profileImg").src=img;
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

document.addEventListener("DOMContentLoaded",()=>{
 requireLogin();initLogin();initRegister();initDashboard();initAdd();initEdit();initEditForm();initAnalytics();initLeaderboard();initProfile();
 if(location.hash==="#profile"){document.querySelector(".cards")?.style.setProperty("display","none");document.querySelector(".performance")?.style.setProperty("display","none");document.querySelector(".students")?.style.setProperty("display","none");document.getElementById("profilePage")?.style.setProperty("display","block");}
});


/* =========================================================
   PRO FEATURES
   ========================================================= */
function currentUser(){
  try{return JSON.parse(localStorage.getItem("studentManagementCurrentUser")||"null");}catch(e){return null;}
}
function recordActivity(text){
  const list=JSON.parse(localStorage.getItem("studentManagementActivity")||"[]");
  list.unshift({text,time:new Date().toLocaleString()});
  localStorage.setItem("studentManagementActivity",JSON.stringify(list.slice(0,8)));
}
function exportStudentsCSV(){
  if(!students.length){toast("No students to export");return;}
  const headers=["Name","Email","Phone","Gender","DOB","Degree","Admission Date","Math","Science","English","Average","Attendance"];
  const rows=students.map(s=>[s.name,s.email,s.phone,s.gender,s.dob,s.degree,s.admission_date,s.math,s.science,s.english,score(s),s.attendance??100]);
  const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="student-management-data.csv";a.click();URL.revokeObjectURL(a.href);
  toast("Student data exported");
}
function addProControls(){
  if(document.body.classList.contains("login-body")) return;
  if(!document.querySelector(".mobile-menu-btn")){
    const b=document.createElement("button");b.className="mobile-menu-btn";b.setAttribute("aria-label","Open menu");b.innerHTML='<i class="ri-menu-line"></i>';b.onclick=openMobileMenu;document.body.appendChild(b);
    const ov=document.createElement("div");ov.className="mobile-overlay";ov.id="mobileOverlay";ov.onclick=closeMobileMenu;document.body.appendChild(ov);
  }
  if(!document.querySelector(".theme-toggle")){
    const b=document.createElement("button");b.className="theme-toggle";b.id="themeToggle";b.setAttribute("aria-label","Toggle theme");b.onclick=toggleTheme;document.body.appendChild(b);
  }
  applyThemeIcon();
}
function openMobileMenu(){document.getElementById("sidebar")?.classList.add("mobile-open");document.getElementById("mobileOverlay")?.classList.add("show");}
function closeMobileMenu(){document.getElementById("sidebar")?.classList.remove("mobile-open");document.getElementById("mobileOverlay")?.classList.remove("show");}
function toggleTheme(){document.body.classList.toggle("theme-dark");localStorage.setItem("studentTheme",document.body.classList.contains("theme-dark")?"dark":"light");applyThemeIcon();}
function applyThemeIcon(){const b=document.getElementById("themeToggle");if(!b)return;const dark=document.body.classList.contains("theme-dark");b.innerHTML=dark?'<i class="ri-sun-line"></i>':'<i class="ri-moon-line"></i>';b.title=dark?"Light mode":"Dark mode";}
function loadTheme(){if(localStorage.getItem("studentTheme")==="dark")document.body.classList.add("theme-dark");}
function addQuickActions(){
  const cards=document.querySelector(".cards");
  if(!document.getElementById("totalStudents") || document.querySelector(".quick-actions")) return;
  const box=document.createElement("div");box.className="quick-actions";box.innerHTML=`
    <button class="quick-action" onclick="navigate('add_student.html')"><i class="ri-user-add-line"></i><strong>Add Student</strong><span>Create a new record</span></button>
    <button class="quick-action" onclick="navigate('analytics.html')"><i class="ri-line-chart-line"></i><strong>View Analytics</strong><span>See class insights</span></button>
    <button class="quick-action" onclick="exportStudentsCSV()"><i class="ri-download-2-line"></i><strong>Export CSV</strong><span>Download student data</span></button>
    <button class="quick-action" onclick="toggleTheme()"><i class="ri-contrast-2-line"></i><strong>Change Theme</strong><span>Light / dark mode</span></button>`;
  cards?.parentNode.insertBefore(box,cards);
}
function addActivityPanel(){
  if(!document.getElementById("studentGrid") || document.querySelector(".activity-card")) return;
  const wrap=document.createElement("div");wrap.className="card activity-card";wrap.innerHTML='<h2 style="margin-bottom:14px;">⚡ Recent Activity</h2><div class="activity-list" id="activityList"></div>';
  document.querySelector(".students")?.parentNode.appendChild(wrap);
  const list=JSON.parse(localStorage.getItem("studentManagementActivity")||"[]");
  const el=document.getElementById("activityList");
  el.innerHTML=list.length?list.map(x=>`<div class="activity-item"><span class="activity-dot"></span><span>${esc(x.text)}</span><small>${esc(x.time)}</small></div>`).join(""):'<div class="activity-item"><span class="activity-dot"></span><span>No activity yet. Add your first student.</span></div>';
}
function enhanceProfileWelcome(){
  const u=currentUser();const t=document.getElementById("welcomeTitle");
  if(t&&u?.name)t.textContent=`Welcome back, ${u.name} 👋`;
}
function enhanceMobileNavigation(){
  document.querySelectorAll(".sidebar li").forEach(li=>li.addEventListener("click",()=>setTimeout(closeMobileMenu,50)));
}
function addSearchShortcut(){
  const s=document.getElementById("searchInput");if(!s)return;
  document.addEventListener("keydown",e=>{if(e.key==="/"&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="TEXTAREA"){e.preventDefault();s.focus();}});
}

/* Patch activity recording into existing actions without changing the original flow. */
const _saveStudentsOriginal=saveStudents;
saveStudents=function(){_saveStudentsOriginal();};
const _deleteStudentOriginal=deleteStudent;
deleteStudent=function(id){const s=students.find(x=>x.id===id);_deleteStudentOriginal(id);if(s)recordActivity(`Deleted student: ${s.name}`);};
const _saveProfileOriginal=saveProfile;
saveProfile=function(){_saveProfileOriginal();recordActivity("Profile updated");};

window.exportStudentsCSV=exportStudentsCSV;
window.openMobileMenu=openMobileMenu;
window.closeMobileMenu=closeMobileMenu;
window.toggleTheme=toggleTheme;

loadTheme();
document.addEventListener("DOMContentLoaded",()=>{
  addProControls();addQuickActions();addActivityPanel();enhanceProfileWelcome();enhanceMobileNavigation();addSearchShortcut();
});
