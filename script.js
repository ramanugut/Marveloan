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
