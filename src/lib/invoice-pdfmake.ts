// @ts-ignore
const PdfPrinter = require('pdfmake');
const PdfMake  = require('pdfmake');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TDocumentDefinitions = any;
type TDocMaker = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TableCell = any;

// Font files for pdfmake
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  status: string;
  company: {
    name: string;
    address: string;
    city: string;
    gst: string;
    email: string;
    phone: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  recurring?: {
    hasRecurring: boolean;
    items: { name: string; amount: number; period: string }[];
  };
}

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
}

function createInvoiceDoc(data: InvoiceData): TDocumentDefinitions {
  const { invoiceNumber, date, status, company, customer, items, subtotal, tax, discount, total, recurring } = data;

  // Table content for items
  const tableBody: TableCell[][] = [
    // Header row
    [
      { text: 'Item', style: 'tableHeader' },
      { text: 'Qty', style: 'tableHeader', alignment: 'center' },
      { text: 'Rate', style: 'tableHeader', alignment: 'right' },
      { text: 'Amount', style: 'tableHeader', alignment: 'right' }
    ]
  ];

  // Item rows
  items.forEach(item => {
    tableBody.push([
      { text: item.name, style: 'itemName' },
      { text: String(item.quantity), alignment: 'center' },
      { text: formatCurrency(item.rate), alignment: 'right' },
      { text: formatCurrency(item.amount), alignment: 'right', style: 'itemAmount' }
    ]);
  });

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 60],
    content: [
      // Header
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: company.name, style: 'companyName' },
              { text: company.address, style: 'companyInfo' },
              { text: company.city, style: 'companyInfo' },
              { text: `GST: ${company.gst}`, style: 'gstInfo' }
            ]
          },
          {
            width: 'auto',
            stack: [
              { text: 'INVOICE', style: 'invoiceTitle' },
              { text: `# ${invoiceNumber}`, style: 'invoiceNumber' },
              { text: `Date: ${date}`, style: 'invoiceDate' },
              { 
                text: status, 
                style: status === 'PAID' ? 'statusPaid' : 'statusPending',
                alignment: 'right'
              }
            ]
          }
        ]
      },
      { text: '', margin: [0, 10] },
      
      // Divider
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e5e5e5' }] },
      { text: '', margin: [0, 15] },

      // Bill To & Order Details
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'BILL TO', style: 'sectionHeader' },
              { text: customer.name || '', style: 'customerName' },
              { text: customer.address, style: 'customerInfo' },
              { text: customer.email, style: 'customerContact' },
              { text: customer.phone, style: 'customerContact' }
            ]
          },
          {
            width: '*',
            stack: [
              { text: 'ORDER DETAILS', style: 'sectionHeader', alignment: 'right' },
              { text: '', margin: [0, 5] }
            ],
            alignment: 'right'
          }
        ]
      },
      { text: '', margin: [0, 20] },

      // Items Table
      {
        table: {
          headerRows: 1,
          widths: ['*', 40, 80, 90],
          body: tableBody
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
          vLineWidth: () => 0,
          hLineColor: (i: number) => i === 1 ? '#333' : '#eee',
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6
        }
      },
      { text: '', margin: [0, 15] },

      // Totals
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 180,
            table: {
              widths: ['*', 'auto'],
              body: [
                [{ text: 'Subtotal', style: 'totalLabel' }, { text: formatCurrency(subtotal), alignment: 'right' }],
                ...(tax > 0 ? [[{ text: 'Tax', style: 'totalLabel' }, { text: formatCurrency(tax), alignment: 'right' }]] : []),
                ...(discount > 0 ? [[{ text: 'Discount', style: 'discountLabel' }, { text: `-${formatCurrency(discount)}`, alignment: 'right', color: '#16a34a' }]] : []),
                [{ text: 'Total', style: 'totalFinal' }, { text: formatCurrency(total), alignment: 'right', style: 'totalAmount' }]
              ]
            },
            layout: 'noBorders'
          }
        ]
      },

      // Recurring Info (inline, no box)
      ...(recurring && recurring.hasRecurring ? [
        { text: '', margin: [0, 15] },
        { 
          text: `Recurring: ${recurring.items.map(i => `${i.name}: Rs. ${i.amount.toLocaleString('en-IN')}/${i.period}`).join(' | ')}`,
          style: 'recurringInfo'
        }
      ] : []),

      // Footer
      { text: '', margin: [0, 30] },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineColor: '#e5e5e5' }] },
      { text: '', margin: [0, 10] },
      { 
        text: 'Thank you for your business!', 
        style: 'footer',
        alignment: 'center'
      },
      { 
        text: `${company.name} | ${company.email} | ${company.phone}`, 
        style: 'footerInfo',
        alignment: 'center'
      },
      { 
        text: 'Computer-generated invoice. No signature required.', 
        style: 'footerSmall',
        alignment: 'center'
      }
    ],
    styles: {
      companyName: { fontSize: 20, bold: true, color: '#1a1a2e' },
      companyInfo: { fontSize: 9, color: '#4b5563' },
      gstInfo: { fontSize: 8, color: '#9ca3af' },
      invoiceTitle: { fontSize: 24, bold: true, color: '#2563eb' },
      invoiceNumber: { fontSize: 10, bold: true, color: '#1a1a2e', margin: [0, 5, 0, 0] },
      invoiceDate: { fontSize: 10, color: '#4b5563', margin: [0, 0, 0, 5] },
      statusPaid: { fontSize: 9, bold: true, color: '#16a34a', background: '#dcfce7', margin: [5, 2] },
      statusPending: { fontSize: 9, bold: true, color: '#b45309', background: '#fef3c7', margin: [5, 2] },
      sectionHeader: { fontSize: 9, bold: true, color: '#6b7280', margin: [0, 0, 0, 5] },
      customerName: { fontSize: 11, bold: true, color: '#1a1a2e' },
      customerInfo: { fontSize: 10, color: '#4b5563', margin: [0, 2, 0, 0] },
      customerContact: { fontSize: 9, color: '#9ca3af', margin: [0, 2, 0, 0] },
      tableHeader: { fontSize: 9, bold: true, color: '#4b5563', fillColor: '#f9fafb' },
      itemName: { fontSize: 10, color: '#1a1a2e' },
      itemAmount: { fontSize: 10, bold: true },
      totalLabel: { fontSize: 10, color: '#4b5563' },
      discountLabel: { fontSize: 10, color: '#16a34a' },
      totalFinal: { fontSize: 12, bold: true, color: '#1a1a2e' },
      totalAmount: { fontSize: 14, bold: true, color: '#2563eb' },
      recurringInfo: { fontSize: 10, color: '#4b5563', italics: true },
      footer: { fontSize: 10, color: '#4b5563', margin: [0, 0, 0, 5] },
      footerInfo: { fontSize: 8, color: '#9ca3af', margin: [0, 0, 0, 3] },
      footerSmall: { fontSize: 7, color: '#d1d5db' }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };

  return docDefinition;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const pdfPrinter = new PdfPrinter(fonts);
  
  const docDefinition = createInvoiceDoc(data);
  
  return new Promise((resolve, reject) => {
    const pdfDoc = pdfPrinter.createPdfKitDocument(docDefinition);
    
    const chunks: Buffer[] = [];
    
    pdfDoc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    pdfDoc.on('end', () => {
      const result = Buffer.concat(chunks);
      resolve(result);
    });
    
    pdfDoc.on('error', (err: Error) => {
      reject(err);
    });
    
    pdfDoc.end();
  });
}

