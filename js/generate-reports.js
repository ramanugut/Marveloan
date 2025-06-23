        document.querySelectorAll('.generate-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-report');
                alert(`Generating ${type} report...`);
            });
        });
        document.getElementById('generateCustomReport').addEventListener('click', () => {
            const reportType = document.getElementById('reportType').value;
            const reportName = document.getElementById('reportName').value || 'Custom Report';
            if (!reportType) {
                alert('Please select a report type');
                return;
            }
            alert(`Generating ${reportName} (${reportType})...`);
        });
