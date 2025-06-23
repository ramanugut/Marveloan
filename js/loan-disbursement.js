        import { db } from './firebase-config.js';
        import { collection, getDocs, doc, updateDoc, addDoc } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';
        let loans = [];
        let customers = [];
        let filteredLoans = [];
        let selectedLoan = null;
        async function loadData(){
            try{
                const loanSnap = await getDocs(collection(db,'loans'));
                loans = loanSnap.docs.map(d=>({id:d.id,...d.data()}));
                const custSnap = await getDocs(collection(db,'customers'));
                customers = custSnap.docs.map(d=>({id:d.id,...d.data()}));
            }catch(err){
                console.error('Firebase load failed', err);
                loans = [];
                customers = [];
            }
            renderLoans();
            updateStats();
        }
        function updateStats(){
            const approved = loans.filter(l=>String(l.status).toLowerCase().includes('approved'));
            document.getElementById('countApproved').textContent = approved.length;
            const pendingAmt = approved.reduce((s,l)=>s+(parseFloat(l.amount)||0),0);
            document.getElementById('pendingAmount').textContent = '$'+pendingAmt.toLocaleString();
        }
        function renderLoans(){
            const list = document.getElementById('loanList');
            list.innerHTML = '';
            filteredLoans = loans.filter(l=>String(l.status).toLowerCase().includes('approved'));
            filteredLoans.forEach(l=>{
                const c = customers.find(x=>x.id==l.clientId)||{};
                const item = document.createElement('div');
                item.className = 'loan-item';
                item.innerHTML = `
                    <div class="loan-header">
                        <div>
                            <div class="loan-customer">${(c.firstName||'')+' '+(c.lastName||'')}</div>
                            <div class="loan-id">Loan ID: ${l.id}</div>
                        </div>
                        <div class="loan-status status-approved">${l.status}</div>
                    </div>
                    <div class="loan-details">
                        <div class="loan-detail"><div class="detail-value">$${Number(l.amount||0).toLocaleString()}</div><div class="detail-label">Amount</div></div>
                        <div class="loan-detail"><div class="detail-value">${l.product||''}</div><div class="detail-label">Type</div></div>
                        <div class="loan-detail"><div class="detail-value">${l.term||''} months</div><div class="detail-label">Term</div></div>
                        <div class="loan-detail"><div class="detail-value">${(parseFloat(l.rate)*100).toFixed(1)}%</div><div class="detail-label">Rate</div></div>
                    </div>`;
                item.addEventListener('click',()=>selectLoan(item,l,c));
                list.appendChild(item);
            });
        }
        function selectLoan(el,loan,cust){
            document.querySelectorAll('.loan-item').forEach(i=>i.classList.remove('selected'));
            el.classList.add('selected');
            selectedLoan = { ...loan, customerName:`${cust.firstName||''} ${cust.lastName||''}` };
            showDisbursementForm();
        }
        function showDisbursementForm(){
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('selectedLoanInfo').classList.add('show');
            document.getElementById('disbursementForm').classList.add('show');
            const summary = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                    <div><strong>Customer:</strong> ${selectedLoan.customerName}</div>
                    <div><strong>Amount:</strong> $${Number(selectedLoan.amount).toLocaleString()}</div>
                    <div><strong>Type:</strong> ${selectedLoan.product||''}</div>
                    <div><strong>Term:</strong> ${selectedLoan.term||''} months</div>
                </div>`;
            document.getElementById('loanSummary').innerHTML = summary;
            document.getElementById('disbursementAmount').textContent = '$'+Number(selectedLoan.amount).toLocaleString();
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('dateInput').value = today;
        }
        function filterLoans(filter){
            document.querySelectorAll('.filter-btn').forEach(btn=>btn.classList.remove('active'));
            event.target.classList.add('active');
            const list = document.getElementById('loanList');
            list.innerHTML='';
            let listData = filteredLoans;
            if(filter==='high-amount') listData = filteredLoans.filter(l=>parseFloat(l.amount)>=50000);
            if(filter==='pending') listData = loans.filter(l=>String(l.status).toLowerCase().includes('pending'));
            if(filter==='approved') listData = loans.filter(l=>String(l.status).toLowerCase().includes('approved'));
            listData.forEach(l=>{
                const c=customers.find(x=>x.id==l.clientId)||{};
                const item=document.createElement('div');
                item.className='loan-item';
                item.innerHTML=`<div class="loan-header"><div><div class="loan-customer">${(c.firstName||'')+' '+(c.lastName||'')}</div><div class="loan-id">Loan ID: ${l.id}</div></div><div class="loan-status ${filter==='pending'?'status-pending':'status-approved'}">${l.status}</div></div><div class="loan-details"><div class="loan-detail"><div class="detail-value">$${Number(l.amount||0).toLocaleString()}</div><div class="detail-label">Amount</div></div><div class="loan-detail"><div class="detail-value">${l.product||''}</div><div class="detail-label">Type</div></div><div class="loan-detail"><div class="detail-value">${l.term||''} months</div><div class="detail-label">Term</div></div><div class="loan-detail"><div class="detail-value">${(parseFloat(l.rate)*100).toFixed(1)}%</div><div class="detail-label">Rate</div></div></div>`;
                item.addEventListener('click',()=>selectLoan(item,l,c));
                list.appendChild(item);
            });
        }
        function searchLoans(q){
            q = q.toLowerCase();
            document.querySelectorAll('.loan-item').forEach(item=>{
                item.style.display = item.textContent.toLowerCase().includes(q) ? 'block' : 'none';
            });
        }
        async function processDisbursement(){
            if(!selectedLoan){alert('Please select a loan first');return;}
            const method = document.getElementById('methodSelect').value;
            if(!method){alert('Please select a disbursement method');return;}
            const data = {
                loanId: selectedLoan.id,
                customer: selectedLoan.customerName,
                amount: parseFloat(selectedLoan.amount)||0,
                method,
                account: document.getElementById('accountInput').value,
                bank: document.getElementById('bankInput').value,
                reference: document.getElementById('refInput').value,
                date: document.getElementById('dateInput').value,
                notes: document.getElementById('notesInput').value,
                createdAt: new Date()
            };
            try{
                const ref = await addDoc(collection(db,'disbursements'), data);
                await updateDoc(doc(db,'loans', selectedLoan.id.toString()), {status:'Disbursed'});
                alert('✅ Disbursement processed successfully!\n\nTransaction ID: '+ref.id);
                resetForm();
                loadData();
            }catch(err){
                console.error('Firebase error', err);
                alert('Failed to process disbursement');
            }
        }
        async function schedulePayment(){
            if(!selectedLoan){alert('Please select a loan first');return;}
            const date = document.getElementById('dateInput').value;
            if(!date){alert('Please select a disbursement date');return;}
            const sched = {
                loanId:selectedLoan.id,
                customer:selectedLoan.customerName,
                amount:parseFloat(selectedLoan.amount)||0,
                scheduled:true,
                method:document.getElementById('methodSelect').value||null,
                date,
                createdAt:new Date()
            };
            try{
                const ref = await addDoc(collection(db,'disbursements'), sched);
                alert('📅 Payment scheduled. Reference: '+ref.id);
                resetForm();
                loadData();
            }catch(err){
                console.error('Firebase error', err);
                alert('Failed to schedule payment');
            }
        }
        function cancelDisbursement(){
            if(confirm('Are you sure you want to cancel this disbursement?')) resetForm();
        }
        function resetForm(){
            selectedLoan = null;
            document.querySelectorAll('.loan-item').forEach(item=>item.classList.remove('selected'));
            document.getElementById('emptyState').style.display='block';
            document.getElementById('selectedLoanInfo').classList.remove('show');
            document.getElementById('disbursementForm').classList.remove('show');
            document.querySelectorAll('.form-input, .form-select').forEach(f=>f.value='');
        }
        function goBack(){window.history.back();}
        window.filterLoans = filterLoans;
        window.searchLoans = searchLoans;
        window.processDisbursement = processDisbursement;
        window.schedulePayment = schedulePayment;
        window.cancelDisbursement = cancelDisbursement;
        window.goBack = goBack;
        document.addEventListener('DOMContentLoaded', loadData);
