const STORAGE_KEYS = {
  config: 'pataboda_config_v1',
  applications: 'pataboda_applications_v1',
  adminAuth: 'pataboda_admin_auth_v1'
};

const defaultConfig = {
  whatsappNumber: 'ENTER WHATSAPP NUMBER HERE',
  businessPhone: '+254 700 000 000',
  businessEmail: 'hello@yourbusiness.co.ke',
  officeLocation: 'Nairobi, Kenya',
  minFinancing: 50000,
  maxFinancing: 500000,
  requirements: [
    'National ID or passport',
    'Driving licence where applicable',
    'Passport-size photo',
    'Other supporting documents when requested'
  ],
  financingOptions: [
    'Standard boda boda finance',
    'Upgrade financing',
    'Boda boda purchase support'
  ],
  adminPassword: 'pataboda-admin-2025'
};

const appState = {
  currentPage: 'home',
  step: 1,
  draft: null,
  selectedApplicationId: null,
  isAdminLoggedIn: false,
  searchTerm: '',
  statusFilter: 'All'
};

const statusOptions = [
  'New',
  'Under Review',
  'More Information Required',
  'Approved',
  'Declined',
  'Completed'
];

const legalPages = new Map([
  ['privacy-policy', 'privacy-policy'],
  ['terms-conditions', 'terms-conditions']
]);

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getConfig() {
  const stored = localStorage.getItem(STORAGE_KEYS.config);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(defaultConfig));
    return deepClone(defaultConfig);
  }

  try {
    const parsed = JSON.parse(stored);
    return { ...deepClone(defaultConfig), ...parsed };
  } catch (error) {
    return deepClone(defaultConfig);
  }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
}

function getApplications() {
  const stored = localStorage.getItem(STORAGE_KEYS.applications);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return [];
  }
}

function saveApplications(applications) {
  localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(applications));
}

function getAdminAuth() {
  return localStorage.getItem(STORAGE_KEYS.adminAuth) === 'true';
}

function setAdminAuth(authenticated) {
  localStorage.setItem(STORAGE_KEYS.adminAuth, String(authenticated));
}

function normalizeText(value) {
  return (value || '').trim();
}

