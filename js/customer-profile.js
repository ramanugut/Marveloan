        import { db } from './firebase-config.js';
        import { doc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        let customer = {};
        if(id){
            try{
                const snap = await getDoc(doc(db,'customers',id));
                if(snap.exists()) customer = snap.data();
            }catch(err){
                console.error('Firebase load failed', err);
            }
        }
        if (Object.keys(customer).length) {
            const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
            const initials = (customer.firstName ? customer.firstName[0] : 'C') + (customer.lastName ? customer.lastName[0] : 'U');
            document.getElementById('fullName').textContent = fullName || 'Customer';
            document.getElementById('infoFullName').textContent = fullName || 'Customer';
            document.getElementById('avatar').textContent = initials;
            document.getElementById('customerId').textContent = customer.id || '';
            document.getElementById('joinedDate').textContent = customer.id ? new Date(parseInt(customer.id)).toLocaleDateString() : '';
            document.getElementById('nationalId').textContent = customer.nationalId || '';
            document.getElementById('dob').textContent = customer.dateOfBirth || '';
            document.getElementById('nationality').textContent = customer.nationality || '';
            document.getElementById('maritalStatus').textContent = customer.maritalStatus || '';
            document.getElementById('phone').textContent = customer.phoneNumber || '';
            document.getElementById('email').textContent = customer.email || '';
            document.getElementById('address').textContent = customer.homeAddress || '';
            document.getElementById('emergencyContact').textContent = customer.altPhoneNumber || '';
            document.getElementById('employer').textContent = customer.employerName || '';
            document.getElementById('position').textContent = customer.jobTitle || '';
            document.getElementById('employmentType').textContent = customer.employmentStatus || '';
            document.getElementById('monthlyIncome').textContent = customer.monthlyIncome ? `R ${customer.monthlyIncome}` : '';
        }

        function statusClass(status) {
            const s = status.toLowerCase();
            if (s.includes('complete')) return 'status-completed';
            if (s.includes('active')) return 'status-active';
            return 'status-pending';
        }

        let loans = [];
        try{
            const loanSnap = await getDocs(collection(db,'loans'));
            loans = loanSnap.docs.map(d=>d.data());
        }catch(err){
            console.error('Firebase load failed', err);
            loans = [];
        }
        const loanRows = document.getElementById('loanRows');
        if (loanRows) {
            loanRows.innerHTML = '';
            const rows = loans.filter(l => l.clientId == customer.id);
            rows.forEach(l => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${l.id}</td>
                    <td>${l.product || ''}</td>
                    <td>R ${l.amount || ''}</td>
                    <td>${l.term || ''} months</td>
                    <td>${(l.rate * 100).toFixed(2)}%</td>
                    <td><span class="loan-status ${statusClass(l.status || '')}">${l.status || ''}</span></td>
                    <td>${new Date(parseInt(l.id)).toLocaleDateString()}</td>
                    <td><button class="action-btn" style="padding: 8px 16px; font-size: 12px;">View Details</button></td>`;
                loanRows.appendChild(tr);
            });
        }

        document.getElementById('qaNewApplication').addEventListener('click', () => {
            window.location.href = 'loan-application.html';
        });
        document.getElementById('qaContactCustomer').addEventListener('click', () => {
            if (customer.phoneNumber) window.location.href = 'tel:' + customer.phoneNumber;
        });
        document.getElementById('qaPaymentHistory').addEventListener('click', () => {
            alert('Feature coming soon!');
        });
        document.getElementById('qaGenerateReport').addEventListener('click', () => {
            alert('Feature coming soon!');
        });
        document.getElementById('editProfile').addEventListener('click', () => {
            if (customer.id) window.location.href = `add-customer.html?id=${customer.id}`;
        });
