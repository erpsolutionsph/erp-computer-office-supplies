const quoteProducts = [
  { name: 'Battery', price: 1990.00, description: 'CSB HR 1221WF2 Battery — reliable UPS power backup for office systems' },
  { name: 'Webcam', price: 3950.00, description: 'Logitech C920E 1080P HD Pro Webcam — professional video conferencing and recording' },
  { name: 'USB Extender', price: 1500.00, description: 'UNITK Y278 USB 2.0 Active Extension Cable 10M — extended device reach for office workstations' },
  { name: 'USB To serials', price: 1600.00, description: 'DT-5002A DTECH USB to RS232 Serial Cable — reliable legacy device connectivity' }
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
  select.innerHTML = '';

  quoteProducts.forEach(product => {
    const option = document.createElement('option');
    option.value = product.name;
    option.textContent = `${product.name} — ${formatCurrency(product.price)}`;
    select.appendChild(option);
  });
}

function renderQuoteItems() {
  const tbody = document.getElementById('quote-items');
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

  document.getElementById('quote-total').textContent = formatCurrency(total);
  document.getElementById('email-quote').disabled = quoteState.items.length === 0;
  document.getElementById('clear-quote').disabled = quoteState.items.length === 0;
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
  lines.push(`Estimated total: ${document.getElementById('quote-total').textContent}`);
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

function initQuoteBuilder() {
  renderQuoteProducts();
  renderQuoteItems();
  document.getElementById('add-quote-item').addEventListener('click', addQuoteItem);
  document.getElementById('clear-quote').addEventListener('click', clearQuote);
  document.getElementById('email-quote').addEventListener('click', emailQuote);
}

window.addEventListener('DOMContentLoaded', initQuoteBuilder);
