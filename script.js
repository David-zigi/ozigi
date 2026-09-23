(function(){
"use strict";

/* ============ firm data ============ */
var FIRM = {
  name:"Green Gavel Legal",
  phone1:"+234 803 452 9532", phone2:"+234 812 414 8118",
  wa:"2348034529532",
  email:"greengavellegal@gmail.com",
  address:"Suite B08, Kenuj O2 Mall, Off Oladipo Diya Road, Kaura District, FCT — Abuja, Nigeria"
};

var AREAS = [
  {t:"Corporate and Commercial Law",
   d:"Company formation and post-incorporation filings, shareholder and joint-venture agreements, commercial contracts, business restructuring, and day-to-day advisory for companies operating in and beyond Nigeria."},
  {t:"Intellectual Property Law",
   d:"Trademark, patent and copyright registration and renewals, licensing and assignment agreements, brand protection, and action against infringement."},
  {t:"Real Estate and Property Investments",
   d:"Title investigation and perfection, sale and lease documentation, developer and investor advisory, land use matters, and property dispute resolution."},
  {t:"Immigration Law",
   d:"Business and residence permits, regularisation of status, appeals and representation before the immigration authorities, and advice for individuals relocating to or from Nigeria."},
  {t:"Expatriate Mobility and Residency Services",
   d:"Expatriate quota applications and returns, CERPAC processing, temporary work permits, and compliance support for employers bringing in foreign staff."},
  {t:"Wills, Probate and Estate Planning",
   d:"Drafting and safekeeping of wills, trust structures, letters of administration and probate applications, and the orderly administration of estates."},
  {t:"Independent Investigations",
   d:"Discreet fact-finding for boards, employers and institutions — including misconduct and fraud inquiries — with evidence gathered to a standard that will hold up if the matter proceeds further."},
  {t:"Legal Advisory",
   d:"Standing counsel on transactions, ongoing commercial operations and regulatory questions, including retainer arrangements for organisations without in-house legal capacity."},
  {t:"Corporate Governance and Compliance",
   d:"Company secretarial services, board and committee support, governance reviews and board evaluation, statutory filings, and compliance frameworks and training."},
  {t:"Litigation and Dispute Resolution",
   d:"Civil and criminal litigation, asset recovery, procurement and family matters, mediation and arbitration — across all civil law jurisdictions in Nigeria."}
];

/* ============ small helpers ============ */
function $(s,r){return (r||document).querySelector(s);}
function el(t,c,x){var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.textContent=x; return e;}
document.getElementById("yr").textContent = new Date().getFullYear();

/* ============ nav ============ */
var navToggle=$("#navtoggle"), navLinks=$("#navlinks");
navToggle.addEventListener("click",function(){
  var open=navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open?"true":"false");
});
navLinks.addEventListener("click",function(e){ if(e.target.tagName==="A"){ navLinks.classList.remove("open"); navToggle.setAttribute("aria-expanded","false"); }});

/* ============ practice index ============ */
var idx=$("#practiceIndex"), areaSel=$("#bArea");
AREAS.forEach(function(a,i){
  var item=el("div","item");
  var btn=el("button","item-head"); btn.type="button";
  btn.setAttribute("aria-expanded","false"); btn.id="ph"+i;
  btn.appendChild(document.createTextNode(a.t));
  var plus=el("span","plus"); plus.setAttribute("aria-hidden","true"); btn.appendChild(plus);
  var body=el("div","item-body"); body.setAttribute("role","region"); body.setAttribute("aria-labelledby","ph"+i);
  body.appendChild(el("p",null,a.d));
  var go=el("button","btn btn-ghost btn-sm","Book about this"); go.type="button";
  go.addEventListener("click",function(){ prefill(a.t); });
  body.appendChild(go);
  btn.addEventListener("click",function(){
    var open=item.classList.toggle("open");
    btn.setAttribute("aria-expanded", open?"true":"false");
  });
  item.appendChild(btn); item.appendChild(body); idx.appendChild(item);

  var o=el("option",null,a.t); o.value=a.t; areaSel.appendChild(o);
});
var other=el("option",null,"I'm not sure yet"); other.value="I'm not sure yet"; areaSel.appendChild(other);

function prefill(area){
  if(area){ areaSel.value = [].some.call(areaSel.options,function(o){return o.value===area;}) ? area : "I'm not sure yet"; }
  var b=document.getElementById("book");
  b.scrollIntoView({behavior:"smooth",block:"start"});
  setTimeout(function(){ $("#bName").focus({preventScroll:true}); },450);
}

/* ============ booking ============ */
var form=$("#bookForm"), result=$("#bookResult"), dateInput=$("#bDate");
(function(){
  var t=new Date(); t.setHours(0,0,0,0);
  dateInput.min = t.toISOString().slice(0,10);
  var n=new Date(t); do{ n.setDate(n.getDate()+1); }while(n.getDay()===0||n.getDay()===6);
  dateInput.value = n.toISOString().slice(0,10);
})();

function setBad(node,bad){ node.closest(".f").classList.toggle("bad",!!bad); }

var dbP = null;
if (window.claude && typeof window.claude.use === "function") {
  try { dbP = window.claude.use("db"); } catch(e){ dbP = null; }
}

form.addEventListener("submit", async function(e){
  e.preventDefault();
  var name=$("#bName"), email=$("#bEmail"), phone=$("#bPhone"), consent=$("#bConsent");
  var ok=true;
  if(!name.value.trim()){ setBad(name,1); ok=false; } else setBad(name,0);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){ setBad(email,1); ok=false; } else setBad(email,0);
  if(phone.value.replace(/\D/g,"").length<7){ setBad(phone,1); ok=false; } else setBad(phone,0);
  if(!areaSel.value){ setBad(areaSel,1); ok=false; } else setBad(areaSel,0);
  var d=dateInput.value ? new Date(dateInput.value+"T00:00:00") : null;
  var today=new Date(); today.setHours(0,0,0,0);
  if(!d || d<today || d.getDay()===0 || d.getDay()===6){ setBad(dateInput,1); ok=false; } else setBad(dateInput,0);
  $("#consentErr").style.display = consent.checked ? "none" : "block";
  if(!consent.checked) ok=false;
  if(!ok){ (form.querySelector(".f.bad input, .f.bad select")||consent).focus(); return; }

  var btn=$("#bookSubmit"); btn.disabled=true; var old=btn.textContent; btn.textContent="Sending…";

  var ref = "GGL-" + dateInput.value.replace(/-/g,"").slice(2) + "-" + Math.random().toString(36).slice(2,6).toUpperCase();
  var booking = {
    ref: ref,
    name: name.value.trim(),
    organisation: $("#bOrg").value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    practiceArea: areaSel.value,
    meetingMode: (form.querySelector('input[name="mode"]:checked')||{}).value || "",
    preferredDate: dateInput.value,
    preferredTime: $("#bTime").value,
    summary: $("#bNotes").value.trim(),
    submittedAt: new Date().toISOString()
  };

  var stored=false;
  try{
    var db = dbP ? await dbP : null;
    if(db){ await db.collection("bookings").add(booking); stored=true; }
  }catch(err){ stored=false; }

  var lines = [
    "Consultation request — " + ref,
    "",
    "Name: " + booking.name,
    booking.organisation ? "Organisation: " + booking.organisation : null,
    "Email: " + booking.email,
    "Phone: " + booking.phone,
    "Practice area: " + booking.practiceArea,
    "Meeting: " + booking.meetingMode,
    "Preferred: " + booking.preferredDate + " at " + booking.preferredTime + " (WAT)",
    booking.summary ? "" : null,
    booking.summary ? "Summary: " + booking.summary : null
  ].filter(function(x){return x!==null;}).join("\n");

  var mailto = "mailto:" + FIRM.email + "?subject=" + encodeURIComponent("Consultation request " + ref) + "&body=" + encodeURIComponent(lines);
  var wa = "https://wa.me/" + FIRM.wa + "?text=" + encodeURIComponent(lines);

  result.innerHTML = "";
  var h=el("h3",null, stored ? "Request received" : "Almost there — send it to the firm");
  var refLine=el("div","ref", ref);
  var p=el("p","muted");
  p.style.marginTop="10px";
  p.textContent = stored
    ? "Quote this reference in any follow-up. The firm will confirm your appointment by email or phone within one business day. You can also send it directly using the buttons below."
    : "Your request could not be lodged automatically from this device. Send it to the firm in one tap — the message below is already filled in with your details.";
  var handoff=el("div","handoff");
  var a1=el("a","btn btn-gold btn-sm","Send by email"); a1.href=mailto;
  var a2=el("a","btn btn-ghost btn-sm","Send on WhatsApp"); a2.href=wa; a2.target="_blank"; a2.rel="noopener";
  handoff.appendChild(a1); handoff.appendChild(a2);
  result.appendChild(h); result.appendChild(refLine); result.appendChild(p); result.appendChild(handoff);
  result.classList.add("show");
  result.scrollIntoView({behavior:"smooth",block:"nearest"});
  btn.disabled=false; btn.textContent=old;
  if(stored){ form.reset(); $("#consentErr").style.display="none"; }
});