function generateReferenceId() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PCK-${random}`;
}

function formatMoney(value) {
  if (!value && value !== 0) return 'Not provided';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0
  }).format(Number(value));
}

function buildWhatsAppMessage(application) {
  const config = getConfig();
  const lines = [
    'NEW PATABODA CREDIT APPLICATION',
    'Applicant Details',
    `Full Name: ${application.fullName || 'Not provided'}`,
    `Phone: ${application.phoneNumber || 'Not provided'}`,
    `ID Number: ${application.idNumber || 'Not provided'}`,
    `County: ${application.county || 'Not provided'}`,
    `Location: ${application.residentialLocation || 'Not provided'}`,
    '',
    'Boda Boda Information',
    `Current Rider: ${application.worksAsRider || 'Not provided'}`,
    `Motorbike Owner: ${application.ownsMotorbike || 'Not provided'}`,
    `Riding Experience: ${application.yearsRiding || 'Not provided'}`,
    `Licence: ${application.hasLicence || 'Not provided'}`,
    `Preferred Bike: ${application.preferredBike || 'Not provided'}`,
    `Financing Amount: ${formatMoney(application.financingAmount)}`,
    '',
    'Income Information',
    `Occupation: ${application.occupation || 'Not provided'}`,
    `Monthly Income: ${formatMoney(application.monthlyIncome)}`,
    '',
    'Next of Kin',
    `Name: ${application.nextOfKinName || 'Not provided'}`,
    `Phone: ${application.nextOfKinPhone || 'Not provided'}`,
    `Relationship: ${application.nextOfKinRelationship || 'Not provided'}`,
    '',
    `APPLICATION ID: ${application.referenceId || 'Not generated'}`,
    '',
    `Business contact: ${config.businessPhone || 'Not set'}`
  ];

  return lines.join('\n');
}

function ensureDraft() {
  if (!appState.draft) {
    appState.draft = {
      fullName: '',
      phoneNumber: '',
      altPhone: '',
      dateOfBirth: '',
      idNumber: '',
      county: '',
      subCounty: '',
      town: '',
      ownsMotorbike: '',
      worksAsRider: '',
      yearsRiding: '',
      hasLicence: '',
      hasPermit: '',
      preferredBike: '',
      financingAmount: '',
      occupation: '',
      incomeSource: '',
      monthlyIncome: '',
      incomeDuration: '',
      employerName: '',
      residentialLocation: '',
      nearestTown: '',
      nextOfKinName: '',
      nextOfKinPhone: '',
      nextOfKinRelationship: '',
      idDocument: '',
      drivingLicence: '',
      passportPhoto: '',
      supportingDocuments: '',
      consent: false,
      status: 'New'
    };
  }
}

function loadDraftFromForm() {
  const form = document.getElementById('applicationForm');
  if (!form) return;

  ensureDraft();
  const formData = new FormData(form);

  appState.draft.fullName = normalizeText(formData.get('fullName'));
  appState.draft.phoneNumber = normalizeText(formData.get('phoneNumber'));
  appState.draft.altPhone = normalizeText(formData.get('altPhone'));
  appState.draft.dateOfBirth = normalizeText(formData.get('dateOfBirth'));
  appState.draft.idNumber = normalizeText(formData.get('idNumber'));
  appState.draft.county = normalizeText(formData.get('county'));
  appState.draft.subCounty = normalizeText(formData.get('subCounty'));
  appState.draft.town = normalizeText(formData.get('town'));
  appState.draft.ownsMotorbike = normalizeText(formData.get('ownsMotorbike'));
  appState.draft.worksAsRider = normalizeText(formData.get('worksAsRider'));
  appState.draft.yearsRiding = normalizeText(formData.get('yearsRiding'));
  appState.draft.hasLicence = normalizeText(formData.get('hasLicence'));
  appState.draft.hasPermit = normalizeText(formData.get('hasPermit'));
  appState.draft.preferredBike = normalizeText(formData.get('preferredBike'));
  appState.draft.financingAmount = normalizeText(formData.get('financingAmount'));
  appState.draft.occupation = normalizeText(formData.get('occupation'));
  appState.draft.incomeSource = normalizeText(formData.get('incomeSource'));
  appState.draft.monthlyIncome = normalizeText(formData.get('monthlyIncome'));
  appState.draft.incomeDuration = normalizeText(formData.get('incomeDuration'));
  appState.draft.employerName = normalizeText(formData.get('employerName'));
  appState.draft.residentialLocation = normalizeText(formData.get('residentialLocation'));
  appState.draft.nearestTown = normalizeText(formData.get('nearestTown'));
  appState.draft.nextOfKinName = normalizeText(formData.get('nextOfKinName'));
  appState.draft.nextOfKinPhone = normalizeText(formData.get('nextOfKinPhone'));
  appState.draft.nextOfKinRelationship = normalizeText(formData.get('nextOfKinRelationship'));
  appState.draft.consent = Boolean(formData.get('consent'));

  const fileNames = {
    idDocument: formData.get('idDocument') ? formData.get('idDocument').name : '',
    drivingLicence: formData.get('drivingLicence') ? formData.get('drivingLicence').name : '',
    passportPhoto: formData.get('passportPhoto') ? formData.get('passportPhoto').name : '',
    supportingDocuments: Array.from(formData.getAll('supportingDocuments')).map(file => file.name).join(', ')
  };

  appState.draft.idDocument = fileNames.idDocument;
  appState.draft.drivingLicence = fileNames.drivingLicence;
  appState.draft.passportPhoto = fileNames.passportPhoto;
  appState.draft.supportingDocuments = fileNames.supportingDocuments;
}

function setFormValues() {
  const form = document.getElementById('applicationForm');
  if (!form || !appState.draft) return;

  Object.entries(appState.draft).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field) return;

    if (field.type === 'checkbox') {
      field.checked = Boolean(value);
      return;
    }

    if (field instanceof RadioNodeList) {
      return;
    }

    field.value = value || '';
  });
}

function renderSummary() {
  const summaryEl = document.getElementById('reviewSummary');
  if (!summaryEl || !appState.draft) return;

  const sections = [
    {
      title: 'Personal Information',
      fields: {
        'Full Name': appState.draft.fullName,
        'Phone Number': appState.draft.phoneNumber,
        'Alternative Phone Number': appState.draft.altPhone || 'Not provided',
        'Date of Birth': appState.draft.dateOfBirth,
        'National ID / Passport Number': appState.draft.idNumber,
        'County': appState.draft.county,
        'Sub-County': appState.draft.subCounty,
        'Town / Area': appState.draft.town
      }
    },
    {
      title: 'Boda Boda Information',
      fields: {
        'Owns Motorbike': appState.draft.ownsMotorbike,
        'Working as Rider': appState.draft.worksAsRider,
        'Years as Rider': appState.draft.yearsRiding,
        'Licence': appState.draft.hasLicence,
        'Permit': appState.draft.hasPermit,
        'Preferred Bike': appState.draft.preferredBike,
        'Preferred Financing Amount': formatMoney(appState.draft.financingAmount)
      }
    },
    {
      title: 'Income Information',
      fields: {
        'Occupation': appState.draft.occupation,
        'Source of Income': appState.draft.incomeSource,
        'Monthly Income': formatMoney(appState.draft.monthlyIncome),
        'Income Duration': appState.draft.incomeDuration,
        'Employer / Business': appState.draft.employerName || 'Not provided'
      }
    },
    {
      title: 'Residence & Contact',
      fields: {
        'Residential Location': appState.draft.residentialLocation,
        'Nearest Town': appState.draft.nearestTown,
        'Next of Kin Name': appState.draft.nextOfKinName,
        'Next of Kin Phone': appState.draft.nextOfKinPhone,
        'Relationship': appState.draft.nextOfKinRelationship
      }
    },
    {
      title: 'Documents',
      fields: {
        'ID Document': appState.draft.idDocument || 'Not uploaded',
        'Driving Licence': appState.draft.drivingLicence || 'Not uploaded',
        'Passport Photo': appState.draft.passportPhoto || 'Not uploaded',
        'Supporting Documents': appState.draft.supportingDocuments || 'Not uploaded'
      }
    }
  ];

  summaryEl.innerHTML = sections.map(section => {
    const items = Object.entries(section.fields).map(([label, value]) => `
      <div class="summary-item">
        <h4>${label}</h4>
        <p>${value}</p>
      </div>
    `).join('');

    return `
      <div class="field-block">
        <h3>${section.title}</h3>
        <div class="summary-grid">${items}</div>
      </div>
    `;
  }).join('');
}

function validateStep(step) {
  const form = document.getElementById('applicationForm');
  if (!form) return true;

  const stepFields = Array.from(form.querySelectorAll(`.form-step[data-step="${step}"] [required]`));
  let valid = true;

  stepFields.forEach(field => {
    const isCheckbox = field.type === 'checkbox';
    const hasValue = isCheckbox ? field.checked : normalizeText(field.value).length > 0;

    if (!hasValue) {
      field.classList.add('error-highlight');
      valid = false;
    } else {
      field.classList.remove('error-highlight');
    }
  });

  if (!valid) {
    alert('Please complete all required fields before continuing.');
  }

  return valid;
}

function showPage(pageName) {
  appState.currentPage = pageName;
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.classList.toggle('active', page.id === pageName);
  });

  if (pageName === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (pageName === 'admin') {
    updateAdminDashboardVisibility();
  }
}

function bindNavigation() {
  document.querySelectorAll('[data-show]').forEach(button => {
    button.addEventListener('click', () => {
      const pageName = button.getAttribute('data-show');
      if (pageName === 'apply') {
        ensureDraft();
        appState.step = 1;
        showApplicationStep(1);
        showPage('apply');
      } else if (pageName === 'admin') {
        showPage('admin');
      } else {
        showPage(pageName);
      }
    });
  });
}

function showApplicationStep(nextStep) {
  appState.step = nextStep;
  const steps = document.querySelectorAll('.form-step');
  steps.forEach(step => {
    step.classList.toggle('active', Number(step.dataset.step) === nextStep);
  });

  const indicators = document.querySelectorAll('[data-step-indicator]');
  indicators.forEach(indicator => {
    indicator.classList.toggle('active', Number(indicator.dataset.stepIndicator) === nextStep);
  });

  const prevBtn = document.getElementById('prevStepBtn');
  const nextBtn = document.getElementById('nextStepBtn');
  const reviewBtn = document.getElementById('reviewBtn');

  prevBtn.classList.toggle('hidden', nextStep === 1);
  nextBtn.classList.toggle('hidden', nextStep === 5);
  reviewBtn.classList.toggle('hidden', nextStep !== 5);
}

function updateConfigDisplay() {
  const config = getConfig();
  const fields = document.querySelectorAll('[data-config]');

  fields.forEach(field => {
    const key = field.getAttribute('data-config');
    if (key === 'whatsappDisplay') {
      field.textContent = config.whatsappNumber || 'ENTER WHATSAPP NUMBER HERE';
      return;
    }

    if (key === 'financingRange') {
      field.textContent = `KSh ${Number(config.minFinancing || 50000).toLocaleString()} - ${Number(config.maxFinancing || 500000).toLocaleString()}`;
      return;
    }

    field.textContent = config[key] || '';
  });

  const whatsappLink = document.getElementById('footerWhatsappLink');
  const phoneLink = document.getElementById('footerPhoneLink');

  if (whatsappLink) {
    const whatsappVal = config.whatsappNumber || '000000000';
    whatsappLink.href = `https://wa.me/${whatsappVal.replace(/\D/g, '')}`;
  }

  if (phoneLink) {
    phoneLink.href = `tel:${config.businessPhone || '+254700000000'}`;
    phoneLink.textContent = config.businessPhone || 'Phone';
  }
}

