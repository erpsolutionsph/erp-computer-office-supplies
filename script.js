const quoteProducts = [
  { name: 'Battery', price: 1990.00, description: 'CSB HR 1221WF2 Battery — reliable UPS power backup for office systems', image: 'assets/battery.jpg' },
  { name: 'Webcam', price: 3950.00, description: 'Logitech C920E 1080P HD Pro Webcam — professional video conferencing and recording', image: 'assets/webcam-1.jpg' },
  { name: 'USB Extender', price: 1500.00, description: 'UNITK Y278 USB 2.0 Active Extension Cable 10M — extended device reach for office workstations', image: 'assets/webcam-2.jpg' },
  { name: 'USB To serials', price: 1600.00, description: 'DT-5002A DTECH USB to RS232 Serial Cable — reliable legacy device connectivity', image: 'assets/webcam-2.jpg' }
];

const quoteState = {
  items: []
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
  const totalText = document.getElementById('quote-total') ? document.getElementById('quote-total').textContent : formatCurrency(0);
  lines.push(`Estimated total: ${totalText}`);
  lines.push('');
  lines.push('Please confirm availability, lead time, and delivery options.');

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

function buildQuoteDocument() {
  const quoteLines = [
    'ERP Computer & Office Supplies Services',
    'Quotation Document',
    '',
    `Date: ${new Date().toLocaleDateString('en-PH')}`,
    '',
    'Itemized Quote:',
    ''
  ];

  quoteState.items.forEach(item => {
    const lineTotal = item.price * item.quantity;
    quoteLines.push(`${item.name} — Qty: ${item.quantity} — Unit: ${formatCurrency(item.price)} — Total: ${formatCurrency(lineTotal)}`);
  });

  const totalText = document.getElementById('quote-total') ? document.getElementById('quote-total').textContent : formatCurrency(0);
  quoteLines.push('');
  quoteLines.push(`Estimated total: ${totalText}`);
  quoteLines.push('');
  quoteLines.push('Thank you for requesting a quotation. Please contact us for availability and delivery options.');

  return quoteLines.join('\n');
}

function downloadQuote() {
  if (quoteState.items.length === 0) {
    return;
  }

  const documentText = buildQuoteDocument();
  const blob = new Blob([documentText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ERP-quote.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
