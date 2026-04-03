/* =========================================
   PAYMENT GATEWAY - JavaScript Logic
   Ikon Computer Education & Training Institute
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ─── DOM References ──────────────────────────────────────────
    const tabCash    = document.getElementById('tabCash');
    const tabDebit   = document.getElementById('tabDebit');
    const tabUPI     = document.getElementById('tabUPI');
    const panelCash  = document.getElementById('panelCash');
    const panelDebit = document.getElementById('panelDebit');
    const panelUPI   = document.getElementById('panelUPI');

    const payStudentName = document.getElementById('payStudentName');
    const payCourse      = document.getElementById('payCourse');
    const payAmount      = document.getElementById('payAmount');

    const summaryName   = document.getElementById('summaryName');
    const summaryCourse = document.getElementById('summaryCourse');
    const summaryMethod = document.getElementById('summaryMethod');
    const summaryAmount = document.getElementById('summaryAmount');

    const cardHolder  = document.getElementById('cardHolder');
    const cardNumber  = document.getElementById('cardNumber');
    const cardExpiry  = document.getElementById('cardExpiry');
    const cardCVV     = document.getElementById('cardCVV');
    const card3d      = document.getElementById('card3d');

    const payModal    = document.getElementById('payModal');
    const modalClose  = document.getElementById('modalClose');
    const modalMsg    = document.getElementById('modalMessage');
    const receiptBox  = document.getElementById('receiptBox');

    const clearHistory = document.getElementById('clearHistory');
    const payHistoryList = document.getElementById('payHistoryList');
    const historyEmpty   = document.getElementById('historyEmpty');

    let activeMethod = 'cash';

    // ─── Live Order Summary ──────────────────────────────────────
    function updateSummary() {
        summaryName.textContent   = payStudentName?.value.trim() || '—';
        summaryCourse.textContent = payCourse?.value || '—';
        summaryAmount.textContent = payAmount?.value
            ? `₹ ${parseFloat(payAmount.value).toFixed(2)}`
            : '₹ 0.00';
        const methodLabels = { cash: '💵 Cash', debit: '💳 Debit Card', upi: '📲 UPI' };
        summaryMethod.textContent = methodLabels[activeMethod];
    }

    payStudentName?.addEventListener('input', updateSummary);
    payCourse?.addEventListener('change',     updateSummary);
    payAmount?.addEventListener('input',      updateSummary);

    // ─── Tab Switching ───────────────────────────────────────────
    function switchTab(method) {
        activeMethod = method;
        [tabCash, tabDebit, tabUPI].forEach(t => t.classList.remove('active'));
        [panelCash, panelDebit, panelUPI].forEach(p => p.classList.remove('active'));

        if (method === 'cash') {
            tabCash.classList.add('active');
            panelCash.classList.add('active');
        } else if (method === 'debit') {
            tabDebit.classList.add('active');
            panelDebit.classList.add('active');
        } else {
            tabUPI.classList.add('active');
            panelUPI.classList.add('active');
        }
        updateSummary();
    }

    tabCash?.addEventListener('click',  () => switchTab('cash'));
    tabDebit?.addEventListener('click', () => switchTab('debit'));
    tabUPI?.addEventListener('click',   () => switchTab('upi'));

    // ─── 3D Card Live Preview ────────────────────────────────────
    const cardDisplayNumber = document.getElementById('cardDisplayNumber');
    const cardDisplayName   = document.getElementById('cardDisplayName');
    const cardDisplayExpiry = document.getElementById('cardDisplayExpiry');
    const cardDisplayCVV    = document.getElementById('cardDisplayCVV');

    cardNumber?.addEventListener('input', function () {
        // Format with spaces
        let val = this.value.replace(/\D/g, '').substring(0, 16);
        this.value = val.match(/.{1,4}/g)?.join(' ') || val;
        cardDisplayNumber.textContent = this.value.padEnd(19, '•').replace(/./g, (c, i) =>
            [4, 9, 14].includes(i) ? ' ' : c.replace(/[^ ]/, (d, j) => d === ' ' ? d : '•')
        );
        // Show actual number on the card
        cardDisplayNumber.textContent = this.value || '•••• •••• •••• ••••';
    });

    cardHolder?.addEventListener('input', function () {
        cardDisplayName.textContent = this.value.toUpperCase() || 'FULL NAME';
    });

    cardExpiry?.addEventListener('input', function () {
        let val = this.value.replace(/\D/g, '').substring(0, 4);
        if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
        this.value = val;
        cardDisplayExpiry.textContent = this.value || 'MM/YY';
    });

    cardCVV?.addEventListener('focus', () => card3d?.classList.add('flipped'));
    cardCVV?.addEventListener('blur',  () => card3d?.classList.remove('flipped'));
    cardCVV?.addEventListener('input', function () {
        cardDisplayCVV.textContent = this.value.padStart(3, '•').slice(0, 3);
    });

    // ─── Validation Helper ───────────────────────────────────────
    function validateCommon() {
        const name   = payStudentName?.value.trim();
        const course = payCourse?.value;
        const amount = parseFloat(payAmount?.value);

        if (!name)   { alert('Please enter student name.'); payStudentName.focus(); return false; }
        if (!course) { alert('Please select a course.'); payCourse.focus(); return false; }
        if (!amount || amount <= 0) { alert('Please enter a valid amount.'); payAmount.focus(); return false; }
        return true;
    }

    // ─── Save Payment to localStorage ───────────────────────────
    function savePayment(record) {
        let payments = JSON.parse(localStorage.getItem('ikon_payments') || '[]');
        payments.unshift(record); // newest first
        localStorage.setItem('ikon_payments', JSON.stringify(payments));
        renderHistory();
    }

    // ─── Generate Receipt ID ─────────────────────────────────────
    function genReceiptId() {
        return 'IKON-' + Date.now().toString(36).toUpperCase();
    }

    // ─── Show Modal ──────────────────────────────────────────────
    let currentRecord = null; // stores last payment for printing

    function showModal(record) {
        currentRecord = record;
        const dateStr = new Date(record.paidAt).toLocaleString('en-IN', {
            dateStyle: 'medium', timeStyle: 'short'
        });
        modalMsg.textContent = `Transaction ID: ${record.receiptId} — ${record.method} payment confirmed.`;
        receiptBox.innerHTML = `
            <div><strong>Receipt ID:</strong> ${record.receiptId}</div>
            <div><strong>Student:</strong> ${record.studentName}</div>
            <div><strong>Course:</strong> ${record.course}</div>
            <div><strong>Amount:</strong> ₹ ${parseFloat(record.amount).toFixed(2)}</div>
            <div><strong>Method:</strong> ${record.method}</div>
            <div><strong>Date &amp; Time:</strong> ${dateStr}</div>
            <div><strong>Status:</strong> <span style="color:#2ecc71">✔ Confirmed</span></div>
        `;
        payModal.classList.add('show');

        // Reset WhatsApp section on each new receipt
        const waPhone  = document.getElementById('waPhone');
        const waStatus = document.getElementById('waStatus');
        if (waPhone)  waPhone.value = '';
        if (waStatus) { waStatus.textContent = ''; waStatus.className = 'wa-note'; }
    }

    modalClose?.addEventListener('click', () => payModal.classList.remove('show'));
    payModal?.addEventListener('click', (e) => {
        if (e.target === payModal) payModal.classList.remove('show');
    });

    // ─── WhatsApp Share ───────────────────────────────────────────
    document.getElementById('btnWhatsApp')?.addEventListener('click', () => {
        if (!currentRecord) return;

        const waPhone  = document.getElementById('waPhone');
        const waStatus = document.getElementById('waStatus');
        const phone    = waPhone?.value.trim().replace(/\D/g, '');

        // Validate 10-digit Indian mobile
        if (!phone || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
            waStatus.textContent = '⚠ Please enter a valid 10-digit WhatsApp number.';
            waStatus.className   = 'wa-note wa-error';
            waPhone?.focus();
            return;
        }

        const dateStr = new Date(currentRecord.paidAt).toLocaleString('en-IN', {
            dateStyle: 'medium', timeStyle: 'short'
        });

        // Compose a nicely formatted WhatsApp message
        const msg = [
            `🎓 *IKON Computer Education & Training Institute*`,
            `📋 *Fee Payment Receipt*`,
            `━━━━━━━━━━━━━━━━━━`,
            ``,
            `🆔 *Receipt ID:*  ${currentRecord.receiptId}`,
            `👤 *Student:*  ${currentRecord.studentName}`,
            `📚 *Course:*  ${currentRecord.course}`,
            `💰 *Amount Paid:*  ₹ ${parseFloat(currentRecord.amount).toFixed(2)}`,
            `💳 *Method:*  ${currentRecord.method}`,
            `📅 *Date & Time:*  ${dateStr}`,
            `✅ *Status:*  Confirmed & Verified`,
            ``,
            `━━━━━━━━━━━━━━━━━━`,
            `Thank you for enrolling at Ikon Institute! 🙏`,
            `📞 8240159300 | 🌐 www.ikoncomp.co.in`,
            `📍 29, Karbala Tank Lane, Kolkata-700006`
        ].join('\n');

        const encodedMsg = encodeURIComponent(msg);
        const waURL      = `https://wa.me/91${phone}?text=${encodedMsg}`;

        // Open WhatsApp Web / App
        const waWin = window.open(waURL, '_blank');
        if (waWin) {
            waStatus.innerHTML = `<i class="fab fa-whatsapp"></i> WhatsApp opened! Message ready to send to +91 ${phone}.`;
            waStatus.className = 'wa-note wa-success';
        } else {
            waStatus.textContent = '⚠ Pop-up blocked. Allow pop-ups and try again.';
            waStatus.className   = 'wa-note wa-error';
        }
    });

    // ─── Print Receipt ────────────────────────────────────────────
    document.getElementById('modalPrint')?.addEventListener('click', () => {
        if (!currentRecord) return;

        const dateStr = new Date(currentRecord.paidAt).toLocaleString('en-IN', {
            dateStyle: 'long', timeStyle: 'medium'
        });
        const receiptId = currentRecord.receiptId;

        // Build a full standalone receipt HTML and open in new window
        const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt - ${receiptId}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 40px 20px;
            min-height: 100vh;
        }

        .receipt-page {
            background: #ffffff;
            width: 100%;
            max-width: 600px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        }

        /* Header */
        .receipt-header {
            background: linear-gradient(135deg, #0a1628 0%, #1a0533 100%);
            color: #fff;
            padding: 28px 32px 24px;
            text-align: center;
            position: relative;
        }
        .receipt-header::after {
            content: '';
            display: block;
            height: 4px;
            background: linear-gradient(90deg, #00f2fe, #8a2be2);
            margin-top: 20px;
        }
        .receipt-header .institute-name {
            font-family: 'Outfit', sans-serif;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #ffffff;
            margin-bottom: 4px;
        }
        .receipt-header .tagline {
            font-size: 11px;
            color: rgba(255,255,255,0.6);
            letter-spacing: 0.5px;
        }
        .receipt-header .address {
            font-size: 11px;
            color: rgba(255,255,255,0.5);
            margin-top: 8px;
        }

        /* Stamp badge */
        .receipt-stamp {
            text-align: center;
            margin: -20px auto 0;
            position: relative;
            z-index: 2;
        }
        .stamp-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #2ecc71;
            color: #fff;
            padding: 7px 20px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 12px rgba(46,204,113,0.4);
        }

        /* Body */
        .receipt-body {
            padding: 28px 32px 24px;
        }

        .receipt-title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px dashed #e0e0e0;
        }
        .receipt-title-row h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 20px;
            color: #111;
        }
        .receipt-id-box {
            text-align: right;
        }
        .receipt-id-box .label {
            font-size: 10px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .receipt-id-box .id-value {
            font-size: 13px;
            font-weight: 700;
            color: #8a2be2;
            font-family: 'Courier New', monospace;
        }

        /* Table rows */
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table tr td {
            padding: 10px 0;
            font-size: 14px;
            border-bottom: 1px solid #f0f0f0;
        }
        .info-table tr:last-child td {
            border-bottom: none;
        }
        .info-table .key {
            color: #888;
            font-weight: 400;
            width: 40%;
        }
        .info-table .value {
            color: #111;
            font-weight: 600;
        }
        .info-table .status-ok {
            color: #2ecc71;
            font-weight: 700;
        }

        /* Amount highlight */
        .amount-highlight {
            background: linear-gradient(135deg, #f8f0ff, #f0faff);
            border: 1px solid #e8d5ff;
            border-radius: 10px;
            padding: 14px 20px;
            margin: 20px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .amount-highlight .amt-label {
            font-size: 13px;
            color: #666;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .amount-highlight .amt-value {
            font-family: 'Outfit', sans-serif;
            font-size: 26px;
            font-weight: 800;
            color: #8a2be2;
        }

        /* Footer */
        .receipt-footer {
            background: #f9f9f9;
            padding: 16px 32px;
            text-align: center;
            border-top: 1px dashed #e0e0e0;
        }
        .receipt-footer p {
            font-size: 11px;
            color: #aaa;
            line-height: 1.8;
        }
        .receipt-footer .contact {
            font-size: 12px;
            color: #555;
            font-weight: 600;
            margin-top: 6px;
        }

        /* Watermark */
        .watermark {
            font-family: 'Outfit', sans-serif;
            font-size: 72px;
            font-weight: 800;
            color: rgba(0,0,0,0.03);
            text-align: center;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            pointer-events: none;
            white-space: nowrap;
        }

        /* Print rules */
        @media print {
            body { background: #fff; padding: 0; }
            .receipt-page { box-shadow: none; max-width: 100%; border-radius: 0; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="watermark">IKON INSTITUTE</div>

    <div class="receipt-page">
        <!-- Header -->
        <div class="receipt-header">
            <div class="institute-name">IKON Computer Education &amp; Training Institute</div>
            <div class="tagline">Excellence in Computer Education since 1994</div>
            <div class="address">29, Karbala Tank Lane, Kolkata-700006 | Tel: 8240159300 / 9836930592</div>
        </div>

        <!-- Green success stamp -->
        <div class="receipt-stamp">
            <div class="stamp-badge">&#10003; PAYMENT CONFIRMED</div>
        </div>

        <!-- Body -->
        <div class="receipt-body">
            <div class="receipt-title-row">
                <h2>Fee Receipt</h2>
                <div class="receipt-id-box">
                    <div class="label">Receipt ID</div>
                    <div class="id-value">${receiptId}</div>
                </div>
            </div>

            <!-- Amount Box -->
            <div class="amount-highlight">
                <span class="amt-label">&#8377; Amount Paid</span>
                <span class="amt-value">&#8377; ${parseFloat(currentRecord.amount).toFixed(2)}</span>
            </div>

            <!-- Details -->
            <table class="info-table">
                <tr>
                    <td class="key">Student Name</td>
                    <td class="value">${currentRecord.studentName}</td>
                </tr>
                <tr>
                    <td class="key">Course Enrolled</td>
                    <td class="value">${currentRecord.course}</td>
                </tr>
                <tr>
                    <td class="key">Payment Method</td>
                    <td class="value">${currentRecord.method}</td>
                </tr>
                <tr>
                    <td class="key">Date &amp; Time</td>
                    <td class="value">${dateStr}</td>
                </tr>
                <tr>
                    <td class="key">Payment Status</td>
                    <td class="value status-ok">&#10003; Confirmed &amp; Verified</td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div class="receipt-footer">
            <p>This is a computer-generated receipt and is valid without a physical signature.<br>
            Please retain this receipt for future reference. Thank you for your payment.</p>
            <div class="contact">myikon2016@gmail.com &nbsp;|&nbsp; www.ikoncomp.co.in</div>
        </div>
    </div>

    <!-- Print button (only visible on screen, hidden on print) -->
    <div class="no-print" style="text-align:center;margin-top:24px;">
        <button onclick="window.print()" style="
            background: linear-gradient(135deg, #00f2fe, #8a2be2);
            color: #fff; border: none; border-radius: 8px;
            padding: 12px 32px; font-size: 15px; font-weight: 700;
            cursor: pointer; letter-spacing: 0.5px;
            box-shadow: 0 6px 16px rgba(138,43,226,0.35);
        ">&#128424; Print This Receipt</button>
        <button onclick="window.close()" style="
            background: transparent;
            color: #888; border: 1px solid #ddd; border-radius: 8px;
            padding: 12px 24px; font-size: 15px; font-weight: 600;
            cursor: pointer; margin-left: 12px;
        ">Close</button>
    </div>

    <script>
        // Auto-trigger print dialog after a short delay for best UX
        window.addEventListener('load', () => {
            setTimeout(() => window.print(), 600);
        });
    <\/script>
</body>
</html>`;

        // Open receipt in new window and print
        const printWin = window.open('', '_blank', 'width=700,height=900,scrollbars=yes');
        if (printWin) {
            printWin.document.write(printContent);
            printWin.document.close();
        } else {
            alert('Pop-up blocked! Please allow pop-ups for this site to print receipts.');
        }
    });



    // ─── CASH Payment ────────────────────────────────────────────
    document.getElementById('btnCash')?.addEventListener('click', () => {
        if (!validateCommon()) return;
        const record = {
            receiptId:   genReceiptId(),
            studentName: payStudentName.value.trim(),
            course:      payCourse.value,
            amount:      payAmount.value,
            method:      'Cash',
            paidAt:      new Date().toISOString()
        };
        savePayment(record);
        showModal(record);
        payStudentName.value = '';
        payCourse.value = '';
        payAmount.value = '';
        updateSummary();
    });

    // ─── DEBIT CARD Payment ──────────────────────────────────────
    document.getElementById('btnDebit')?.addEventListener('click', () => {
        if (!validateCommon()) return;

        const num    = cardNumber?.value.replace(/\s/g, '');
        const holder = cardHolder?.value.trim();
        const expiry = cardExpiry?.value.trim();
        const cvv    = cardCVV?.value.trim();

        if (!holder)          { alert('Enter cardholder name.'); cardHolder.focus(); return; }
        if (num.length !== 16){ alert('Enter a valid 16-digit card number.'); cardNumber.focus(); return; }
        if (!/^\d{2}\/\d{2}$/.test(expiry)) { alert('Enter a valid expiry (MM/YY).'); cardExpiry.focus(); return; }
        if (cvv.length !== 3) { alert('Enter a valid 3-digit CVV.'); cardCVV.focus(); return; }

        // Simulate 1s processing
        const btn = document.getElementById('btnDebit');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing…';

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-lock"></i> Pay Securely';

            const record = {
                receiptId:   genReceiptId(),
                studentName: payStudentName.value.trim(),
                course:      payCourse.value,
                amount:      payAmount.value,
                method:      `Debit Card (****${num.slice(-4)})`,
                paidAt:      new Date().toISOString()
            };
            savePayment(record);
            showModal(record);

            // Reset form
            [cardHolder, cardNumber, cardExpiry, cardCVV].forEach(f => f ? f.value = '' : null);
            cardDisplayNumber.textContent = '•••• •••• •••• ••••';
            cardDisplayName.textContent   = 'FULL NAME';
            cardDisplayExpiry.textContent = 'MM/YY';
            cardDisplayCVV.textContent    = '•••';
            payStudentName.value = ''; payCourse.value = ''; payAmount.value = '';
            updateSummary();
        }, 1500);
    });

    // ─── UPI Payment ─────────────────────────────────────────────
    document.getElementById('btnUPI')?.addEventListener('click', () => {
        if (!validateCommon()) return;

        const upiId = document.getElementById('upiId')?.value.trim();
        if (!upiId || !upiId.includes('@')) {
            alert('Please enter a valid UPI ID (e.g. name@ybl).');
            document.getElementById('upiId').focus();
            return;
        }

        const btn = document.getElementById('btnUPI');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying…';

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Verify & Pay';

            const record = {
                receiptId:   genReceiptId(),
                studentName: payStudentName.value.trim(),
                course:      payCourse.value,
                amount:      payAmount.value,
                method:      `UPI (${upiId})`,
                paidAt:      new Date().toISOString()
            };
            savePayment(record);
            showModal(record);

            document.getElementById('upiId').value = '';
            payStudentName.value = ''; payCourse.value = ''; payAmount.value = '';
            updateSummary();
        }, 1800);
    });

    // ─── Render Payment History ───────────────────────────────────
    function renderHistory() {
        const payments = JSON.parse(localStorage.getItem('ikon_payments') || '[]');
        payHistoryList.innerHTML = '';

        if (payments.length === 0) {
            historyEmpty.style.display = 'flex';
            historyEmpty.style.flexDirection = 'column';
            historyEmpty.style.alignItems = 'center';
            payHistoryList.appendChild(historyEmpty);
            return;
        }

        payments.forEach(p => {
            const dateStr = new Date(p.paidAt).toLocaleString('en-IN', {
                dateStyle: 'short', timeStyle: 'short'
            });
            const methodKey = p.method.toLowerCase().startsWith('cash') ? 'cash'
                : p.method.toLowerCase().startsWith('debit') ? 'debit' : 'upi';

            const card = document.createElement('div');
            card.className = 'pay-record';
            card.innerHTML = `
                <div class="pay-record-top">
                    <span class="pay-record-name">${p.studentName}</span>
                    <span class="pay-record-amount">₹ ${parseFloat(p.amount).toFixed(2)}</span>
                </div>
                <div class="pay-record-course">${p.course}</div>
                <div class="pay-record-bottom">
                    <span class="pay-record-method method-${methodKey}">${p.method}</span>
                    <span class="pay-record-date">${dateStr}</span>
                </div>
            `;
            payHistoryList.appendChild(card);
        });
    }

    clearHistory?.addEventListener('click', () => {
        if (confirm('Clear all payment records?')) {
            localStorage.removeItem('ikon_payments');
            renderHistory();
        }
    });

    // ─── Init ─────────────────────────────────────────────────────
    renderHistory();
    updateSummary();
});