function initializeApplicationForm() {
  const form = document.getElementById('applicationForm');
  if (!form) return;

  form.addEventListener('input', event => {
    const field = event.target;
    if (field instanceof HTMLElement) {
      field.classList.remove('error-highlight');
    }
  });

  const nextButton = document.getElementById('nextStepBtn');
  const prevButton = document.getElementById('prevStepBtn');
  const reviewButton = document.getElementById('reviewBtn');

  nextButton.addEventListener('click', () => {
    if (!validateStep(appState.step)) return;
    loadDraftFromForm();
    showApplicationStep(appState.step + 1);
  });

  prevButton.addEventListener('click', () => {
    if (appState.step > 1) {
      showApplicationStep(appState.step - 1);
    }
  });

  reviewButton.addEventListener('click', () => {
    if (!validateStep(appState.step)) return;
    loadDraftFromForm();
    renderSummary();
    showPage('review');
  });

  ensureDraft();
  setFormValues();
  showApplicationStep(1);
}

function submitApplication() {
  loadDraftFromForm();
  const draft = deepClone(appState.draft);
  const referenceId = generateReferenceId();
  const createdAt = new Date().toISOString();

  const appRecord = {
    ...draft,
    referenceId,
    createdAt,
    status: 'New',
    notes: ''
  };

  const applications = getApplications();
  applications.unshift(appRecord);
  saveApplications(applications);

  appState.draft = appRecord;
  document.getElementById('applicationReference').textContent = referenceId;
  showPage('confirmation');
  renderAdminData();
}

