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

let pdfLoaderPromise = null;

function loadPdfLibrary(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.onload = existing.onload || (() => resolve());
      existing.onerror = existing.onerror || (() => reject(new Error(`Failed to load ${src}`)));
      if (existing.readyState === 'complete' || existing.readyState === 'loaded') {
        resolve();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function loadPdfLibraries() {
  if (pdfLoaderPromise) {
    return pdfLoaderPromise;
  }

  const sources = [
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js'
  ];

  const fallbackSources = [
    'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
    'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.25/dist/jspdf.plugin.autotable.min.js'
  ];

  pdfLoaderPromise = loadPdfLibrary(sources[0])
    .then(() => loadPdfLibrary(sources[1]))
    .catch(() => {
      // Try fallback CDN if the first source fails
      return loadPdfLibrary(fallbackSources[0])
        .then(() => loadPdfLibrary(fallbackSources[1]));
    })
    .catch(error => {
      pdfLoaderPromise = null;
      throw error;
    });

  return pdfLoaderPromise;
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

  return encodeURIComponent(lines.join('\n'));
}

function getEmailAddress(value) {
  if (!value) {
    return '';
  }
  const emailMatch = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return emailMatch ? emailMatch[0] : '';
}

function emailQuote() {
  if (quoteState.items.length === 0) {
    return;
  }

  updateQuoteMetadata();
  const customerEmail = getEmailAddress(quoteState.customerContact);
  const subject = encodeURIComponent('ERP Quotation');
  const body = buildQuoteEmailBody();

  if (customerEmail) {
    const mailto = `mailto:${encodeURIComponent(customerEmail)}?cc=${encodeURIComponent('erpsolutionsph@gmail.com')}&subject=${subject}&body=${body}`;
    window.location.href = mailto;
  } else {
    const mailto = `mailto:erpsolutionsph@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  }
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
  const contentWidth = pageWidth - 2 * margin;
  const companyColor = [17, 89, 152];
  const companyTextColor = 255;
  const lineSpacing = 16;

  const quoteNumber = `ERP${new Date().getTime().toString().slice(-6)}`;
  const quoteDate = new Date().toLocaleDateString('en-PH');

  doc.setFillColor(...companyColor);
  doc.rect(0, 0, pageWidth, 100, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...companyTextColor);
  doc.text('ERP SOLUTIONS', margin, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const companyDetails = [
    'B9 L33 Flourite St. Futura Homes',
    'San Vicente, San Pedro, Laguna',
    'Mobile: 09204906942',
    'Email: erpsolutionsph@gmail.com'
  ];
  companyDetails.forEach((line, index) => {
    doc.text(line, margin, 72 + lineSpacing * index);
  });

  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('QUOTATION', pageWidth - margin, 52, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Date: ${quoteDate}`, pageWidth - margin, 72, { align: 'right' });
  doc.text(`Quote No: ${quoteNumber}`, pageWidth - margin, 88, { align: 'right' });

  const detailsTop = 120;
  doc.setDrawColor(220);
  doc.setLineWidth(0.5);
  doc.line(margin, detailsTop, pageWidth - margin, detailsTop);

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, detailsTop + 10, contentWidth, 68, 6, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 89, 152);
  doc.text('Prepared for', margin + 10, detailsTop + 28);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  const customerName = quoteState.customerName || 'Customer name not provided';
  const customerContact = quoteState.customerContact || 'Contact not provided';
  const deliveryLocation = quoteState.deliveryLocation || 'Delivery location not provided';

  doc.text(`Name: ${customerName}`, margin + 10, detailsTop + 46);
  doc.text(`Contact: ${customerContact}`, margin + 10, detailsTop + 60);
  doc.text(`Delivery: ${deliveryLocation}`, margin + 10, detailsTop + 74);

  const tableBody = quoteState.items.map((item, index) => [
    index + 1,
    item.name,
    item.quantity,
    'pcs',
    formatCurrency(item.price),
    formatCurrency(item.price * item.quantity)
  ]);

  doc.autoTable({
    head: [['#', 'Description', 'Qty', 'UOM', 'Unit Price', 'Total']],
    body: tableBody,
    startY: detailsTop + 95,
    theme: 'striped',
    headStyles: {
      fillColor: companyColor,
      textColor: companyTextColor,
      halign: 'center'
    },
    styles: {
      font: 'helvetica',
      fontSize: 10,
      textColor: 50,
      cellPadding: 6
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 28, halign: 'center' },
      1: { cellWidth: 230 },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 40, halign: 'center' },
      4: { cellWidth: 78, halign: 'right' },
      5: { cellWidth: 78, halign: 'right' }
    }
  });

  const afterY = doc.lastAutoTable.finalY + 20;
  const totalAmount = document.getElementById('quote-total') ? document.getElementById('quote-total').textContent : formatCurrency(0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Subtotal', pageWidth - margin - 160, afterY);
  doc.text(totalAmount, pageWidth - margin, afterY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Prices valid for 7 days. Delivery and payment terms will be confirmed on order.', margin, afterY + 30);
  doc.text('Thank you for considering ERP Solutions for your office and IT needs.', margin, afterY + 46);

  doc.setDrawColor(220);
  doc.line(margin, doc.internal.pageSize.getHeight() - 70, pageWidth - margin, doc.internal.pageSize.getHeight() - 70);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('ERP Solutions | erpsolutionsph@gmail.com | 09204906942 | erpsolutionsph.github.io/erp-computer-office-supplies', margin, doc.internal.pageSize.getHeight() - 50);

  return doc;
}

async function downloadQuote() {
  if (quoteState.items.length === 0) {
    return;
  }

  try {
    await loadPdfLibraries();
  } catch (error) {
    alert('Unable to load PDF export tools. Please check your internet connection and try again.');
    console.error(error);
    return;
  }

  const doc = buildPdfQuote();
  if (!doc) {
    return;
  }

  const filename = `ERP-Quotation-${new Date().toISOString().slice(0,10)}.pdf`;

  if (typeof doc.save === 'function') {
    try {
      doc.save(filename);
      return;
    } catch (saveError) {
      console.warn('doc.save failed, falling back to Blob download', saveError);
    }
  }

  try {
    const pdfBlob = doc.output('blob') || new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.type = 'application/pdf';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (blobError) {
    alert('Could not generate the PDF file. Please try again.');
    console.error(blobError);
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
