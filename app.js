const STORAGE_KEY = "dompetku_transactions_v1";
const BUDGET_KEY = "dompetku_budget_v1";
const $ = (id) => document.getElementById(id);
const rupiah = (value) => new Intl.NumberFormat("id-ID", {style:"currency",currency:"IDR",maximumFractionDigits:0}).format(value || 0);
const localDate = (date = new Date()) => {
  const y = date.getFullYear(), m = String(date.getMonth()+1).padStart(2,"0"), d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
};
let transactions = loadTransactions();
let budget = Number(localStorage.getItem(BUDGET_KEY) || 0);

function loadTransactions() {
  try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); }
function dateLabel(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"});
}
function timeLabel(timestamp) {
  return new Date(timestamp).toLocaleTimeString("id-ID", {hour:"2-digit", minute:"2-digit", hour12:false});
}
function sum(items, type) { return items.filter(t => !type || t.type === type).reduce((total,t)=>total+Number(t.amount),0); }
function inCurrentWeek(dateString) {
  const date = new Date(`${dateString}T12:00:00`), now = new Date();
  const start = new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const day = (start.getDay()+6)%7; start.setDate(start.getDate()-day);
  const end = new Date(start); end.setDate(start.getDate()+7);
  return date >= start && date < end;
}
function inCurrentMonth(dateString) {
  const d = new Date(`${dateString}T12:00:00`), now = new Date();
  return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth();
}
function render() {
  const today = localDate();
  $("todayLabel").textContent = new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const totalIncome = sum(transactions,"income"), totalExpense = sum(transactions,"expense");
  $("balanceTotal").textContent = rupiah(totalIncome-totalExpense);
  const monthItems = transactions.filter(t=>inCurrentMonth(t.date));
  $("incomeMonth").textContent = rupiah(sum(monthItems,"income"));
  $("expenseMonth").textContent = rupiah(sum(monthItems,"expense"));
  $("expenseToday").textContent = rupiah(sum(transactions.filter(t=>t.date===today),"expense"));
  renderPeriod();
  renderBudget();
  renderTransactions();
}
function renderPeriod() {
  const period = $("periodSelect").value, today = localDate();
  let items = transactions.filter(t=>t.type==="expense");
  if (period==="day") items = items.filter(t=>t.date===today);
  if (period==="week") items = items.filter(t=>inCurrentWeek(t.date));
  if (period==="month") items = items.filter(t=>inCurrentMonth(t.date));
  $("periodTotal").textContent = rupiah(sum(items));
  const chart = $("chart"); chart.innerHTML = "";
  let buckets = [];
  if(period==="day") {
    buckets = Array.from({length:8},(_,i)=>{const h=i*3;return {key:String(h).padStart(2,"0"),label:`${String(h).padStart(2,"0")}.00`,match:t=>t.date===today && new Date(t.createdAt).getHours()>=h && new Date(t.createdAt).getHours()<h+3};});
  } else if(period==="week") {
    const now = new Date(), start = new Date(now.getFullYear(),now.getMonth(),now.getDate());
    start.setDate(start.getDate()-((start.getDay()+6)%7));
    buckets = Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);const key=localDate(d);return {key,label:d.toLocaleDateString("id-ID",{weekday:"short"}),match:t=>t.date===key};});
  } else {
    const now=new Date(), days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
    buckets=Array.from({length:days},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth(),i+1);const key=localDate(d);return {key,label:String(i+1),match:t=>t.date===key};});
  }
  const values=buckets.map(b=>items.filter(b.match).reduce((s,t)=>s+Number(t.amount),0));
  const max=Math.max(...values,1);
  buckets.forEach((b,i)=>{
    const col=document.createElement("div");col.className="chart-column";
    const track=document.createElement("div");track.className="bar-track";
    const bar=document.createElement("div");bar.className="bar"+(b.key===today?" today":"");bar.style.height=`${Math.max(values[i] ? 5 : 2, values[i]/max*100)}%`;bar.title=`${b.label}: ${rupiah(values[i])}`;
    track.append(bar);
    const label=document.createElement("span");label.className="bar-label";label.textContent=b.label;
    col.append(track,label);chart.append(col);
  });
}
function renderBudget() {
  $("budgetInput").value = budget || "";
  const spent=sum(transactions.filter(t=>inCurrentMonth(t.date)),"expense");
  const remaining=budget-spent, pct=budget>0?Math.min(100,spent/budget*100):0;
  $("budgetBar").style.width=`${pct}%`;
  $("budgetBar").style.background=spent>budget?"#d64f49":"#16865b";
  $("budgetSpent").textContent=`Terpakai ${rupiah(spent)}`;
  $("budgetRemaining").textContent=`Sisa ${rupiah(remaining)}`;
  $("budgetRemaining").style.color=remaining<0?"#c44c48":"#168052";
  $("budgetMessage").textContent=budget<=0?"Atur anggaran agar pengeluaran lebih terkontrol.":spent>budget?"Anggaran terlampaui. Periksa kembali pengeluaranmu.":`${Math.round(pct)}% anggaran sudah digunakan.`;
}
function renderTransactions() {
  const body=$("transactionRows");body.innerHTML="";
  const sorted=[...transactions].sort((a,b)=>b.createdAt-a.createdAt);
  $("emptyState").style.display=sorted.length?"none":"block";
  sorted.slice(0,50).forEach(t=>{
    const tr=document.createElement("tr");
    const name=document.createElement("td");name.innerHTML=`<div class="transaction-name"></div><div class="transaction-note"></div>`;name.children[0].textContent=t.title;name.children[1].textContent=t.note||"";
    const category=document.createElement("td");category.textContent=t.category;
    const date=document.createElement("td");date.innerHTML=`<div>${dateLabel(t.date)}</div><div class="transaction-note"></div>`;date.children[1].textContent=timeLabel(t.createdAt);
    const type=document.createElement("td");type.innerHTML=`<span class="pill ${t.type}">${t.type==="income"?"Pemasukan":"Pengeluaran"}</span>`;
    const amount=document.createElement("td");amount.className=t.type==="income"?"money-income":"money-expense";amount.textContent=`${t.type==="income"?"+":"−"}${rupiah(t.amount)}`;
    const action=document.createElement("td");const del=document.createElement("button");del.className="delete-btn";del.textContent="×";del.title="Hapus transaksi";del.setAttribute("aria-label",`Hapus ${t.title}`);del.addEventListener("click",()=>deleteTransaction(t.id));action.append(del);
    [name,category,date,type,amount,action].forEach(td=>tr.append(td));body.append(tr);
  });
}
function deleteTransaction(id) {
  const item=transactions.find(t=>t.id===id);
  if(!item || !confirm(`Hapus transaksi "${item.title}"?`)) return;
  transactions=transactions.filter(t=>t.id!==id);save();render();
}
const dialog=$("transactionDialog");
$("openFormBtn").addEventListener("click",()=>{dialog.showModal();});
$("closeFormBtn").addEventListener("click",()=>dialog.close());
$("typeInput").addEventListener("change",()=>{if($("typeInput").value==="income") $("categoryInput").value="Gaji/Uang saku";else if($("categoryInput").value==="Gaji/Uang saku") $("categoryInput").value="Makanan";});
$("transactionForm").addEventListener("submit",e=>{
  e.preventDefault();
  const amount=Number($("amountInput").value);
  if(!Number.isFinite(amount)||amount<=0){alert("Masukkan nominal lebih dari nol.");return;}
  transactions.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title:$("titleInput").value.trim(),type:$("typeInput").value,amount,category:$("categoryInput").value,date:localDate(),note:$("noteInput").value.trim(),createdAt:Date.now()});
  save();render();e.target.reset();dialog.close();
});
$("periodSelect").addEventListener("change",renderPeriod);
$("budgetForm").addEventListener("submit",e=>{e.preventDefault();budget=Math.max(0,Number($("budgetInput").value)||0);localStorage.setItem(BUDGET_KEY,String(budget));renderBudget();alert("Anggaran tersimpan.");});
$("exportBtn").addEventListener("click",()=>{
  if(!transactions.length){alert("Belum ada transaksi untuk diekspor.");return;}
  const headers=["Tanggal","Jam","Nama transaksi","Jenis","Kategori","Nominal (Rupiah)","Catatan"];
  const rows=transactions.slice().sort((a,b)=>a.createdAt-b.createdAt).map(t=>[t.date,timeLabel(t.createdAt),t.title,t.type==="income"?"Pemasukan":"Pengeluaran",t.category,t.amount,t.note||""]);
  const csv=[headers,...rows].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";")).join("\r\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`laporan-dompetku-${localDate()}.csv`;a.click();URL.revokeObjectURL(url);
});
render();
