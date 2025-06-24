import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

function navigate(page) {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    const button = event.target.closest('.menu-item');
    if (button) button.classList.add('active');

    if (page === 'add-customer') {
        window.location.href = 'add-customer.html';
        return;
    }
    if (page === 'customers') {
        window.location.href = 'customers.html';
        return;
    }
    if (page === 'employers') {
        window.location.href = 'employers.html';
        return;
    }
    if (page === 'new-application') {
        window.location.href = 'loan-application.html';
        return;
    }
    if (page === 'disbursement') {
        window.location.href = 'loan-disbursement.html';
        return;
    }
    if (page === 'collections') {
        window.location.href = 'collections.html';
        return;
    }
    if (page === 'reports') {
        window.location.href = 'generate-reports.html';
        return;
    }

    const welcomeTitle = document.querySelector('.welcome-title');
    const welcomeSubtitle = document.querySelector('.welcome-subtitle');
    const config = {
        'customers': {
            title: 'Customer Management 👥',
            subtitle: 'Manage all your customers and their profiles in one place.'
        },
        'applications': {
            title: 'Loan Applications 📝',
            subtitle: 'Review and process new loan applications.'
        },
        'collections': {
            title: 'Collections Management 💰',
            subtitle: 'Track and manage loan repayments and overdue accounts.'
        },
        'reports': {
            title: 'Reports & Analytics 📊',
            subtitle: 'Generate comprehensive reports and business insights.'
        },
        'cashbook': {
            title: 'Cash Book 📚',
            subtitle: 'Manage your daily cash transactions and balances.'
        },
        'disbursement': {
            title: 'Loan Disbursement 💸',
            subtitle: 'Disburse approved loans to customers efficiently.'
        }
    };
    if (config[page]) {
        welcomeTitle.textContent = config[page].title;
        welcomeSubtitle.textContent = config[page].subtitle;
    } else {
        welcomeTitle.textContent = 'Welcome back, Marven! 👋';
        welcomeSubtitle.textContent = 'Your loan management system is ready to go.';
    }
    if (window.innerWidth <= 768) toggleMobileMenu();
}

function toggleStats() {
    const grid = document.getElementById('stats-grid');
    grid.classList.toggle('expanded');
    const arrow = document.getElementById('stats-arrow');
    arrow.textContent = grid.classList.contains('expanded') ? '▲' : '▼';
}

function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('mobile-open');
}

function logout() {
    alert('Logging out...');
}

function initLoginPage() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const loginBtn = document.getElementById('loginBtn');
    const spinner = document.getElementById('spinner');
    const btnText = document.getElementById('btnText');
    const successMessage = document.getElementById('successMessage');

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    function showError(inputId, message) {
        const errorElement = document.getElementById(inputId + 'Error');
        const inputElement = document.getElementById(inputId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.style.borderColor = '#e53e3e';
    }

    function hideError(inputId) {
        const errorElement = document.getElementById(inputId + 'Error');
        const inputElement = document.getElementById(inputId);
        errorElement.style.display = 'none';
        inputElement.style.borderColor = '#e2e8f0';
    }

    emailInput.addEventListener('blur', () => {
        if (emailInput.value && !validateEmail(emailInput.value)) {
            showError('email', 'Please enter a valid email address');
        } else {
            hideError('email');
        }
    });

    passwordInput.addEventListener('blur', () => {
        if (passwordInput.value && !validatePassword(passwordInput.value)) {
            showError('password', 'Password must be at least 6 characters');
        } else {
            hideError('password');
        }
    });

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        let isValid = true;

        if (!email) {
            showError('email', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        } else {
            hideError('email');
        }

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
                .catch(error => {
                    loginBtn.disabled = false;
                    spinner.style.display = 'none';
                    btnText.textContent = 'Sign In';
                    showError('password', error.message);
                });
        }
    });

    document.getElementById('googleLogin').addEventListener('click', () => {
        alert('Google login integration would be implemented here');
    });

    document.getElementById('microsoftLogin').addEventListener('click', () => {
        alert('Microsoft login integration would be implemented here');
    });

    document.querySelector('.forgot-password').addEventListener('click', e => {
        e.preventDefault();
        alert('Forgot password functionality would be implemented here');
    });

    const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'scale(1)';
        });
        input.addEventListener('input', function () {
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
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        initLoginPage();
    }
});

window.navigate = navigate;
window.toggleStats = toggleStats;
window.toggleMobileMenu = toggleMobileMenu;
window.logout = logout;
