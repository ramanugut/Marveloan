import { db } from './firebase-config.js';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';

const PAGE_SIZE = 10;

let customers = [];
let loans = [];
const tbody = document.querySelector('#customersTable tbody');
const customersCount = document.getElementById('customersCount');
const statsCards = document.getElementById('statsCards');
const pagination = document.getElementById('pagination');
let filtered = [];
let currentPage = 1;

async function loadData(){
    try{
        const custSnap = await getDocs(collection(db,'customers'));
        customers = custSnap.docs.map(d=>d.data());
        const loanSnap = await getDocs(collection(db,'loans'));
        loans = loanSnap.docs.map(d=>d.data());
        customers.forEach(c=>{
            if(!c.status) c.status='active';
            if(!c.creditScore) c.creditScore=Math.floor(620+Math.random()*130);
        });
    }catch(err){
        console.error('Firebase load failed', err);
        customers = [];
        loans = [];
    }
    applyFilters();
}

function computeStats(list){
    const total = list.length;
    const active = list.filter(c=>c.status==='active').length;
    const now = Date.now();
    const month = list.filter(c=> now - parseInt(c.id) <= 30*24*60*60*1000 ).length;
    const pending = list.filter(c=>c.status==='pending').length;
    statsCards.innerHTML = `
        <div class="stat-card"><div class="stat-number">${total}</div><div class="stat-label">Total Customers</div></div>
        <div class="stat-card"><div class="stat-number">${active}</div><div class="stat-label">Active Customers</div></div>
        <div class="stat-card"><div class="stat-number">${month}</div><div class="stat-label">New This Month</div></div>
        <div class="stat-card"><div class="stat-number">${pending}</div><div class="stat-label">Pending Review</div></div>`;
}

function getLoanInfo(id){
    const custLoans = loans.filter(l=>l.clientId==id);
    const active = custLoans.filter(l=>l.status!=='Closed');
    const total = custLoans.reduce((s,l)=>s+ (parseFloat(l.amount)||0),0);
    return {activeCount:active.length,totalBorrowed:total};
}

function formatMoney(n){return 'R '+(n||0).toLocaleString();}

function renderTable(pageList){
    tbody.innerHTML='';
    pageList.forEach(c=>{
        const {activeCount,totalBorrowed} = getLoanInfo(c.id);
        const tr=document.createElement('tr');
        tr.innerHTML=`
            <td><input type="checkbox" data-id="${c.id}" class="rowCheck"></td>
            <td><div class="customer-info"><div class="customer-avatar" style="background:#4caf50">${(c.firstName?c.firstName[0]:'')+(c.lastName?c.lastName[0]:'')}</div><div class="customer-details"><h4>${c.firstName||''} ${c.lastName||''}</h4><div class="customer-id">${c.nationalId||''}</div></div></div></td>
            <td><div>${c.phoneNumber||''}</div><div style="font-size:.75rem;opacity:.7;">${c.email||''}</div></td>
            <td><span class="status-badge status-${c.status}">${c.status.charAt(0).toUpperCase()+c.status.slice(1)}</span></td>
            <td>${c.creditScore||'-'}</td>
            <td><span class="loan-count">${activeCount}</span></td>
            <td>${formatMoney(totalBorrowed)}</td>
            <td>${new Date(parseInt(c.id)).toLocaleDateString()}</td>
            <td><button class="actions-btn" data-id="${c.id}">⋮</button></td>`;
        tr.addEventListener('click',()=>viewCustomer(c.id));
        tr.querySelectorAll('input').forEach(inp=>inp.addEventListener('click',e=>{e.stopPropagation();updateBulk();}));
        tr.querySelector('.actions-btn').addEventListener('click',e=>{e.stopPropagation();showActionsMenu(c.id,e.target);});
        tbody.appendChild(tr);
    });
}


function showActionsMenu(id,btn){
    const menu = document.createElement('div');
    menu.style.position='absolute';
    menu.style.background='rgba(0,0,0,0.8)';
    menu.style.color='white';
    menu.style.padding='.5rem';
    menu.style.borderRadius='.5rem';
    menu.style.zIndex=100;
    menu.innerHTML = `<div style="cursor:pointer;padding:.25rem 0;" data-act="view">View Profile</div><div style="cursor:pointer;padding:.25rem 0;" data-act="edit">Edit</div><div style="cursor:pointer;padding:.25rem 0;" data-act="delete">Delete</div>`;
    document.body.appendChild(menu);
    const rect=btn.getBoundingClientRect();
    menu.style.left=rect.left+'px';
    menu.style.top=rect.bottom+'px';
    function remove(){menu.remove();document.removeEventListener('click',remove);}
    document.addEventListener('click',remove);
    menu.addEventListener('click',e=>{
        const act=e.target.getAttribute('data-act');
        if(act==='view'){viewCustomer(id);}
        if(act==='edit'){window.location.href=`add-customer.html?id=${id}`;}
        if(act==='delete'){deleteCustomer(id);}
        remove();
    });
}

function deleteCustomer(id){
    if(!confirm('Delete this customer?')) return;
    const use = loans.some(l=>l.clientId==id);
    if(use){alert('Cannot delete customer with linked transactions');return;}
    const idx=customers.findIndex(c=>c.id==id);
    if(idx>-1){
        customers.splice(idx,1);
        deleteDoc(doc(db,'customers',id.toString())).catch(console.error);
        applyFilters();
    }

}

function viewCustomer(id){
    window.location.href = `customer-profile.html?id=${id}`;
}