/* ============ chat assistant ============ */
var chat=$("#chat"), fab=$("#chatFab"), log=$("#chatLog"), input=$("#chatInput"),
    sendBtn=$("#chatSend"), status=$("#chatStatus"), chips=null;

var KB = "You are the assistant on the website of " + FIRM.name + " (GGL), a Nigerian law firm.\n\n"
+ "FIRM FACTS\n"
+ "- Registered with Nigeria's Corporate Affairs Commission in 2013. Tagline: 'Your innovative attorneys'.\n"
+ "- Office: " + FIRM.address + ". Phones: " + FIRM.phone1 + " and " + FIRM.phone2 + ". Email: " + FIRM.email + ".\n"
+ "- Consulting hours (WAT): Monday-Thursday 9:00am-5:00pm; Friday 9:00am-4:00pm; closed at weekends.\n"
+ "- Practises across all civil law jurisdictions in Nigeria. Clients include government agencies, airlines, NGOs, banks and financial institutions, real estate developers and investors, family-owned companies, and individuals.\n"
+ "- Vision: accurate in analysis, meticulous in research, innovative in legal service delivery. Mission: promote the rule of law and advance legal knowledge through ethical, efficient, client-focused practice.\n"
+ "- Core values: professional excellence; integrity and confidentiality; innovation and efficiency; proactivity and responsiveness; client-centric service.\n\n"
+ "PRACTICE AREAS\n"
+ AREAS.map(function(a){return "- " + a.t + ": " + a.d;}).join("\n") + "\n\n"
+ "THE TEAM\n"
+ "- Elizabeth Orage, Esq., ACIS — Managing Partner. Chartered Secretary and Administrator; litigation, taxation, immigration, corporate and commercial law, governance and compliance, estate planning, real estate. Company Secretary and Legal Adviser to several organisations.\n"
+ "- Clement Abiola Akinwale, Esq. — Senior Partner. Called to the Nigerian Bar June 1990; criminal and civil litigation, procurement, family law, commercial practice, property law and documentation, mediation and arbitration.\n"
+ "- Chukwuemeka Augustine Ukauzo, Esq. — Senior Litigation Partner. Called 2009; criminal and civil litigation, energy, oil and gas, asset recovery, telecommunications.\n"
+ "- Osinachi Chinyere Nwanedo — Senior Partner. Adoption law, immigration law, intellectual property.\n"
+ "- Abdulrazak Mohammad — Associate. Corporate governance and compliance, commercial law, banking and finance.\n\n"
+ "HOW TO BEHAVE\n"
+ "- You give general information about the firm and help visitors book a consultation. You are not a lawyer and you never give legal advice, never predict outcomes, never interpret a visitor's documents, contracts or facts, and never quote fees. If a visitor describes their situation, acknowledge it briefly, say a lawyer needs to look at it properly, and offer to open the booking form.\n"
+ "- Answer only from the facts above. If you do not know something (fees, timelines, whether the firm can take a specific case, court outcomes), say so plainly and point to the booking form, the phone numbers or the email address.\n"
+ "- If a visitor sounds like they are in an emergency, or a deadline is imminent, tell them to call " + FIRM.phone1 + " rather than wait for a reply.\n"
+ "- Use the start_booking tool when someone wants to book, make an appointment, speak to a lawyer, or asks how to get started. Pass the closest practice area when you can tell.\n"
+ "- Write in plain British English, warm and professional. Two to four sentences normally. No markdown, no bullet symbols, no headings — plain sentences only. Never invent lawyers, offices, prices or services.";

