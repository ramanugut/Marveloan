        import { db } from './firebase-config.js';
        import { collection, doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';
        function selectLoanType(card){ document.querySelectorAll('.loan-type-card').forEach(c=>c.classList.remove('selected')); card.classList.add('selected'); }
        function updateCustomerInfo(select){ const statusInput=document.getElementById('customerStatus'); if(select.value==='new'){ statusInput.value='New Customer - Will create profile'; statusInput.style.color='#fbbf24'; } else if(select.value!==''){ statusInput.value='Existing Customer - Verified'; statusInput.style.color='#4ade80'; } else { statusInput.value=''; } }
        function goBack(){ window.history.back(); }
        function saveDraft(){ submitToFirestore('draft'); }
        async function submitApplication(){ const requiredFields=document.querySelectorAll('[required]'); let valid=true; requiredFields.forEach(f=>{ if(!f.value.trim()){ f.style.borderColor='#ef4444'; valid=false; } else { f.style.borderColor='rgba(255,255,255,0.2)'; }}); if(!valid){ alert('Please fill in all required fields'); return; } await submitToFirestore('pending'); alert('Application saved! Proceeding to next step.'); }
        async function submitToFirestore(status){
            const selectedType = document.querySelector('.loan-type-card.selected').dataset.type;
            const data = {
                id: Date.now().toString(),
                type: selectedType,
                amount: parseFloat(document.getElementById('loanAmount').value),
                purpose: document.getElementById('loanPurpose').value,
                term: parseInt(document.getElementById('loanTerm').value),
                rate: parseFloat(document.getElementById('interestRate').value) || null,
                customer: document.getElementById('customerSelect').value || null,
                status,
                createdAt: new Date().toISOString()
            };

            const loans = JSON.parse(localStorage.getItem('loans')) || [];
            loans.push(data);
            localStorage.setItem('loans', JSON.stringify(loans));

            try{
                await setDoc(doc(collection(db, 'loanApplications'), data.id), data);
            }catch(err){
                console.error('Firebase save failed', err);
            }
        }