function openWhatsAppApplication() {
  const config = getConfig();
  const message = buildWhatsAppMessage(appState.draft || {});
  const cleanedNumber = config.whatsappNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;

  const newWindow = window.open(whatsappUrl, '_blank');

  if (!newWindow) {
    const errorBox = document.getElementById('whatsAppError');
    errorBox.textContent = 'WhatsApp could not be opened. Please contact us using the WhatsApp number below.';
    errorBox.classList.remove('hidden');

    const configNumber = normalizeText(config.whatsappNumber || 'ENTER WHATSAPP NUMBER HERE');
    const messageBox = document.createElement('div');
    messageBox.className = 'status-message';
    messageBox.innerHTML = `<strong>Application information:</strong><br><pre>${escapeHtml(message)}</pre>`;
    errorBox.parentNode.insertBefore(messageBox, errorBox.nextSibling);
    return;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function bindReviewAndConfirmationButtons() {
  document.getElementById('editApplicationBtn').addEventListener('click', () => {
    showPage('apply');
    setFormValues();
    showApplicationStep(appState.step || 1);
  });

  document.getElementById('submitApplicationBtn').addEventListener('click', () => {
    submitApplication();
  });

  document.getElementById('sendWhatsAppBtn').addEventListener('click', () => {
    openWhatsAppApplication();
  });

  document.getElementById('backHomeBtn').addEventListener('click', () => {
    appState.draft = null;
    showPage('home');
    const form = document.getElementById('applicationForm');
    if (form) form.reset();
  });
}

function initializeConfigForm() {
  const config = getConfig();
  const configForm = document.getElementById('configForm');

  Object.entries(config).forEach(([key, value]) => {
    const field = configForm.elements.namedItem(key);
    if (!field) return;

    if (Array.isArray(value)) {
      field.value = value.join('\n');
    } else {
      field.value = value;
    }
  });

  configForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(configForm);
    const nextConfig = { ...getConfig() };

    nextConfig.whatsappNumber = normalizeText(formData.get('whatsappNumber')) || 'ENTER WHATSAPP NUMBER HERE';
    nextConfig.businessPhone = normalizeText(formData.get('businessPhone')) || '+254 700 000 000';
    nextConfig.businessEmail = normalizeText(formData.get('businessEmail')) || 'hello@yourbusiness.co.ke';
    nextConfig.officeLocation = normalizeText(formData.get('officeLocation')) || 'Nairobi, Kenya';
    nextConfig.minFinancing = Number(formData.get('minFinancing')) || 50000;
    nextConfig.maxFinancing = Number(formData.get('maxFinancing')) || 500000;
    nextConfig.requirements = String(formData.get('requirements') || '')
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);
    nextConfig.financingOptions = String(formData.get('financingOptions') || '')
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);

    saveConfig(nextConfig);
    updateConfigDisplay();
    renderAdminData();
    alert('Business settings saved.');
  });
}