var history = [];
var sampleFn = null, sampleDead = false, busy = false, opened = false;

if (window.claude && typeof window.claude.use === "function") {
  window.claude.use("sample").then(function(fn){
    sampleFn = fn || null;
    if(!sampleFn) fallbackNotice();
  }).catch(function(){ fallbackNotice(); });
} else { setTimeout(fallbackNotice, 300); }

function fallbackNotice(){
  sampleFn = null;
  status.textContent = "Answering from the firm's profile";
}

function addMsg(kind, text){
  var m=el("div","msg "+kind); m.textContent=text;
  log.appendChild(m); log.scrollTop=log.scrollHeight; return m;
}
function addTyping(){
  var m=el("div","msg bot"); var d=el("span","dots");
  d.appendChild(el("span")); d.appendChild(el("span")); d.appendChild(el("span"));
  m.appendChild(d); log.appendChild(m); log.scrollTop=log.scrollHeight; return m;
}

var SUGGESTIONS = ["What do you handle?","Book a consultation","Where is the office?"];
function renderChips(){
  chips = el("div","chips");
  SUGGESTIONS.forEach(function(s){
    var c=el("button","chip",s); c.type="button";
    c.addEventListener("click",function(){ clearChips(); send(s); });
    chips.appendChild(c);
  });
  log.appendChild(chips); log.scrollTop=log.scrollHeight;
}
function clearChips(){ if(chips){ chips.remove(); chips=null; } }

