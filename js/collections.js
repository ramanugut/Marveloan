        // Filter functionality
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Implement actual filtering logic as needed
                console.log('Filtering by:', this.textContent);
            });
        });

        // Action button functionality
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.textContent;
                const row = this.closest('tr');
                const customerName = row.querySelector('strong').textContent;
                
                alert(`${action} action for ${customerName}`);
                // Implement actual action logic
            });
        });

        // Search functionality
        const searchBar = document.querySelector('.search-bar');
        searchBar.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });

        // Bulk action functionality
        const bulkButtons = document.querySelectorAll('.btn');
        bulkButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.textContent.includes('SMS')) {
                    alert('Sending bulk SMS reminders to overdue customers...');
                } else if (this.textContent.includes('Email')) {
                    alert('Launching email campaign for collections...');
                } else if (this.textContent.includes('Report')) {
                    alert('Generating collections report...');
                } else if (this.textContent.includes('Settings')) {
                    alert('Opening collection settings...');
                }
            });
        });