function renderAdminData() {
  const tableWrap = document.getElementById('applicantsTableWrap');
  const details = document.getElementById('applicantDetails');

  if (!tableWrap || !details) return;

  const apps = getApplications();
  const filtered = apps.filter(app => {
    const search = appState.searchTerm.toLowerCase();
    const matchesSearch = !search ||
      [app.referenceId, app.fullName, app.phoneNumber, app.county].join(' ').toLowerCase().includes(search);
    const matchesStatus = appState.statusFilter === 'All' || app.status === appState.statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tableWrap.innerHTML = '<p class="empty-state">No applications found.</p>';
    return;
  }

  const rows = filtered.map(app => `
    <tr data-app-id="${app.referenceId}">
      <td><strong>${app.referenceId}</strong></td>
      <td>${app.fullName || 'Not provided'}</td>
      <td>${app.phoneNumber || 'Not provided'}</td>
      <td>${app.status || 'New'}</td>
      <td>
        <button type="button" data-view-app="${app.referenceId}">View</button>
      </td>
    </tr>
  `).join('');

  tableWrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Reference</th>
          <th>Applicant</th>
          <th>Phone</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  if (appState.selectedApplicationId) {
    const selected = filtered.find(app => app.referenceId === appState.selectedApplicationId) || filtered[0];
    if (selected) {
      showApplicantDetails(selected);
    }
  } else if (filtered[0]) {
    showApplicantDetails(filtered[0]);
  }

  document.querySelectorAll('[data-view-app]').forEach(button => {
    button.addEventListener('click', () => {
      const ref = button.getAttribute('data-view-app');
      const app = getApplications().find(item => item.referenceId === ref);
      if (app) {
        appState.selectedApplicationId = ref;
        showApplicantDetails(app);
      }
    });
  });
}

function showApplicantDetails(app) {
  const details = document.getElementById('applicantDetails');
  if (!details || !app) return;

  const statusMarkup = `
    <label class="detail-select">
      <span>Status</span>
      <select class="status-select" data-application-status="${app.referenceId}">
        ${statusOptions.map(option => `
          <option value="${option}" ${option === app.status ? 'selected' : ''}>${option}</option>
        `).join('')}
      </select>
    </label>
  `;

  details.innerHTML = `
    <div class="field-block">
      <strong>Reference</strong>
      <p>${app.referenceId}</p>
    </div>
    <div class="field-block">
      <strong>Applicant</strong>
      <p>${app.fullName || 'Not provided'}</p>
    </div>
    <div class="field-block">
      <strong>Phone</strong>
      <p>${app.phoneNumber || 'Not provided'}</p>
    </div>
    <div class="field-block">
      <strong>County</strong>
      <p>${app.county || 'Not provided'}</p>
    </div>
    <div class="field-block">
      <strong>Financing Amount</strong>
      <p>${formatMoney(app.financingAmount)}</p>
    </div>
    <div class="field-block">
      <strong>Notes</strong>
      <div class="notes-box">
        <textarea data-application-notes="${app.referenceId}" placeholder="Add notes">${app.notes || ''}</textarea>
      </div>
    </div>
    ${statusMarkup}
  `;

  const statusSelect = details.querySelector('[data-application-status]');
  const notesInput = details.querySelector('[data-application-notes]');

  statusSelect.addEventListener('change', event => {
    const newStatus = event.target.value;
    updateApplicationStatus(app.referenceId, newStatus);
  });

  notesInput.addEventListener('input', event => {
    updateApplicationNotes(app.referenceId, event.target.value);
  });
}

function updateApplicationStatus(referenceId, newStatus) {
  const applications = getApplications();
  const app = applications.find(item => item.referenceId === referenceId);
  if (!app) return;

  app.status = newStatus;
  saveApplications(applications);
  renderAdminData();
}

function updateApplicationNotes(referenceId, notes) {
  const applications = getApplications();
  const app = applications.find(item => item.referenceId === referenceId);
  if (!app) return;

  app.notes = notes;
  saveApplications(applications);
}

function initializeAdminDashboard() {
  const loginForm = document.getElementById('adminLoginForm');
  const search = document.getElementById('applicationSearch');
  const statusFilter = document.getElementById('statusFilter');

  appState.isAdminLoggedIn = getAdminAuth();
  updateAdminDashboardVisibility();

  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const enteredPassword = document.getElementById('adminPasswordInput').value;
    const config = getConfig();
    const valid = enteredPassword === config.adminPassword;

    const errorBox = document.getElementById('adminLoginError');
    errorBox.textContent = valid ? '' : 'Incorrect admin password.';

    if (!valid) return;

    setAdminAuth(true);
    appState.isAdminLoggedIn = true;
    updateAdminDashboardVisibility();
  });

  document.getElementById('logoutAdminBtn').addEventListener('click', () => {
    setAdminAuth(false);
    appState.isAdminLoggedIn = false;
    updateAdminDashboardVisibility();
    document.getElementById('adminPasswordInput').value = '';
  });

  search.addEventListener('input', event => {
    appState.searchTerm = event.target.value;
    renderAdminData();
  });

  statusFilter.addEventListener('change', event => {
    appState.statusFilter = event.target.value;
    renderAdminData();
  });

  document.getElementById('exportApplicationsBtn').addEventListener('click', exportApplicationsToCsv);
}

