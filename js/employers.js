import { db } from './firebase-config.js';
import { collection, getDocs, setDoc, doc } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';

async function load(){
    try{
        const snap = await getDocs(collection(db,'employers'));
        employers = snap.docs.map(d=>d.data());
    }catch(err){
        console.error('Firebase load failed', err);
        employers=[];
    }
    const tbody=document.querySelector('#employersTable tbody');
    tbody.innerHTML='';
    employers.forEach(e=>{
        const tr=document.createElement('tr');
        tr.innerHTML=`<td>${e.name}</td><td>${e.code}</td>`;
        tbody.appendChild(tr);
    });
}
function exportEmployers(){
    const data=JSON.stringify(employers);
    const blob=new Blob([data],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='employers.json';a.click();URL.revokeObjectURL(url);
}
function importEmployers(){
    const f=document.getElementById('importFile').files[0];
    if(!f){alert('Select a file');return;}
    const r=new FileReader();
    r.onload=function(){
        try{
            const arr=JSON.parse(r.result); if(Array.isArray(arr)){
                arr.forEach(async e=>{ if(!employers.find(x=>x.code===e.code)) employers.push(e); await setDoc(doc(db,'employers',e.code),e); });
                load();
            }else{alert('Invalid file');}
        }catch(e){alert('Invalid file');}
    };
    r.readAsText(f);
}
let employers=[];load();
