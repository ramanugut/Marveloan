import { db } from './firebase-config.js';
import { collection, doc, setDoc, getDocs } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';
let customers = [];
try{
    const snap = await getDocs(collection(db,'customers'));
    customers = snap.docs.map(d=>d.data());
}catch(err){
    console.error('Firebase load failed', err);
    customers = [];
}
let currentStep = 1;
let selectedCustomer = null;
const resultsList = document.getElementById('results');
const searchInput = document.getElementById('search');
function renderResults(list){
    resultsList.innerHTML = '';
    list.forEach(c => {
        const li = document.createElement('li');
        li.textContent = `${c.firstName} ${c.lastName} - ${c.nationalId}`;
        li.onclick = ()=>selectCustomer(c.id);
        resultsList.appendChild(li);
    });
    if(list.length===0){
        resultsList.innerHTML = '<li>No matches</li>';
    }
}
searchInput.addEventListener('input',()=>{
    const q = searchInput.value.toLowerCase();
    const filtered = customers.filter(c =>
        (c.firstName && c.firstName.toLowerCase().includes(q)) ||
        (c.lastName && c.lastName.toLowerCase().includes(q)) ||
        (c.nationalId && c.nationalId.includes(q))
    );
    if(q){renderResults(filtered);}else{resultsList.innerHTML='';}
});
function selectCustomer(id){
    selectedCustomer = customers.find(c=>c.id===id);
    document.getElementById('clientName').textContent = `${selectedCustomer.firstName} ${selectedCustomer.lastName}`;
    nextStep();
}
function updateTermOptions(){
    const product = document.getElementById('product');
    const termSelect = document.getElementById('term');
    const defaultTerm = parseInt(product.options[product.selectedIndex].dataset.term);
    termSelect.innerHTML = '';
    for(let i=1;i<=defaultTerm;i++){
        const opt=document.createElement('option');
        opt.value=i;opt.textContent=i;
        termSelect.appendChild(opt);
    }
    termSelect.value=defaultTerm;
    calculateInstallment();
}
function calculateInstallment(){
    const product = document.getElementById('product');
    const rate = parseFloat(product.options[product.selectedIndex].dataset.rate);
    const amount = parseFloat(document.getElementById('amount').value)||0;
    const term = parseInt(document.getElementById('term').value)||1;
    const total = amount*(1 + rate*term);
    const installment = total/term;
    document.getElementById('installment').textContent = `R${installment.toFixed(2)}`;
}

document.getElementById('product').addEventListener('change',updateTermOptions);
document.getElementById('amount').addEventListener('input',calculateInstallment);
document.getElementById('term').addEventListener('change',calculateInstallment);

function nextStep(){
    if(currentStep===1 && !selectedCustomer) return;
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep++;
    if(currentStep>3) currentStep=3;
    document.getElementById(`step${currentStep}`).classList.add('active');
    document.getElementById('prevBtn').style.display=currentStep===1?'none':'inline-block';
    document.getElementById('nextBtn').style.display=currentStep===3?'none':'inline-block';
    document.getElementById('submitBtn').style.display=currentStep===3?'inline-block':'none';
    if(currentStep===2){updateTermOptions();}
    if(currentStep===3){populateReview();}
}
function prevStep(){
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep--;
    if(currentStep<1) currentStep=1;
    document.getElementById(`step${currentStep}`).classList.add('active');
    document.getElementById('prevBtn').style.display=currentStep===1?'none':'inline-block';
    document.getElementById('nextBtn').style.display=currentStep===3?'none':'inline-block';
    document.getElementById('submitBtn').style.display=currentStep===3?'inline-block':'none';
}
function populateReview(){
    const amount = parseFloat(document.getElementById('amount').value)||0;
    const term = parseInt(document.getElementById('term').value)||1;
    const productSel = document.getElementById('product');
    const rate = parseFloat(productSel.options[productSel.selectedIndex].dataset.rate);
    const total = amount*(1 + rate*term);
    const installment = total/term;
    const html = `<p><strong>Client:</strong> ${selectedCustomer.firstName} ${selectedCustomer.lastName}</p>
    <p><strong>Product:</strong> ${productSel.options[productSel.selectedIndex].text}</p>
    <p><strong>Amount:</strong> R${amount.toFixed(2)}</p>
    <p><strong>Term:</strong> ${term} month(s)</p>
    <p><strong>Monthly Installment:</strong> R${installment.toFixed(2)}</p>`;
    document.getElementById('review').innerHTML = html;
}

document.getElementById('nextBtn').addEventListener('click',nextStep);
document.getElementById('prevBtn').addEventListener('click',prevStep);

document.getElementById('loanForm').addEventListener('submit',async function(e){
    e.preventDefault();
    const productSel = document.getElementById('product');
    const rate = parseFloat(productSel.options[productSel.selectedIndex].dataset.rate);
    const amount = parseFloat(document.getElementById('amount').value)||0;
    const term = parseInt(document.getElementById('term').value)||1;
    const total = amount*(1 + rate*term);
    const installment = total/term;
    const loan = {
        id: Date.now(),
        clientId: selectedCustomer.id,
        product: productSel.value,
        amount,
        term,
        rate,
        installment: parseFloat(installment.toFixed(2)),
        status:'Application'
    };
    try{
        await setDoc(doc(collection(db,'loans'), loan.id.toString()), loan);
    }catch(err){
        console.error('Firebase save failed', err);
    }

    alert('Loan application created!');
    window.location.href='dashboard.html';
});