function updateAdminDashboardVisibility() {
  const loginPane = document.getElementById('adminLoginPane');
  const dashboard = document.getElementById('adminDashboard');
  const auth = getAdminAuth();

  loginPane.classList.toggle('hidden', auth);
  dashboard.classList.toggle('hidden', !auth);

  if (auth) {
    renderAdminData();
    const config = getConfig();
    const configForm = document.getElementById('configForm');
    Object.entries(config).forEach(([key, value]) => {
      const field = configForm.elements.namedItem(key);
      if (!field) return;
      if (Array.isArray(value)) {
        field.value = value.join('\n');
      } else {
        field.value = value;
      }
    });
  }
}

function exportApplicationsToCsv() {
  const applications = getApplications();
  if (!applications.length) {
    alert('No applications to export.');
    return;
  }

  const headers = [
    'Reference ID',
    'Full Name',
    'Phone Number',
    'ID Number',
    'County',
    'Status',
    'Preferred Bike',
    'Financing Amount',
    'Monthly Income',
    'Next of Kin',
    'Next of Kin Phone',
    'Application Date'
  ];

  const rows = applications.map(app => [
    app.referenceId,
    app.fullName,
    app.phoneNumber,
    app.idNumber,
    app.county,
    app.status,
    app.preferredBike,
    app.financingAmount,
    app.monthlyIncome,
    app.nextOfKinName,
    app.nextOfKinPhone,
    app.createdAt
  ].map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'pataboda-credit-applications.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function setDefaultPage() {
  const currentHash = window.location.hash.replace('#', '');

  if (currentHash === 'privacy-policy') {
    showPage('privacy-policy');
  } else if (currentHash === 'terms-conditions') {
    showPage('terms-conditions');
  } else if (currentHash === 'admin') {
    showPage('admin');
  } else {
    showPage('home');
  }
}

function setupHashLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = link.getAttribute('href');
      if (!target || target === '#') return;

      event.preventDefault();
      const id = target.replace('#', '');
      if (legalPages.has(id) || id === 'admin') {
        window.location.hash = id;
        showPage(id);
        return;
      }

      if (id === 'apply') {
        showPage('apply');
        ensureDraft();
        showApplicationStep(appState.step || 1);
      } else {
        window.location.hash = '';
        showPage('home');
      }
    });
  });
}

function init() {
  const config = getConfig();
  saveConfig(config);
  ensureDraft();
  updateConfigDisplay();
  initializeApplicationForm();
  bindNavigation();
  bindReviewAndConfirmationButtons();
  initializeConfigForm();
  initializeAdminDashboard();
  setupHashLinks();
  setDefaultPage();

  if (appState.draft) {
    setFormValues();
  }
}

window.addEventListener('DOMContentLoaded', init);
