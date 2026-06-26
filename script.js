const quoteProducts = [
  { name: 'Battery', price: 1990.00, description: 'CSB HR 1221WF2 Battery — reliable UPS power backup for office systems', image: 'assets/battery.jpg' },
  { name: 'Webcam', price: 3950.00, description: 'Logitech C920E 1080P HD Pro Webcam — professional video conferencing and recording', image: 'assets/webcam-1.jpg' },
  { name: 'USB Extender', price: 1500.00, description: 'UNITK Y278 USB 2.0 Active Extension Cable 10M — extended device reach for office workstations', image: 'assets/webcam-2.jpg' },
  { name: 'USB To serials', price: 1600.00, description: 'DT-5002A DTECH USB to RS232 Serial Cable — reliable legacy device connectivity', image: 'assets/webcam-2.jpg' }
];

const quoteState = {
  items: [],
  customerName: '',
  customerContact: '',
  deliveryLocation: ''
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function renderQuoteProducts() {
  const select = document.getElementById('quote-product');
  if (!select) {
    return;
  }

  select.innerHTML = '';

  quoteProducts.forEach(product => {
    const option = document.createElement('option');
    option.value = product.name;
    option.textContent = `${product.name} — ${formatCurrency(product.price)}`;
    select.appendChild(option);
  });

  updateProductPreview();
}

function updateQuoteMetadata() {
  const nameInput = document.getElementById('quote-customer-name');
  const contactInput = document.getElementById('quote-customer-contact');
  const deliveryInput = document.getElementById('quote-delivery-location');

  quoteState.customerName = nameInput ? nameInput.value.trim() : '';
  quoteState.customerContact = contactInput ? contactInput.value.trim() : '';
  quoteState.deliveryLocation = deliveryInput ? deliveryInput.value.trim() : '';

  const preparedFor = document.getElementById('quote-prepared-for');
  if (preparedFor) {
    preparedFor.textContent = quoteState.customerName || 'Enter customer details above';
  }

  const quoteContact = document.getElementById('quote-contact');
  if (quoteContact) {
    quoteContact.textContent = quoteState.customerContact || 'Not specified';
  }

  const quoteDelivery = document.getElementById('quote-delivery');
  if (quoteDelivery) {
    quoteDelivery.textContent = quoteState.deliveryLocation || 'Not specified';
  }
}

function updateProductPreview() {
  const productSelect = document.getElementById('quote-product');
  if (!productSelect) {
    return;
  }

  const productName = productSelect.value;
  const product = quoteProducts.find(p => p.name === productName) || quoteProducts[0];

  const imageEl = document.getElementById('quote-product-image');
  if (imageEl) {
    imageEl.src = product.image || 'assets/logo.jpg';
    imageEl.alt = product.name;
  }

  const nameEl = document.getElementById('quote-product-name');
  if (nameEl) {
    nameEl.textContent = product.name;
  }

  const descEl = document.getElementById('quote-product-desc');
  if (descEl) {
    descEl.textContent = product.description;
  }

  const priceEl = document.getElementById('quote-product-price');
  if (priceEl) {
    priceEl.textContent = formatCurrency(product.price);
  }
}

function openQuoteModal() {
  const modal = document.getElementById('quote-modal');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeQuoteModal() {
  const modal = document.getElementById('quote-modal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function renderQuoteItems() {
  const tbody = document.getElementById('quote-items');
  if (!tbody) {
    return;
  }

  tbody.innerHTML = '';
  let total = 0;

  if (quoteState.items.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.setAttribute('colspan', '5');
    td.className = 'quote-empty';
    td.textContent = 'No items added yet. Select a product and quantity to build your quote.';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  quoteState.items.forEach((item, index) => {
    const tr = document.createElement('tr');

    const nameTd = document.createElement('td');
    nameTd.textContent = item.name;
    tr.appendChild(nameTd);

    const qtyTd = document.createElement('td');
    qtyTd.textContent = item.quantity;
    tr.appendChild(qtyTd);

    const priceTd = document.createElement('td');
    priceTd.textContent = formatCurrency(item.price);
    tr.appendChild(priceTd);

    const totalTd = document.createElement('td');
    const lineTotal = item.quantity * item.price;
    total += lineTotal;
    totalTd.textContent = formatCurrency(lineTotal);
    tr.appendChild(totalTd);

    const actionTd = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'quote-item-remove';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => removeQuoteItem(index));
    actionTd.appendChild(removeButton);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });

  const totalEl = document.getElementById('quote-total');
  if (totalEl) {
    totalEl.textContent = formatCurrency(total);
  }

  updateQuoteMetadata();

  const emailQuoteButton = document.getElementById('email-quote');
  if (emailQuoteButton) {
    emailQuoteButton.disabled = quoteState.items.length === 0;
  }

  const clearQuoteButton = document.getElementById('clear-quote');
  if (clearQuoteButton) {
    clearQuoteButton.disabled = quoteState.items.length === 0;
  }
}

function addQuoteItem() {
  const productName = document.getElementById('quote-product').value;
  const quantity = parseInt(document.getElementById('quote-quantity').value, 10);
  if (!productName || quantity < 1) {
    return;
  }

  updateQuoteMetadata();

  const product = quoteProducts.find(p => p.name === productName);
  if (!product) {
    return;
  }

  const existingItem = quoteState.items.find(item => item.name === product.name);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    quoteState.items.push({
      name: product.name,
      price: product.price,
      quantity
    });
  }

  renderQuoteItems();
}

function removeQuoteItem(index) {
  quoteState.items.splice(index, 1);
  renderQuoteItems();
}

function clearQuote() {
  quoteState.items = [];
  renderQuoteItems();
}

function buildQuoteEmailBody() {
  const lines = [
    'Quotation Request from ERP Computer & Office Supplies Services',
    '',
    'Itemized Quote:',
    ''
  ];

  quoteState.items.forEach(item => {
    const lineTotal = item.price * item.quantity;
    lines.push(`${item.name} — Qty: ${item.quantity} — Unit: ${formatCurrency(item.price)} — Total: ${formatCurrency(lineTotal)}`);
  });

  lines.push('');
  lines.push(`Customer: ${quoteState.customerName || 'N/A'}`);
  lines.push(`Contact: ${quoteState.customerContact || 'N/A'}`);
  lines.push(`Delivery Location: ${quoteState.deliveryLocation || 'N/A'}`);
  lines.push('');
  const totalText = document.getElementById('quote-total') ? document.getElementById('quote-total').textContent : formatCurrency(0);
  lines.push(`Estimated total: ${totalText}`);
  lines.push('');
  lines.push('Please confirm availability, lead time, and delivery options.');
  lines.push('Site: https://erpsolutionsph.github.io/erp-computer-office-supplies/');

  return encodeURIComponent(lines.join('\n'));
}

function emailQuote() {
  if (quoteState.items.length === 0) {
    return;
  }

  const subject = encodeURIComponent('Quotation Request — ERP Computer & Office Supplies Services');
  const body = buildQuoteEmailBody();
  window.location.href = `mailto:erpsolutionsph@gmail.com?subject=${subject}&body=${body}`;
}

function buildPdfQuote() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('PDF generation library failed to load. Please refresh the page.');
    return null;
  }

  const jsPDF = window.jspdf.jsPDF;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ERP SOLUTIONS', margin, 60);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('B9 L33 FLOURITE ST. FUTURA HOMES', margin, 82);
  doc.text('SAN VICENTE, SAN PEDRO, LAGUNA', margin, 96);
  doc.text('MOBILE NO: 09204906942', margin, 110);
  doc.text('EMAIL: erpsolutionsph@gmail.com', margin, 124);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', pageWidth - margin, 60, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date().toLocaleDateString('en-PH')}`, pageWidth - margin, 82, { align: 'right' });
  doc.text('RFQ No: ERP0618', pageWidth - margin, 96, { align: 'right' });

  doc.setDrawColor(200);
  doc.setFillColor(240);
  doc.rect(margin, 145, pageWidth - margin * 2, 90, 'F');

  doc.setFontSize(10);
  doc.setTextColor(17, 89, 152);
  doc.text('Prepared for', margin + 8, 162);

  doc.setTextColor(0);
  const customerName = quoteState.customerName || 'Customer name not provided';
  const customerContact = quoteState.customerContact || 'Contact not provided';
  const deliveryLocation = quoteState.deliveryLocation || 'Delivery location not provided';

  doc.text(`Name: ${customerName}`, margin + 8, 178);
  doc.text(`Contact: ${customerContact}`, margin + 8, 194);
  doc.text(`Delivery: ${deliveryLocation}`, margin + 8, 210);
  doc.text('Website: erpsolutionsph.github.io/erp-computer-office-supplies', margin + 8, 226);

  const tableBody = quoteState.items.map((item, index) => {
    return [
      index + 1,
      item.name,
      item.quantity,
      'unit',
      formatCurrency(item.price),
      formatCurrency(item.price * item.quantity)
    ];
  });

  doc.autoTable({
    head: [['#', 'Item Description', 'Qty', 'UOM', 'Unit Price', 'Total Amount']],
    body: tableBody,
    startY: 235,
    tableWidth: 'auto',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    headStyles: { fillColor: [17, 89, 152], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 220 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
      4: { cellWidth: 68 },
      5: { cellWidth: 70 }
    }
  });

  const afterY = doc.lastAutoTable.finalY + 20;
  const totalText = document.getElementById('quote-total') ? document.getElementById('quote-total').textContent : formatCurrency(0);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT', pageWidth - margin - 180, afterY);
  doc.text(totalText, pageWidth - margin, afterY, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your request. Prices are subject to availability and confirmation.', margin, afterY + 30);
  doc.text('Payment terms, leadtime and shipping fees will be confirmed upon order.', margin, afterY + 44);
  doc.text('Updated site: erpsolutionsph.github.io/erp-computer-office-supplies', margin, afterY + 64);

  return doc;
}

function downloadQuote() {
  if (quoteState.items.length === 0) {
    return;
  }

  const doc = buildPdfQuote();
  if (doc) {
    const filename = `ERP-Quotation-${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);
  }
}

function initQuoteBuilder() {
  renderQuoteProducts();
  renderQuoteItems();

  const addQuoteButton = document.getElementById('add-quote-item');
  if (addQuoteButton) {
    addQuoteButton.addEventListener('click', addQuoteItem);
  }

  const clearQuoteButton = document.getElementById('clear-quote');
  if (clearQuoteButton) {
    clearQuoteButton.addEventListener('click', clearQuote);
  }

  const downloadQuoteButton = document.getElementById('download-quote');
  if (downloadQuoteButton) {
    downloadQuoteButton.addEventListener('click', downloadQuote);
  }

  const emailQuoteButton = document.getElementById('email-quote');
  if (emailQuoteButton) {
    emailQuoteButton.addEventListener('click', emailQuote);
  }

  const quoteProductSelect = document.getElementById('quote-product');
  if (quoteProductSelect) {
    quoteProductSelect.addEventListener('change', updateProductPreview);
  }

  const quoteCustomerName = document.getElementById('quote-customer-name');
  if (quoteCustomerName) {
    quoteCustomerName.addEventListener('input', updateQuoteMetadata);
  }

  const quoteCustomerContact = document.getElementById('quote-customer-contact');
  if (quoteCustomerContact) {
    quoteCustomerContact.addEventListener('input', updateQuoteMetadata);
  }

  const quoteDeliveryLocation = document.getElementById('quote-delivery-location');
  if (quoteDeliveryLocation) {
    quoteDeliveryLocation.addEventListener('input', updateQuoteMetadata);
  }

  const openQuoteModalButton = document.getElementById('open-quote-modal');
  if (openQuoteModalButton) {
    openQuoteModalButton.addEventListener('click', openQuoteModal);
  }

  const openQuoteModalButton2 = document.getElementById('open-quote-modal-2');
  if (openQuoteModalButton2) {
    openQuoteModalButton2.addEventListener('click', openQuoteModal);
  }

  const closeQuoteModalButton = document.getElementById('close-quote-modal');
  if (closeQuoteModalButton) {
    closeQuoteModalButton.addEventListener('click', closeQuoteModal);
  }

  const modalOverlay = document.querySelector('.modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', event => {
      if (event.target === event.currentTarget) {
        closeQuoteModal();
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', initQuoteBuilder);
