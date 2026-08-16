@'
const STORAGE_KEYS = {
  projects: "easecraft_projects",
  workers: "easecraft_workers",
  expenseTypes: "easecraft_expense_types",
};

const defaultExpenseTypes = [
  {
    id: "fuel",
    name: "Fuel",
    description: "Vehicle / fuel expenses",
  },
  {
    id: "transport",
    name: "Transport",
    description: "Material / worker transport",
  },
  {
    id: "food",
    name: "Food",
    description: "Worker food and lunch",
  },
  {
    id: "tools",
    name: "Tools",
    description: "Tools & equipment",
  },
  {
    id: "material",
    name: "Material",
    description: "Project material",
  },
  {
    id: "miscellaneous",
    name: "Miscellaneous",
    description: "Other miscellaneous expenses",
  },
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error(`Unable to read ${key}`, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}


/* =========================================
   PROJECTS
========================================= */

export function getProjects() {
  return readStorage(STORAGE_KEYS.projects, []);
}

export function saveProjects(projects) {
  writeStorage(STORAGE_KEYS.projects, projects);
}


/* =========================================
   WORKERS
========================================= */

export function getWorkers() {
  return readStorage(STORAGE_KEYS.workers, []);
}

export function saveWorkers(workers) {
  writeStorage(STORAGE_KEYS.workers, workers);
}


/* =========================================
   EXPENSE TYPES
========================================= */

export function getExpenseTypes() {
  const existing = readStorage(
    STORAGE_KEYS.expenseTypes,
    null
  );

  if (!existing) {
    writeStorage(
      STORAGE_KEYS.expenseTypes,
      defaultExpenseTypes
    );

    return defaultExpenseTypes;
  }

  return existing;
}

export function saveExpenseTypes(expenseTypes) {
  writeStorage(
    STORAGE_KEYS.expenseTypes,
    expenseTypes
  );
}


/* =========================================
   PROJECT ID
========================================= */

export function createId() {
  return `${Date.now()}${Math.floor(
    Math.random() * 10000
  )}`;
}


/* =========================================
   DATE
========================================= */

export function getToday() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =========================================
   EMPTY PROJECT
========================================= */

export function createProject(data = {}) {
  return {
    id: createId(),

    name: data.name || "",

    client: data.client || "",

    type: data.type || "service",

    workName: data.workName || "",

    contractRate: Number(
      data.contractRate || 0
    ),

    defaultClientRate: Number(
      data.defaultClientRate || 0
    ),

    unit: data.unit || "Unit",

    quantity: Number(
      data.quantity || 0
    ),

    status: data.status || "ongoing",

    startDate:
      data.startDate || getToday(),

    workers: [],

    workEntries: [],

    otherExpenses: [],
  };
}


/* =========================================
   EMPTY WORKER
========================================= */

export function createWorker(data = {}) {
  return {
    id: createId(),

    name: data.name || "",

    trade: data.trade || "",

    role: data.trade || "",

    hourlyRate: Number(
      data.hourlyRate || 0
    ),

    phone: data.phone || "",

    active:
      data.active !== false,

    createdAt:
      new Date().toISOString(),
  };
}


/* =========================================
   EXPENSE
========================================= */

export function createExpense(data = {}) {
  return {
    id: createId(),

    date:
      data.date || getToday(),

    expenseTypeId:
      data.expenseTypeId || "",

    expenseType:
      data.expenseType || "",

    amount: Number(
      data.amount || 0
    ),

    remarks:
      data.remarks || "",

    createdAt:
      new Date().toISOString(),
  };
}
'@ | Set-Content src\data\storage.js