function openChat(){
  chat.classList.add("open"); fab.classList.add("hide");
  if(!opened){
    opened=true;
    addMsg("bot","Hello, and welcome to Green Gavel Legal. I can explain what the firm does, point you to the right lawyer, and help you book a consultation. What brings you here today?");
    renderChips();
  }
  setTimeout(function(){ input.focus(); },60);
}
function closeChat(){ chat.classList.remove("open"); fab.classList.remove("hide"); fab.focus(); }
fab.addEventListener("click",openChat);
$("#chatClose").addEventListener("click",closeChat);
document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&chat.classList.contains("open")) closeChat(); });

input.addEventListener("input",function(){ input.style.height="auto"; input.style.height=Math.min(input.scrollHeight,110)+"px"; });
input.addEventListener("keydown",function(e){
  if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); submitChat(); }
});
sendBtn.addEventListener("click",submitChat);
function submitChat(){
  var v=input.value.trim(); if(!v||busy) return;
  input.value=""; input.style.height="auto"; clearChips(); send(v);
}

var BOOK_TOOL = {
  name:"start_booking",
  description:"Opens the booking form on this page, scrolls the visitor to it and preselects a practice area. Returns a short confirmation that the form is now open and waiting for their details. Use it whenever the visitor wants to book, make an appointment, or speak to a lawyer.",
  inputSchema:{type:"object",properties:{
    practice_area:{type:"string",description:"The closest practice area from the firm's list, or leave empty if unclear."}
  }},
  execute:function(inp){
    var a = inp && inp.practice_area ? String(inp.practice_area) : "";
    prefill(a);
    return "The booking form is now open on the page" + (a ? " with '" + a + "' preselected" : "") + ". The visitor needs to fill in their name, email, phone, preferred date and time, then press 'Send booking request'.";
  }
};

