        import { auth, db } from './firebase-config.js';
        import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
        import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';

        const form = document.getElementById('signupForm');
        const msg = document.getElementById('msg');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            msg.textContent='';
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const role = document.getElementById('role').value;
            try{
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db,'users',cred.user.uid), {
                    name,
                    email,
                    role,
                    createdAt: serverTimestamp()
                });
                msg.textContent='User created successfully';
                form.reset();
            }catch(err){
                msg.textContent=err.message;
                msg.classList.add('error');
            }
        });