// Helper to transform order data to invoice data
export function transformOrderToInvoiceData(order: any): InvoiceData {
  const billingAddr = order.billingAddress || order.shippingAddress || {};
  const customerName = billingAddr.company || 
    `${billingAddr.firstName || ''} ${billingAddr.lastName || ''}`.trim() || 
    order.email?.split('@')[0] || 'Customer';
  
  const customerAddress = [
    billingAddr.address1,
    billingAddr.address2,
    [billingAddr.city, billingAddr.state, billingAddr.postalCode].filter(Boolean).join(', ')
  ].filter(Boolean).join(', ');

  const items: InvoiceItem[] = (order.items || []).map((item: any) => ({
    name: item.product?.name || item.name || 'Item',
    description: item.variant?.name || item.description,
    quantity: Number(item.quantity) || 1,
    rate: Number(item.unitPrice) || 0,
    amount: Number(item.totalPrice) || (Number(item.quantity) * Number(item.unitPrice)) || 0
  }));

  const subtotal = Number(order.subtotal) || items.reduce((sum: number, i: InvoiceItem) => sum + i.amount, 0);
  const tax = Number(order.taxAmount) || 0;
  const discount = Number(order.discountAmount) || 0;
  const total = Number(order.total) || subtotal + tax - discount;

  // Check for recurring items
  const recurringItems = (order.items || []).filter((item: any) => item.isRecurring);
  const hasRecurring = recurringItems.length > 0;

  return {
    invoiceNumber: generateInvoiceNumber(),
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: order.paymentStatus || 'PENDING',
    company: {
      name: 'Shaurrya Teleservices',
      address: 'Laxmi Plaza, 213, Off New Link Rd, Laxmi Industrial Estate',
      city: 'Andheri West, Mumbai, Maharashtra 400053',
      gst: '27ABCCS1234A1Z9',
      email: 'info@shaurryatele.com',
      phone: '+91 99102 05084'
    },
    customer: {
      name: customerName,
      email: order.email || '',
      phone: billingAddr.phone || order.phone || '',
      address: customerAddress
    },
    items,
    subtotal,
    tax,
    discount,
    total,
    recurring: hasRecurring ? {
      hasRecurring: true,
      items: recurringItems.map((item: any) => ({
        name: item.product?.name || item.name || 'Item',
        amount: Number(item.recurringPrice) || 0,
        period: item.billingCycle === 'YEARLY' ? 'year' : 'month'
      }))
    } : undefined
  };
}

export function createPdfBuffer(invoiceData: InvoiceData): Buffer {
  const fonts = {
    Roboto: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique'
    }
  };
  
  const printer = new PdfPrinter(fonts);
  const doc = createInvoiceDoc(invoiceData);
  
  return printer.createPdfKitDocument(doc);
}