async function send(text){
  busy=true; sendBtn.disabled=true;
  addMsg("user",text);
  var bubble=addTyping();

  if(sampleFn && !sampleDead){
    var turns = [{role:"user",content:KB+"\n\nAcknowledge with one word."},{role:"assistant",content:"Ready."}];
    history.slice(-8).forEach(function(t){ turns.push(t); });
    turns.push({role:"user",content:text});
    try{
      var res = await sampleFn(turns,{
        cache:false, modelTier:"default", tools:[BOOK_TOOL],
        onText:function(u){ bubble.textContent=u.text; log.scrollTop=log.scrollHeight; }
      });
      var answer = (res && res.text || "").trim() || "I'm not sure how to answer that one — the firm can help directly on " + FIRM.phone1 + ".";
      bubble.textContent = answer;
      history.push({role:"user",content:text});
      history.push({role:"assistant",content:answer});
    }catch(err){
      var code = err && err.code;
      if(code==="not_granted" || code==="capability_disabled" || code==="capability_removed"){
        sampleDead=true; fallbackNotice();
        bubble.textContent = localAnswer(text);
      } else if(code==="rate_limited"){
        bubble.textContent = "I've hit a limit for now. Please try again shortly, or reach the firm on " + FIRM.phone1 + ".";
      } else if(code==="cancelled"){
        bubble.remove();
      } else {
        bubble.textContent = localAnswer(text);
      }
    }
  } else {
    await new Promise(function(r){ setTimeout(r,350); });
    bubble.textContent = localAnswer(text);
  }

  log.scrollTop=log.scrollHeight;
  busy=false; sendBtn.disabled=false; input.focus();
}

/* rule-based answers when the AI assistant is unavailable */
function localAnswer(q){
  var s=q.toLowerCase();
  var hit = AREAS.filter(function(a){
    var words = a.t.toLowerCase().split(/[^a-z]+/).filter(function(w){return w.length>4;});
    return words.some(function(w){ return s.indexOf(w)>-1; });
  });
  if(/book|appoint|consult|meet|schedul|speak to|talk to|lawyer|hire|engage/.test(s)){
    prefill(hit.length?hit[0].t:"");
    return "I've opened the booking form for you" + (hit.length ? " with " + hit[0].t + " preselected" : "") + ". Fill in your name, email, phone and a preferred weekday, and the firm will confirm within one business day. You can also call " + FIRM.phone1 + ".";
  }
  if(hit.length) return hit[0].t + " — " + hit[0].d + " If you'd like to take it further, say 'book' and I'll open the consultation form.";
  if(/where|address|locat|office|abuja|direction/.test(s)) return "The firm's office is at " + FIRM.address + ".";
  if(/phone|call|number|contact|email|reach/.test(s)) return "You can call " + FIRM.phone1 + " or " + FIRM.phone2 + ", or email " + FIRM.email + ". The booking form on this page is usually the quickest route.";
  if(/hour|open|time|when|weekend|saturday|sunday/.test(s)) return "Consulting hours are Monday to Thursday, 9:00am to 5:00pm, and Friday until 4:00pm, West Africa Time. The office is closed at weekends.";
  if(/who|team|partner|lawyer|staff|people|attorney/.test(s)) return "The firm is led by Elizabeth Orage, Esq., ACIS, as Managing Partner, with Clement Abiola Akinwale and Osinachi Chinyere Nwanedo as Senior Partners, Chukwuemeka Augustine Ukauzo as Senior Litigation Partner, and Abdulrazak Mohammad as Associate. Their areas are set out under 'Our people' on this page.";
  if(/what do you|practice|service|areas|handle|offer|do you do/.test(s)) return "The firm handles corporate and commercial law, intellectual property, real estate and property investment, immigration, expatriate mobility and residency, wills and probate, independent investigations, legal advisory, corporate governance and compliance, and litigation and dispute resolution.";
  if(/fee|cost|price|charge|how much/.test(s)) return "Fees depend on the matter, so the firm quotes them after an initial consultation. Send a booking request or call " + FIRM.phone1 + " and someone will discuss it with you.";
  if(/advice|should i|can i sue|my case|is it legal|do i have/.test(s)) return "I can't advise on your situation — that needs a lawyer who has seen the facts. Say 'book' and I'll open the consultation form, or call " + FIRM.phone1 + ".";
  if(/hi|hello|good (morning|afternoon|evening)|hey/.test(s)) return "Hello. I can tell you about the firm's practice areas, its lawyers, or help you book a consultation. What would you like to know?";
  return "I can help with the firm's practice areas, its lawyers, where it's based, and booking a consultation. For anything about your own matter, please call " + FIRM.phone1 + " or send a booking request from this page.";
}
})();