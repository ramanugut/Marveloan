        import { auth } from './firebase-config.js';
        import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
        // Toggle password visibility
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');

        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
        });

        // Form validation
        const loginForm = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const loginBtn = document.getElementById('loginBtn');
        const spinner = document.getElementById('spinner');
        const btnText = document.getElementById('btnText');
        const successMessage = document.getElementById('successMessage');

        // Email validation
        function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // Password validation
        function validatePassword(password) {
            return password.length >= 6;
        }

        // Show error message
        function showError(inputId, message) {
            const errorElement = document.getElementById(inputId + 'Error');
            const inputElement = document.getElementById(inputId);
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            inputElement.style.borderColor = '#e53e3e';
        }

        // Hide error message
        function hideError(inputId) {
            const errorElement = document.getElementById(inputId + 'Error');
            const inputElement = document.getElementById(inputId);
            errorElement.style.display = 'none';
            inputElement.style.borderColor = '#e2e8f0';
        }

        // Real-time validation
        emailInput.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                showError('email', 'Please enter a valid email address');
            } else {
                hideError('email');
            }
        });

        passwordInput.addEventListener('blur', function() {
            if (this.value && !validatePassword(this.value)) {
                showError('password', 'Password must be at least 6 characters');
            } else {
                hideError('password');
            }
        });

        // Form submission
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            let isValid = true;

            // Validate email
            if (!email) {
                showError('email', 'Email is required');
                isValid = false;
            } else if (!validateEmail(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            } else {
                hideError('email');
            }

            // Validate password
            if (!password) {
                showError('password', 'Password is required');
                isValid = false;
            } else if (!validatePassword(password)) {
                showError('password', 'Password must be at least 6 characters');
                isValid = false;
            } else {
                hideError('password');
            }

            if (isValid) {
                loginBtn.disabled = true;
                spinner.style.display = 'inline-block';
                btnText.textContent = 'Signing In...';

                signInWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        loginBtn.disabled = false;
                        spinner.style.display = 'none';
                        btnText.textContent = 'Sign In';
                        successMessage.textContent = 'Login successful! Redirecting...';
                        successMessage.style.display = 'block';
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1500);
                    })
                    .catch((error) => {
                        loginBtn.disabled = false;
                        spinner.style.display = 'none';
                        btnText.textContent = 'Sign In';
                        showError('password', error.message);
                    });
            }
        });

        // Social login handlers
        document.getElementById('googleLogin').addEventListener('click', function() {
            alert('Google login integration would be implemented here');
        });

        document.getElementById('microsoftLogin').addEventListener('click', function() {
            alert('Microsoft login integration would be implemented here');
        });

        // Forgot password handler
        document.querySelector('.forgot-password').addEventListener('click', function(e) {
            e.preventDefault();
            alert('Forgot password functionality would be implemented here');
        });

        // Add smooth animations on input focus/blur
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.02)';
            });

            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
        });

        // Add floating label effect
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                const label = this.parentElement.parentElement.querySelector('label');
                if (this.value) {
                    label.style.transform = 'translateY(-8px) scale(0.85)';
                    label.style.color = '#667eea';
                } else {
                    label.style.transform = 'translateY(0) scale(1)';
                    label.style.color = '#4a5568';
                }
            });
        });
