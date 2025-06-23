        import { db } from './firebase-config.js';
        import { collection, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';
        let currentStep = 1;
        const totalSteps = 3;

        function nextStep(){
            if(validateCurrentStep()){
                if(currentStep < totalSteps){
                    currentStep++;
                    updateSteps();
                }
            }
        }
        function previousStep(){
            if(currentStep>1){
                currentStep--;
                updateSteps();
            }
        }
        function validateCurrentStep(){
            const currentSection=document.getElementById(`section${currentStep}`);
            const requiredFields=currentSection.querySelectorAll('[required]');
            let valid=true;
            requiredFields.forEach(f=>{
                if(!f.value.trim()){
                    f.style.borderColor='#ff6b6b';
                    valid=false;
                }else{
                    f.style.borderColor='rgba(255,255,255,0.2)';
                }
            });
            if(!valid) alert('Please fill in all required fields before proceeding.');
            return valid;
        }
        function updateSteps(){
            document.querySelectorAll('.form-section').forEach(s=>s.classList.remove('active'));
            document.getElementById(`section${currentStep}`).classList.add('active');
            for(let i=1;i<=4;i++){
                const step=document.getElementById(`step${i}`);
                step.classList.remove('active','completed');
                if(i<currentStep) step.classList.add('completed');
                else if(i===currentStep) step.classList.add('active');
            }
            const progressWidth=((currentStep-1)/(totalSteps-1))*100;
            document.getElementById('progressLine').style.width=`${progressWidth}%`;
            document.getElementById('prevBtn').style.display=currentStep===1?'none':'inline-flex';
            document.getElementById('nextBtn').style.display=currentStep===totalSteps?'none':'inline-flex';
            document.getElementById('submitBtn').style.display=currentStep===totalSteps?'inline-flex':'none';
            document.getElementById('formActions').style.display=currentStep===4?'none':'flex';
        }
        const form=document.getElementById('customerForm');
        let savedId=null;
        const employerNameInput=document.getElementById('employerName');
        const employerCodeInput=document.getElementById('employerCode');

        function generateCode(name){
            const prefix=name.trim().slice(0,3).toUpperCase();
            return prefix+Date.now().toString().slice(-4);
        }

        employerNameInput.addEventListener('input',()=>{
            employerCodeInput.value = employerNameInput.value ? generateCode(employerNameInput.value) : '';
        });

        const urlParams=new URLSearchParams(window.location.search);
        const editId=urlParams.get('id');
        if(editId){
            try{
                const snap=await getDoc(doc(collection(db,'customers'), editId));
                if(snap.exists()){
                    const customer=snap.data();
                    Object.keys(customer).forEach(k=>{if(form.elements[k]) form.elements[k].value=customer[k];});
                }
            }catch(err){
                console.error('Firebase load failed', err);
            }
        }

        form.addEventListener('submit',async function(e){
            e.preventDefault();
            if(validateCurrentStep()){
                const data={};
                new FormData(form).forEach((v,k)=>data[k]=v);
                if(editId){
                    data.id = editId;
                }else{
                    data.id = Date.now().toString();
                }

                let employerDoc=null;
                if(data.employerName){
                    employerDoc={name:data.employerName,code:data.employerCode||generateCode(data.employerName)};
                }

                try{
                    await setDoc(doc(collection(db,'customers'), data.id.toString()), data);
                    if(employerDoc){
                        await setDoc(doc(collection(db,'employers'), employerDoc.code), employerDoc);
                    }
                }catch(err){
                    console.error('Firebase save failed', err);
                    alert('Failed to save customer');
                    return;
                }

                savedId = data.id;

                setTimeout(()=>{currentStep=4;updateSteps();},500);
            }
        });
        function addAnother(){
            document.getElementById('customerForm').reset();
            currentStep=1;
            updateSteps();
        }
        function viewCustomer(){
            if(savedId){
                window.location.href = `customer-profile.html?id=${savedId}`;
            }
        }
        updateSteps();
        window.nextStep = nextStep;
        window.previousStep = previousStep;
        window.addAnother = addAnother;
        window.viewCustomer = viewCustomer;