function updateBulk(){
    const checks=[...document.querySelectorAll('.rowCheck')];
    const selected=checks.filter(c=>c.checked).map(c=>parseInt(c.dataset.id));
    const bulk=document.getElementById('bulkActions');
    const countEl=document.getElementById('selectedCount');
    if(selected.length){
        bulk.classList.add('show');
        countEl.textContent=`${selected.length} selected`;
    }else{bulk.classList.remove('show');}
}

document.getElementById('selectAll').addEventListener('change',function(){
    document.querySelectorAll('.rowCheck').forEach(c=>{c.checked=this.checked;});
    updateBulk();
});

document.getElementById('emailSelected').addEventListener('click',()=>{
    const emails=[...document.querySelectorAll('.rowCheck:checked')].map(c=>{
        const cust=customers.find(x=>x.id==c.dataset.id);return cust?cust.email:'';});
    if(emails.length){window.location.href='mailto:'+emails.join(',');}
});

document.getElementById('reportSelected').addEventListener('click',()=>{
    const selected=[...document.querySelectorAll('.rowCheck:checked')].map(c=>customers.find(x=>x.id==c.dataset.id));
    const blob=new Blob([JSON.stringify(selected,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='customers_report.json';a.click();URL.revokeObjectURL(url);
});

document.getElementById('deactivateSelected').addEventListener('click',()=>{
    document.querySelectorAll('.rowCheck:checked').forEach(c=>{
        const cust=customers.find(x=>x.id==c.dataset.id);
        if(cust){
            cust.status='inactive';
            setDoc(doc(db,'customers',cust.id.toString()), cust).catch(console.error);
        }
    });
    applyFilters();
});

document.getElementById('exportBtn').addEventListener('click',()=>{
    const data=JSON.stringify(customers,null,2);const blob=new Blob([data],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='customers.json';a.click();URL.revokeObjectURL(url);
});

const importFile=document.getElementById('importFile');
document.getElementById('importBtn').addEventListener('click',()=>importFile.click());
importFile.addEventListener('change',e=>{
    const file=e.target.files[0];if(!file) return;const reader=new FileReader();
    reader.onload=ev=>{try{const data=JSON.parse(ev.target.result);if(Array.isArray(data)){data.forEach(async d=>{if(!d.id) d.id=Date.now()+Math.random();customers.push(d);await setDoc(doc(db,'customers',d.id.toString()),d);});applyFilters();}}catch(err){alert('Invalid file');}};reader.readAsText(file);
});

document.getElementById('addBtn').addEventListener('click',()=>window.location.href='add-customer.html');

document.getElementById('searchInput').addEventListener('input',applyFilters);
document.getElementById('statusFilter').addEventListener('change',applyFilters);
document.getElementById('loanFilter').addEventListener('change',applyFilters);
document.getElementById('dateFilter').addEventListener('change',applyFilters);
document.getElementById('scoreFilter').addEventListener('change',applyFilters);

function applyFilters(){
    const q=document.getElementById('searchInput').value.toLowerCase();
    const status=document.getElementById('statusFilter').value;
    const loan=document.getElementById('loanFilter').value;
    const date=document.getElementById('dateFilter').value;
    const score=document.getElementById('scoreFilter').value;
    filtered=customers.filter(c=>{
        if(q && !((c.firstName&&c.firstName.toLowerCase().includes(q))||(c.lastName&&c.lastName.toLowerCase().includes(q))||(c.nationalId&&c.nationalId.includes(q))||(c.phoneNumber&&c.phoneNumber.includes(q)))) return false;
        if(status && c.status!==status) return false;
        const info=getLoanInfo(c.id);
        if(loan==='has' && info.activeCount===0) return false;
        if(loan==='none' && info.activeCount>0) return false;
        if(date){
            const days=parseInt(date);if(Date.now()-parseInt(c.id) > days*24*60*60*1000) return false;
        }
        if(score){
            const sc=parseInt(score);
            if(sc===750 && c.creditScore<750) return false;
            if(sc===700 && (c.creditScore<700 || c.creditScore>=750)) return false;
            if(sc===650 && (c.creditScore<650 || c.creditScore>=700)) return false;
            if(sc===0 && c.creditScore>=650) return false;
        }
        return true;
    });
    currentPage=1;render();
}

function render(){
    computeStats(customers);
    customersCount.textContent=`Showing ${filtered.length} of ${customers.length} customers`;
    const start=(currentPage-1)*PAGE_SIZE;
    const pageList=filtered.slice(start,start+PAGE_SIZE);
    renderTable(pageList);
    renderPagination();
    updateBulk();
}

function renderPagination(){
    const pages=Math.ceil(filtered.length/PAGE_SIZE)||1;
    pagination.innerHTML='';
    const prev=document.createElement('button');
    prev.className='pagination-btn';prev.textContent='\u2190 Previous';prev.disabled=currentPage===1;
    prev.onclick=()=>{currentPage--;render();};
    pagination.appendChild(prev);
    for(let i=1;i<=pages;i++){
        const b=document.createElement('button');
        b.className='pagination-btn'+(i===currentPage?' active':'');
        b.textContent=i;b.onclick=()=>{currentPage=i;render();};
        pagination.appendChild(b);
        if(i>=3 && pages>5 && i<pages-1){ if(i===3){const dots=document.createElement('span');dots.textContent='...';dots.style.padding='0 .5rem';pagination.appendChild(dots);} if(i<pages-1) continue; }
    }
    const next=document.createElement('button');
    next.className='pagination-btn';next.textContent='Next \u2192';next.disabled=currentPage===pages;
    next.onclick=()=>{currentPage++;render();};
    pagination.appendChild(next);
}

function toggleStats(){
    const grid=document.getElementById('statsCards');
    grid.classList.toggle('expanded');
    const arrow=document.getElementById('stats-arrow');
    arrow.textContent=grid.classList.contains('expanded')?'▲':'▼';
}

loadData();
