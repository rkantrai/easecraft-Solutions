import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

import {
  ArrowLeft,
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  IndianRupee,
  UsersRound,
  Receipt,
  ClipboardList,
  Plus,
  X,
  Search,
  Check,
  UserPlus,
  Clock3,
  Fuel,
  Trash2,
  WalletCards,
  TrendingUp,
  Pencil,
} from "lucide-react";


function ProjectDetails({
  project,
  manpower,
  assignedManpowerIds,
  onAssignManpower,

  workRecords,
  onSaveWorkRecord,

  expenses,
  onAddExpense,
  onDeleteExpense,

  payments,
  onAddPayment,
  onDeletePayment,

  onUpdateProject,

  onBack,
}) {


  /* =========================
     EDIT PROJECT
  ========================= */

  const [
    showEditProjectModal,
    setShowEditProjectModal,
  ] = useState(false);


  const [
    editProjectForm,
    setEditProjectForm,
  ] = useState({
    name: project?.name || "",
    client: project?.client || "",
    location: project?.location || "",
    startDate: project?.startDate || "",
    expectedEndDate: project?.expectedEndDate || "",
    endDate: project?.endDate || "",
    budget: project?.budget || "",
    status: project?.status || "Active",
  });


  const openEditProjectModal = () => {

    setEditProjectForm({
      name: project?.name || "",
      client: project?.client || "",
      location: project?.location || "",
      startDate: project?.startDate || "",
      expectedEndDate: project?.expectedEndDate || "",
      endDate: project?.endDate || "",
      budget: project?.budget || "",
      status: project?.status || "Active",
    });

    setShowEditProjectModal(true);

  };


  const closeEditProjectModal = () => {

    setShowEditProjectModal(false);

  };


  const handleEditProjectChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setEditProjectForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  const handleEditProjectSubmit = (e) => {

    e.preventDefault();


    if (
      !editProjectForm.name ||
      !editProjectForm.client
    ) {

      return;

    }


    const updatedProject = {

      ...project,

      ...editProjectForm,

      budget:
        Number(
          editProjectForm.budget || 0
        ),

    };


    // If the project is marked completed and no actual end date
    // was entered, use today's date automatically.

    if (
      updatedProject.status ===
        "Completed" &&
      !updatedProject.endDate
    ) {

      updatedProject.endDate =
        new Date()
          .toISOString()
          .split("T")[0];

    }


    if (
      typeof onUpdateProject ===
      "function"
    ) {

      onUpdateProject(
        updatedProject
      );

    }


    setShowEditProjectModal(false);

  };


  const markProjectCompleted = () => {

    const today =
      new Date()
        .toISOString()
        .split("T")[0];


    const updatedProject = {

      ...project,

      status: "Completed",

      endDate: today,

    };


    if (
      typeof onUpdateProject ===
      "function"
    ) {

      onUpdateProject(
        updatedProject
      );

    }


    setEditProjectForm((prev) => ({
      ...prev,
      status: "Completed",
      endDate: today,
    }));


    setShowEditProjectModal(false);

  };


  /* =========================
     MANPOWER MODAL
  ========================= */

  const [
    showManpowerModal,
    setShowManpowerModal,
  ] = useState(false);


  const [
    manpowerSearch,
    setManpowerSearch,
  ] = useState("");


  const [
    selectedIds,
    setSelectedIds,
  ] = useState(
    assignedManpowerIds || []
  );


  /* =========================
     MANPOWER FALLBACK LOAD
  ========================= */

  const [loadedManpower, setLoadedManpower] =
    useState([]);


  useEffect(() => {

    let cancelled = false;


    const loadManpowerForProject =
      async () => {

        /*
         * If App already has manpower,
         * use it and don't make another request.
         */

        if (
          manpower &&
          manpower.length > 0
        ) {
          return;
        }


        const {
          data: {
            user,
          },
          error:
            userError,
        } =
          await supabase.auth.getUser();


        if (
          userError ||
          !user
        ) {

          if (
            !cancelled &&
            userError
          ) {

            console.error(
              "Supabase manpower authentication error:",
              userError
            );

          }

          return;

        }


        const {
          data,
          error,
        } =
          await supabase
            .from("manpower")
            .select("*")
            .eq(
              "user_id",
              user.id
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            );


        if (error) {

          console.error(
            "Supabase project manpower loading error:",
            error
          );

          return;

        }


        if (!cancelled) {

          setLoadedManpower(
            (data || []).map(
              (worker) => ({

                id:
                  worker.id,

                workerName:
                  worker.name || "",

                role:
                  worker.role || "",

                hourlyRate:
                  worker.hourly_rate ?? 0,

                status:
                  worker.status ===
                  "inactive"
                    ? "Inactive"
                    : "Active",

              })
            )
          );

        }

      };


    loadManpowerForProject();


    return () => {

      cancelled = true;

    };

  }, [manpower]);


  /*
   * Use App manpower when available.
   * Otherwise use the manpower loaded
   * directly from Supabase.
   */

  const availableManpower =
    manpower &&
    manpower.length > 0
      ? manpower
      : loadedManpower;


  /* =========================
     DAILY WORK
  ========================= */

  const getLocalDateString = (
    date = new Date()
  ) => {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");


    return `${year}-${month}-${day}`;

  };


  const todayDateString =
    getLocalDateString();


  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    todayDateString
  );


  const selectedDateParts =
    selectedDate
      .split("-")
      .map(Number);


  const selectedYear =
    selectedDateParts[0] ||
    new Date().getFullYear();


  const selectedMonth =
    (
      selectedDateParts[1] ||
      new Date().getMonth() + 1
    ) - 1;


  const selectedDay =
    selectedDateParts[2] ||
    new Date().getDate();


  const monthNames = [

    "January",

    "February",

    "March",

    "April",

    "May",

    "June",

    "July",

    "August",

    "September",

    "October",

    "November",

    "December",

  ];


  const weekdayNames = [

    "S",

    "M",

    "T",

    "W",

    "T",

    "F",

    "S",

  ];


  const daysInSelectedMonth =
    new Date(
      selectedYear,
      selectedMonth + 1,
      0
    ).getDate();


  const calendarDays =
    Array.from(
      {
        length:
          daysInSelectedMonth,
      },
      (_, index) => {

        const day =
          index + 1;


        const date =
          new Date(
            selectedYear,
            selectedMonth,
            day
          );


        return {

          day,

          weekday:
            weekdayNames[
              date.getDay()
            ],

          dateString:
            `${selectedYear}-${String(
              selectedMonth + 1
            ).padStart(
              2,
              "0"
            )}-${String(
              day
            ).padStart(
              2,
              "0"
            )}`,

        };

      }
    );


  const handleCalendarMonthChange = (
    e
  ) => {

    const month =
      Number(
        e.target.value
      );


    const safeDay =
      Math.min(
        selectedDay,
        new Date(
          selectedYear,
          month + 1,
          0
        ).getDate()
      );


    setSelectedDate(
      `${selectedYear}-${String(
        month + 1
      ).padStart(
        2,
        "0"
      )}-${String(
        safeDay
      ).padStart(
        2,
        "0"
      )}`
    );

  };


  const handleCalendarYearChange = (
    e
  ) => {

    const year =
      Number(
        e.target.value
      );


    const safeDay =
      Math.min(
        selectedDay,
        new Date(
          year,
          selectedMonth + 1,
          0
        ).getDate()
      );


    setSelectedDate(
      `${year}-${String(
        selectedMonth + 1
      ).padStart(
        2,
        "0"
      )}-${String(
        safeDay
      ).padStart(
        2,
        "0"
      )}`
    );

  };


  const selectCalendarDay = (
    dateString
  ) => {

    setSelectedDate(
      dateString
    );

  };


  /* =========================
     EXPENSE MODAL
  ========================= */

  const [
    showExpenseModal,
    setShowExpenseModal,
  ] = useState(false);


  const [
    expenseForm,
    setExpenseForm,
  ] = useState({

    name: "",

    amount: "",

    date:
      new Date()
        .toISOString()
        .split("T")[0],

  });


  /* =========================
     PAYMENT MODAL
  ========================= */

  const [
    showPaymentModal,
    setShowPaymentModal,
  ] = useState(false);


  const [
    paymentForm,
    setPaymentForm,
  ] = useState({

    date:
      new Date()
        .toISOString()
        .split("T")[0],

    amount: "",

  });


  /* =========================
     ASSIGNED MANPOWER
  ========================= */

  const assignedManpower =
    availableManpower.filter(
      (person) =>
        assignedManpowerIds.includes(
          person.id
        )
    );


  /* =========================
     MANPOWER SEARCH
  ========================= */

  const filteredManpower =
    useMemo(() => {

      const search =
        manpowerSearch
          .toLowerCase()
          .trim();


      if (!search) {

        return availableManpower;

      }


      return availableManpower.filter(
        (person) =>
          person.workerName
            .toLowerCase()
            .includes(search) ||

          person.role
            .toLowerCase()
            .includes(search)
      );

    }, [
      availableManpower,
      manpowerSearch,
    ]);


  /* =========================
     OPEN MANPOWER
  ========================= */

  const openManpowerModal = () => {

    setSelectedIds(
      assignedManpowerIds || []
    );

    setManpowerSearch("");

    setShowManpowerModal(true);

  };


  const closeManpowerModal = () => {

    setShowManpowerModal(false);

  };


  const toggleManpower = (
    id
  ) => {

    setSelectedIds((prev) => {

      if (
        prev.includes(id)
      ) {

        return prev.filter(
          (item) =>
            item !== id
        );

      }


      return [
        ...prev,
        id,
      ];

    });

  };


  const saveManpowerAssignment = () => {

    onAssignManpower(
      project.id,
      selectedIds
    );

    setShowManpowerModal(false);

  };


  /* =========================
     DAILY RECORD
  ========================= */

  const currentRecords =
    workRecords[
      selectedDate
    ] || {};


  const getWorkerRecord = (
    workerId
  ) => {

    return (
      currentRecords[
        workerId
      ] || {

        hours: "",

        advance: "",

      }
    );

  };


  const updateWorkerRecord = (
    workerId,
    field,
    value
  ) => {

    const existing =
      getWorkerRecord(
        workerId
      );


    const updated = {

      ...currentRecords,

      [workerId]: {

        ...existing,

        [field]: value,

      },

    };


    onSaveWorkRecord(
      project.id,
      selectedDate,
      updated
    );

  };


  const totalWorkedHours =
    assignedManpower.reduce(
      (sum, person) => {

        return (
          sum +
          Number(
            getWorkerRecord(
              person.id
            ).hours || 0
          )
        );

      },
      0
    );


  const totalManpowerCost =
    Object.entries(
      workRecords
    )
      .reduce(
        (
          total,
          [
            ,
            dateRecords,
          ]
        ) => {

          return (

            total +

            Object.entries(
              dateRecords || {}
            ).reduce(
              (
                dateTotal,
                [
                  workerId,
                  record,
                ]
              ) => {

                const worker =
                  availableManpower.find(
                    (person) =>
                      person.id ===
                        Number(
                          workerId
                        ) ||
                      person.id ===
                        workerId
                  );


                if (!worker) {

                  return dateTotal;

                }


                return (

                  dateTotal +

                  Number(
                    record.hours ||
                      0
                  ) *

                  Number(
                    worker.hourlyRate ||
                      worker.dailyRate ||
                      0
                  )

                );

              },
              0
            )

          );

        },
        0
      );


  const totalAdvances =
    Object.values(
      workRecords
    )
      .reduce(
        (
          total,
          dateRecords
        ) => {

          return (

            total +

            Object.values(
              dateRecords || {}
            ).reduce(
              (
                sum,
                record
              ) =>
                sum +
                Number(
                  record.advance ||
                    0
                ),
              0
            )

          );

        },
        0
      );


  /* =========================
     EXPENSES
  ========================= */

  const totalOtherExpenses =
    expenses.reduce(
      (
        sum,
        expense
      ) =>
        sum +
        Number(
          expense.amount || 0
        ),
      0
    );


  const handleExpenseSubmit = (
    e
  ) => {

    e.preventDefault();


    if (
      !expenseForm.name ||
      !expenseForm.amount ||
      !expenseForm.date
    ) {

      return;

    }


    onAddExpense(
      project.id,
      {

        name:
          expenseForm.name,

        amount:
          Number(
            expenseForm.amount
          ),

        date:
          expenseForm.date,

      }
    );


    setExpenseForm({

      name: "",

      amount: "",

      date:
        new Date()
          .toISOString()
          .split("T")[0],

    });


    setShowExpenseModal(false);

  };


  /* =========================
     CLIENT PAYMENTS
  ========================= */

  const sortedPayments =
    [...payments].sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );


  let runningTotal = 0;


  const paymentRows =
    sortedPayments.map(
      (payment) => {

        runningTotal +=
          Number(
            payment.amount || 0
          );


        return {

          ...payment,

          runningTotal,

        };

      }
    );


  const totalReceived =
    payments.reduce(
      (
        sum,
        payment
      ) =>
        sum +
        Number(
          payment.amount || 0
        ),
      0
    );


  const projectBudget =
    Number(
      project.budget || 0
    );


  const pendingAmount =
    Math.max(
      projectBudget -
        totalReceived,
      0
    );


  const handlePaymentSubmit = (
    e
  ) => {

    e.preventDefault();


    if (
      !paymentForm.date ||
      !paymentForm.amount
    ) {

      return;

    }


    onAddPayment(
      project.id,
      {

        date:
          paymentForm.date,

        amount:
          Number(
            paymentForm.amount
          ),

      }
    );


    setPaymentForm({

      date:
        new Date()
          .toISOString()
          .split("T")[0],

      amount: "",

    });


    setShowPaymentModal(false);

  };


  /* =========================
     FINAL RESULT
  ========================= */

  const totalProjectCost =
    totalManpowerCost +
    totalOtherExpenses;


  const finalProfit =
    projectBudget -
    totalProjectCost;


  /* =========================
     FORMAT DATE
  ========================= */

  const formatDate = (
    date
  ) => {

    if (!date) {

      return "—";

    }


    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {

        day: "2-digit",

        month: "short",

        year: "numeric",

      }
    );

  };


  if (!project) {

    return (

      <div className="project-details-page">

        <button
          className="project-back-button"
          onClick={onBack}
        >

          <ArrowLeft size={17} />

          Back to Projects

        </button>


        <div className="project-details-empty">

          Project not found.

        </div>

      </div>

    );

  }


  return (

    <div className="project-details-page">

      <style>{`

        .no-number-spinner::-webkit-outer-spin-button,

        .no-number-spinner::-webkit-inner-spin-button {

          -webkit-appearance: none;

          margin: 0;

        }


        .no-number-spinner {

          -moz-appearance: textfield;

        }

      `}</style>


      {/* =========================
          HEADER
      ========================= */}

      <div className="project-details-header">

        <div>

          <button
            className="project-back-button"
            onClick={onBack}
          >

            <ArrowLeft size={17} />

            Back to Projects

          </button>


          <div className="project-details-title-row">

            <div className="project-details-icon">

              <BriefcaseBusiness
                size={24}
              />

            </div>


            <div>

              <h1>

                {project.name}

              </h1>


              <p>

                Project details, manpower, payments and financial overview

              </p>

            </div>

          </div>

        </div>


        <div className="project-details-header-actions">

          <button
            type="button"
            className="project-edit-button"
            onClick={
              openEditProjectModal
            }
          >

            <Pencil size={16} />

            Edit Project

          </button>


          <span
            className={`project-details-status ${
              project.status ===
              "Completed"
                ? "completed"
                : "active"
            }`}
          >

            {project.status}

          </span>

        </div>

      </div>


      {/* =========================
          PROJECT INFORMATION
      ========================= */}

      <div className="project-details-grid">


        <div className="project-detail-card">

          <div className="project-detail-card-header">

            <h2>

              Project Information

            </h2>

          </div>


          <div className="project-detail-list">


            <div className="project-detail-item">

              <span>
                Client
              </span>

              <strong>

                {project.client ||
                  "—"}

              </strong>

            </div>


            <div className="project-detail-item">

              <span>
                Location
              </span>

              <strong className="detail-with-icon">

                <MapPin size={15} />

                {project.location ||
                  "—"}

              </strong>

            </div>


            <div className="project-detail-item">

              <span>
                Start Date
              </span>

              <strong className="detail-with-icon">

                <CalendarDays
                  size={15}
                />

                {project.startDate
                  ? formatDate(
                      project.startDate
                    )
                  : "—"}

              </strong>

            </div>


            <div className="project-detail-item">

              <span>
                Expected End Date
              </span>

              <strong className="detail-with-icon">

                <CalendarDays
                  size={15}
                />

                {project.expectedEndDate
                  ? formatDate(
                      project.expectedEndDate
                    )
                  : "—"}

              </strong>

            </div>


            <div className="project-detail-item">

              <span>
                End Date
              </span>

              <strong className="detail-with-icon">

                <CalendarDays size={15} />

                {project.endDate
                  ? formatDate(
                      project.endDate
                    )
                  : "—"}

              </strong>

            </div>


            <div className="project-detail-item">

              <span>
                Budget
              </span>

              <strong className="detail-with-icon">

                <IndianRupee size={15} />

                {projectBudget.toLocaleString(
                  "en-IN"
                )}

              </strong>

            </div>


          </div>

        </div>


        {/* PROJECT OVERVIEW */}

        <div className="project-detail-card">

          <div className="project-detail-card-header">

            <h2>

              Project Financial Overview

            </h2>

          </div>


          <div className="project-overview-stats">


            <div className="project-overview-stat">

              <div className="project-overview-icon">

                <WalletCards
                  size={19}
                />

              </div>


              <div>

                <span>
                  Client Received
                </span>

                <strong>

                  ₹
                  {totalReceived.toLocaleString(
                    "en-IN"
                  )}

                </strong>

              </div>

            </div>


            <div className="project-overview-stat">

              <div className="project-overview-icon">

                <Receipt
                  size={19}
                />

              </div>


              <div>

                <span>
                  Client Pending
                </span>

                <strong>

                  ₹
                  {pendingAmount.toLocaleString(
                    "en-IN"
                  )}

                </strong>

              </div>

            </div>


            <div className="project-overview-stat">

              <div className="project-overview-icon">

                <UsersRound
                  size={19}
                />

              </div>


              <div>

                <span>
                  Manpower Cost
                </span>

                <strong>

                  ₹
                  {totalManpowerCost.toLocaleString(
                    "en-IN"
                  )}

                </strong>

              </div>

            </div>


            <div className="project-overview-stat">

              <div className="project-overview-icon">

                <TrendingUp
                  size={19}
                />

              </div>


              <div>

                <span>
                  Project Profit
                </span>

                <strong>

                  ₹
                  {finalProfit.toLocaleString(
                    "en-IN"
                  )}

                </strong>

              </div>

            </div>


          </div>

        </div>

      </div>


      {/* =========================
          MANPOWER
      ========================= */}

      <div className="project-detail-card project-manpower-card">


        <div className="project-section-header">

          <div className="project-section-title-row">

            <div className="project-section-icon">

              <UsersRound size={19} />

            </div>


            <div>

              <h2>
                Project Manpower
              </h2>

              <p>
                Manpower currently assigned to this project
              </p>

            </div>

          </div>


          <button
            className="project-assignment-button"
            onClick={
              openManpowerModal
            }
          >

            <UserPlus size={17} />

            Add Manpower

          </button>

        </div>


        {assignedManpower.length ===
        0 ? (

          <div className="project-assignment-empty">

            <div className="project-assignment-empty-icon">

              <UsersRound size={24} />

            </div>


            <h3>
              No manpower assigned
            </h3>


            <p>
              Add manpower to this project from your existing manpower records.
            </p>


            <button
              className="project-assignment-empty-button"
              onClick={
                openManpowerModal
              }
            >

              <Plus size={17} />

              Assign Manpower

            </button>

          </div>

        ) : (

          <div className="project-assigned-list">

            {assignedManpower.map(
              (person) => (

                <div
                  className="project-assigned-person"
                  key={person.id}
                >

                  <div className="project-assigned-avatar">

                    <UsersRound
                      size={17}
                    />

                  </div>


                  <div className="project-assigned-info">

                    <strong>
                      {person.workerName}
                    </strong>

                    <span>
                      {person.role}
                    </span>

                  </div>


                  <div className="project-assigned-rate">

                    <span>
                      Hourly Rate
                    </span>

                    <strong>

                      ₹
                      {Number(
                        person.hourlyRate ||
                        person.dailyRate ||
                        0
                      ).toLocaleString(
                        "en-IN"
                      )}

                      /hr

                    </strong>

                  </div>


                  <span
                    className={`manpower-status ${
                      person.status ===
                      "Inactive"
                        ? "inactive"
                        : "active"
                    }`}
                  >

                    {person.status}

                  </span>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* =========================
          DAILY WORK
      ========================= */}

      <div className="project-detail-card">


        <div className="project-section-header">

          <div className="project-section-title-row">

            <div className="project-section-icon">

              <CalendarDays
                size={19}
              />

            </div>


            <div>

              <h2>
                Daily Work & Attendance
              </h2>

              <p>
                Record worked hours and advances for each assigned worker.
              </p>

            </div>

          </div>

        </div>


        {/* NEW DATE SELECTOR */}

        <div
          className="daily-work-toolbar"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "stretch",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            <label
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#475467",
              }}
            >

              YEAR

            </label>


            <select
              value={
                selectedYear
              }
              onChange={
                handleCalendarYearChange
              }
              style={{
                height: "36px",
                padding: "0 32px 0 10px",
                border: "1px solid #d0d5dd",
                borderRadius: "7px",
                background: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >

              {Array.from(
                {
                  length: 21,
                },
                (
                  _,
                  index
                ) => {

                  const year =
                    new Date().getFullYear() -
                    10 +
                    index;


                  return (

                    <option
                      key={year}
                      value={year}
                    >

                      {year}

                    </option>

                  );

                }
              )}

            </select>


            <label
              style={{
                marginLeft: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#475467",
              }}
            >

              MONTH

            </label>


            <select
              value={
                selectedMonth
              }
              onChange={
                handleCalendarMonthChange
              }
              style={{
                height: "36px",
                padding: "0 32px 0 10px",
                border: "1px solid #d0d5dd",
                borderRadius: "7px",
                background: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >

              {monthNames.map(
                (
                  month,
                  index
                ) => (

                  <option
                    key={month}
                    value={index}
                  >

                    {month}

                  </option>

                )
              )}

            </select>


            <div
              style={{
                marginLeft: "auto",
                fontSize: "14px",
                fontWeight: 600,
                color: "#344054",
              }}
            >

              Selected: {formatDate(
                selectedDate
              )}

            </div>

          </div>


          {/* DATE STRIP */}

          <div
            style={{
              width: "100%",
              overflowX: "auto",
              border: "1px solid #e4e7ec",
              borderRadius: "8px",
              background: "#fff",
            }}
          >

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  `repeat(${daysInSelectedMonth}, 42px)`,
                minWidth:
                  `${daysInSelectedMonth * 42}px`,
              }}
            >

              {calendarDays.map(
                (item) => (

                  <div
                    key={`weekday-${item.dateString}`}
                    style={{
                      textAlign: "center",
                      padding: "8px 0 4px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color:
                        item.weekday ===
                        "S"
                          ? "#b42318"
                          : "#475467",
                      borderRight:
                        "1px solid #f0f2f5",
                    }}
                  >

                    {item.weekday}

                  </div>

                )
              )}


              {calendarDays.map(
                (item) => {

                  const isSelected =
                    item.dateString ===
                    selectedDate;


                  return (

                    <button
                      key={
                        item.dateString
                      }
                      type="button"
                      onClick={() =>
                        selectCalendarDay(
                          item.dateString
                        )
                      }
                      style={{
                        height: "40px",
                        border: "none",
                        borderTop:
                          "1px solid #f0f2f5",
                        borderRight:
                          "1px solid #f0f2f5",
                        background:
                          isSelected
                            ? "#eef4ff"
                            : "#fff",
                        color:
                          isSelected
                            ? "#175cd3"
                            : "#101828",
                        fontSize: "13px",
                        fontWeight:
                          isSelected
                            ? 700
                            : 500,
                        cursor: "pointer",
                      }}
                    >

                      {item.day}

                    </button>

                  );

                }
              )}

            </div>

          </div>

        </div>


        <div className="daily-summary">

          <div>

            <Clock3 size={18} />

            <span>
              Worked Hours
            </span>

            <strong>
              {totalWorkedHours}
            </strong>

          </div>


          <div>

            <IndianRupee size={18} />

            <span>
              Total Manpower Cost
            </span>

            <strong>

              ₹
              {totalManpowerCost.toLocaleString(
                "en-IN"
              )}

            </strong>

          </div>


          <div>

            <WalletCards size={18} />

            <span>
              Advances
            </span>

            <strong>

              ₹
              {totalAdvances.toLocaleString(
                "en-IN"
              )}

            </strong>

          </div>

        </div>


        {assignedManpower.length ===
        0 ? (

          <div className="project-assignment-empty">

            <UsersRound size={25} />

            <h3>
              No manpower assigned
            </h3>

          </div>

        ) : (

          <div className="daily-work-table-wrapper">

            <table className="daily-work-table">

              <thead>

                <tr>

                  <th>
                    Worker
                  </th>

                  <th>
                    Hourly Rate
                  </th>

                  <th>
                    Worked Hours
                  </th>

                  <th>
                    Gross Wage
                  </th>

                  <th>
                    Advance
                  </th>

                  <th>
                    Net Payable
                  </th>

                </tr>

              </thead>


              <tbody>

                {assignedManpower.map(
                  (person) => {

                    const record =
                      getWorkerRecord(
                        person.id
                      );


                    const rate =
                      Number(
                        person.hourlyRate ||
                        person.dailyRate ||
                        0
                      );


                    const hours =
                      Number(
                        record.hours ||
                        0
                      );


                    const advance =
                      Number(
                        record.advance ||
                        0
                      );


                    const gross =
                      rate *
                      hours;


                    const net =
                      Math.max(
                        gross -
                          advance,
                        0
                      );


                    return (

                      <tr
                        key={
                          person.id
                        }
                      >

                        <td>

                          <div className="worker-table-name">

                            <div className="worker-table-icon">

                              <UsersRound
                                size={16}
                              />

                            </div>


                            <div>

                              <strong>
                                {person.workerName}
                              </strong>

                              <span>
                                {person.role}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          ₹
                          {rate.toLocaleString(
                            "en-IN"
                          )}

                          /hr

                        </td>


                        <td>

                          <input
                            className="daily-work-input no-number-spinner"
                            type="number"
                            min="0"
                            step="0.5"
                            value={
                              record.hours
                            }
                            onChange={(e) =>
                              updateWorkerRecord(
                                person.id,
                                "hours",
                                e.target.value
                              )
                            }
                            placeholder="0"
                          />

                        </td>


                        <td>

                          <strong>

                            ₹
                            {gross.toLocaleString(
                              "en-IN"
                            )}

                          </strong>

                        </td>


                        <td>

                          <input
                            className="daily-work-input no-number-spinner"
                            type="number"
                            min="0"
                            value={
                              record.advance
                            }
                            onChange={(e) =>
                              updateWorkerRecord(
                                person.id,
                                "advance",
                                e.target.value
                              )
                            }
                            placeholder="0"
                          />

                        </td>


                        <td>

                          <strong>

                            ₹
                            {net.toLocaleString(
                              "en-IN"
                            )}

                          </strong>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =========================
          EXPENSE REGISTER
      ========================= */}

      <div className="project-detail-card">


        <div className="project-section-header">

          <div className="project-section-title-row">

            <div className="project-section-icon">

              <Receipt size={19} />

            </div>


            <div>

              <h2>
                Project Expenses
              </h2>

              <p>
                Fuel, transportation, fooding and other project expenses.
              </p>

            </div>

          </div>


          <button
            className="project-assignment-button"
            onClick={() =>
              setShowExpenseModal(
                true
              )
            }
          >

            <Plus size={17} />

            Add Expense

          </button>

        </div>


        {expenses.length ===
        0 ? (

          <div className="project-assignment-empty">

            <Receipt size={25} />

            <h3>
              No expenses recorded
            </h3>

            <p>
              Add fuel, transportation, fooding or other expenses.
            </p>

          </div>

        ) : (

          <div className="project-expense-table-wrapper">

            <table className="project-expense-table">

              <thead>

                <tr>

                  <th>
                    Expense
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {expenses
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.date) -
                      new Date(b.date)
                  )
                  .map(
                    (expense) => (

                      <tr
                        key={
                          expense.id
                        }
                      >

                        <td>

                          <div className="expense-name-cell">

                            <Fuel
                              size={17}
                            />

                            <strong>
                              {expense.name}
                            </strong>

                          </div>

                        </td>


                        <td>

                          {formatDate(
                            expense.date
                          )}

                        </td>


                        <td>

                          <strong>

                            ₹
                            {Number(
                              expense.amount ||
                              0
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </strong>

                        </td>


                        <td>

                          <button
                            className="table-delete-button"
                            onClick={() =>
                              onDeleteExpense(
                                project.id,
                                expense.id
                              )
                            }
                          >

                            <Trash2
                              size={16}
                            />

                          </button>

                        </td>

                      </tr>

                    )
                  )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =========================
          CLIENT PAYMENT REGISTER
      ========================= */}

      <div className="project-detail-card">


        <div className="project-section-header">

          <div className="project-section-title-row">

            <div className="project-section-icon">

              <WalletCards
                size={19}
              />

            </div>


            <div>

              <h2>
                Client Payment Register
              </h2>

              <p>
                Record every payment received from the client with its date.
              </p>

            </div>

          </div>


          <button
            className="project-assignment-button"
            onClick={() =>
              setShowPaymentModal(
                true
              )
            }
          >

            <Plus size={17} />

            Add Payment

          </button>

        </div>


        {/* PAYMENT SUMMARY */}

        <div className="payment-summary-grid">


          <div className="payment-summary-card">

            <span>
              Project Budget
            </span>

            <strong>

              ₹
              {projectBudget.toLocaleString(
                "en-IN"
              )}

            </strong>

          </div>


          <div className="payment-summary-card received">

            <span>
              Total Received
            </span>

            <strong>

              ₹
              {totalReceived.toLocaleString(
                "en-IN"
              )}

            </strong>

          </div>


          <div className="payment-summary-card pending">

            <span>
              Pending From Client
            </span>

            <strong>

              ₹
              {pendingAmount.toLocaleString(
                "en-IN"
              )}

            </strong>

          </div>

        </div>


        {paymentRows.length ===
        0 ? (

          <div className="project-assignment-empty">

            <div className="project-assignment-empty-icon">

              <WalletCards
                size={24}
              />

            </div>


            <h3>
              No client payments recorded
            </h3>


            <p>
              Add each payment when the client pays you.
            </p>


            <button
              className="project-assignment-empty-button"
              onClick={() =>
                setShowPaymentModal(
                  true
                )
              }
            >

              <Plus size={17} />

              Add Client Payment

            </button>

          </div>

        ) : (

          <div className="payment-register-wrapper">

            <table className="payment-register-table">

              <thead>

                <tr>

                  <th>
                    Payment Date
                  </th>

                  <th>
                    Amount Received
                  </th>

                  <th>
                    Total Received Till Date
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {paymentRows.map(
                  (payment) => (

                    <tr
                      key={
                        payment.id
                      }
                    >

                      <td>

                        <div className="payment-date-cell">

                          <CalendarDays
                            size={16}
                          />

                          {formatDate(
                            payment.date
                          )}

                        </div>

                      </td>


                      <td>

                        <strong className="payment-amount">

                          ₹
                          {Number(
                            payment.amount ||
                            0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </strong>

                      </td>


                      <td>

                        <strong>

                          ₹
                          {Number(
                            payment.runningTotal ||
                            0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </strong>

                      </td>


                      <td>

                        <button
                          className="table-delete-button"
                          onClick={() =>
                            onDeletePayment(
                              project.id,
                              payment.id
                            )
                          }
                          title="Delete payment"
                        >

                          <Trash2
                            size={16}
                          />

                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =========================
          FINAL FINANCIAL RESULT
      ========================= */}

      <div className="project-detail-card">


        <div className="project-section-title-row">

          <div className="project-section-icon">

            <TrendingUp
              size={19}
            />

          </div>


          <div>

            <h2>
              Current Project Financial Result
            </h2>

            <p>
              Live calculation based on budget, client receipts, manpower and other expenses.
            </p>

          </div>

        </div>


        <div className="financial-result-grid">


          <div className="financial-result-item">

            <span>
              Project Budget
            </span>

            <strong>

              ₹
              {projectBudget.toLocaleString(
                "en-IN"
              )}

            </strong>

          </div>


          <div className="financial-result-item">

            <span>
              Client Received
            </span>

            <strong>

              ₹
              {totalReceived.toLocaleString(
                "en-IN"
              )}

            </strong>

          </div>


          <div className="financial-result-item">

            <span>
              Client Pending
            </span>

            <strong>

              ₹
              {pendingAmount.toLocaleString(
                "en-IN"
              )}

            </strong>

          </div>


          <div className="financial-result-item">

            <span>
              Manpower Cost
            </span>

            <strong>

              ₹
              {totalManpowerCost.toLocaleString(
                "en-IN"
              )}

            </strong>

          </div>


          <div className="financial-result-item">

            <span>
              Other Expenses
            </span>

            <strong>

              ₹
              {totalOtherExpenses.toLocaleString(
                "en-IN"
              )}

            </strong>

          </div>


          <div className="financial-result-item highlight">

            <span>
              Total Project Cost
            </span>

            <strong>

              ₹
              {totalProjectCost.toLocaleString(
                "en-IN"
              )}

            </strong>

          </div>


          <div className="financial-result-item profit">

            <span>
              Expected Project Profit
            </span>

            <strong>

              ₹
              {finalProfit.toLocaleString(
                "en-IN"
              )}

            </strong>

          </div>


        </div>

      </div>


      {/* =========================
          PROJECT MANAGEMENT
      ========================= */}

      <div className="project-detail-card project-modules-card">


        <div className="project-detail-card-header">

          <div>

            <h2>
              Project Management
            </h2>

            <p>
              Manage everything related to this project.
            </p>

          </div>

        </div>


        <div className="project-module-grid">


          <button
            className="project-module-button project-module-active"
            onClick={
              openManpowerModal
            }
          >

            <UsersRound
              size={21}
            />


            <div>

              <strong>
                Manpower
              </strong>

              <span>
                {assignedManpower.length} assigned
              </span>

            </div>

          </button>


          <button
            className="project-module-button"
            onClick={() =>
              setShowExpenseModal(
                true
              )
            }
          >

            <Receipt
              size={21}
            />


            <div>

              <strong>
                Expenses
              </strong>

              <span>

                ₹
                {totalOtherExpenses.toLocaleString(
                  "en-IN"
                )} recorded

              </span>

            </div>

          </button>


          <button
            className="project-module-button"
            onClick={() =>
              setShowPaymentModal(
                true
              )
            }
          >

            <WalletCards
              size={21}
            />


            <div>

              <strong>
                Client Payments
              </strong>

              <span>

                ₹
                {totalReceived.toLocaleString(
                  "en-IN"
                )} received

              </span>

            </div>

          </button>


        </div>

      </div>


      {/* =========================
          EDIT PROJECT MODAL
      ========================= */}

      {showEditProjectModal && (

        <div
          className="project-modal-overlay"
          onClick={
            closeEditProjectModal
          }
        >

          <div
            className="project-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <div className="project-modal-header">

              <div>

                <h2>
                  Edit Project
                </h2>

                <p>
                  Update project details or close the project.
                </p>

              </div>


              <button
                type="button"
                className="project-modal-close"
                onClick={
                  closeEditProjectModal
                }
              >

                <X size={19} />

              </button>

            </div>


            <form
              className="project-form"
              onSubmit={
                handleEditProjectSubmit
              }
            >


              <div className="project-form-group">

                <label>
                  Project Name *
                </label>

                <input
                  name="name"
                  value={
                    editProjectForm.name
                  }
                  onChange={
                    handleEditProjectChange
                  }
                  required
                />

              </div>


              <div className="project-form-row">

                <div className="project-form-group">

                  <label>
                    Client *
                  </label>

                  <input
                    name="client"
                    value={
                      editProjectForm.client
                    }
                    onChange={
                      handleEditProjectChange
                    }
                    required
                  />

                </div>


                <div className="project-form-group">

                  <label>
                    Location
                  </label>

                  <input
                    name="location"
                    value={
                      editProjectForm.location
                    }
                    onChange={
                      handleEditProjectChange
                    }
                  />

                </div>

              </div>


              <div className="project-form-row">

                <div className="project-form-group">

                  <label>
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={
                      editProjectForm.startDate
                    }
                    onChange={
                      handleEditProjectChange
                    }
                  />

                </div>


                <div className="project-form-group">

                  <label>
                    Expected End Date
                  </label>

                  <input
                    type="date"
                    name="expectedEndDate"
                    value={
                      editProjectForm.expectedEndDate
                    }
                    onChange={
                      handleEditProjectChange
                    }
                  />

                </div>

              </div>


              <div className="project-form-row">

                <div className="project-form-group">

                  <label>
                    Actual End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={
                      editProjectForm.endDate
                    }
                    onChange={
                      handleEditProjectChange
                    }
                  />

                </div>


                <div className="project-form-group">

                  <label>
                    Budget
                  </label>

                  <input
                    type="number"
                    name="budget"
                    min="0"
                    value={
                      editProjectForm.budget
                    }
                    onChange={
                      handleEditProjectChange
                    }
                  />

                </div>

              </div>


              <div className="project-form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={
                    editProjectForm.status
                  }
                  onChange={
                    handleEditProjectChange
                  }
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                </select>

              </div>


              <div className="project-edit-end-action">

                <button
                  type="button"
                  className="project-complete-button"
                  onClick={
                    markProjectCompleted
                  }
                  disabled={
                    editProjectForm.status ===
                    "Completed"
                  }
                >

                  <Check size={17} />

                  End Project Today

                </button>

              </div>


              <div className="project-form-actions">

                <button
                  type="button"
                  className="project-cancel-button"
                  onClick={
                    closeEditProjectModal
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="projects-primary-button"
                >

                  <Check size={17} />

                  Save Changes

                </button>

              </div>


            </form>

          </div>

        </div>

      )}


      {/* =========================
          MANPOWER MODAL
      ========================= */}

      {showManpowerModal && (

        <div
          className="manpower-assignment-overlay"
          onClick={
            closeManpowerModal
          }
        >

          <div
            className="manpower-assignment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <div className="manpower-assignment-header">

              <div>

                <h2>
                  Assign Manpower
                </h2>

                <p>
                  Select existing manpower for {project.name}.
                </p>

              </div>


              <button
                className="manpower-assignment-close"
                onClick={
                  closeManpowerModal
                }
              >

                <X size={19} />

              </button>

            </div>


            <div className="manpower-assignment-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search by name or role..."
                value={
                  manpowerSearch
                }
                onChange={(e) =>
                  setManpowerSearch(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="manpower-assignment-list">

              {manpower.length ===
              0 ? (

                <div className="assignment-no-manpower">

                  <UsersRound
                    size={28}
                  />

                  <h3>
                    No manpower available
                  </h3>

                  <p>
                    Add manpower first.
                  </p>

                </div>

              ) : filteredManpower.length ===
                0 ? (

                <div className="assignment-no-manpower">

                  <Search
                    size={26}
                  />

                  <h3>
                    No results
                  </h3>

                </div>

              ) : (

                filteredManpower.map(
                  (person) => {

                    const isSelected =
                      selectedIds.includes(
                        person.id
                      );


                    const rate =
                      Number(
                        person.hourlyRate ||
                        person.dailyRate ||
                        0
                      );


                    return (

                      <button
                        type="button"
                        key={
                          person.id
                        }
                        className={`manpower-assignment-row ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleManpower(
                            person.id
                          )
                        }
                      >


                        <div className="assignment-checkbox">

                          {isSelected && (

                            <Check
                              size={15}
                            />

                          )}

                        </div>


                        <div className="assignment-person-icon">

                          <UsersRound
                            size={17}
                          />

                        </div>


                        <div className="assignment-person-info">

                          <strong>
                            {person.workerName}
                          </strong>

                          <span>
                            {person.role}
                          </span>

                        </div>


                        <div className="assignment-person-rate">

                          ₹
                          {rate.toLocaleString(
                            "en-IN"
                          )}

                          <small>
                            /hr
                          </small>

                        </div>


                      </button>

                    );

                  }
                )

              )}

            </div>


            <div className="manpower-assignment-footer">


              <div>

                <strong>
                  {selectedIds.length}
                </strong>

                <span>
                  manpower selected
                </span>

              </div>


              <div className="assignment-footer-actions">

                <button
                  type="button"
                  className="assignment-cancel-button"
                  onClick={
                    closeManpowerModal
                  }
                >

                  Cancel

                </button>


                <button
                  type="button"
                  className="assignment-save-button"
                  onClick={
                    saveManpowerAssignment
                  }
                >

                  <Check size={17} />

                  Save Assignment

                </button>

              </div>


            </div>

          </div>

        </div>

      )}


      {/* =========================
          EXPENSE MODAL
      ========================= */}

      {showExpenseModal && (

        <div
          className="project-modal-overlay"
          onClick={() =>
            setShowExpenseModal(
              false
            )
          }
        >

          <div
            className="project-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <div className="project-modal-header">

              <div>

                <h2>
                  Add Project Expense
                </h2>

                <p>
                  Record fuel, transportation, fooding or any other expense.
                </p>

              </div>


              <button
                className="project-modal-close"
                onClick={() =>
                  setShowExpenseModal(
                    false
                  )
                }
              >

                <X size={19} />

              </button>

            </div>


            <form
              className="project-form"
              onSubmit={
                handleExpenseSubmit
              }
            >


              <div className="project-form-group">

                <label>
                  Expense Name *
                </label>


                <input
                  value={
                    expenseForm.name
                  }
                  onChange={(e) =>
                    setExpenseForm(
                      (prev) => ({
                        ...prev,

                        name:
                          e.target.value,

                      })
                    )
                  }
                  placeholder="e.g. Fuel"
                  required
                />

              </div>


              <div className="project-form-row">

                <div className="project-form-group">

                  <label>
                    Amount *
                  </label>


                  <input
                    type="number"
                    min="0"
                    value={
                      expenseForm.amount
                    }
                    onChange={(e) =>
                      setExpenseForm(
                        (prev) => ({
                          ...prev,

                          amount:
                            e.target.value,

                        })
                      )
                    }
                    placeholder="0"
                    required
                  />

                </div>


                <div className="project-form-group">

                  <label>
                    Date *
                  </label>


                  <input
                    type="date"
                    value={
                      expenseForm.date
                    }
                    onChange={(e) =>
                      setExpenseForm(
                        (prev) => ({
                          ...prev,

                          date:
                            e.target.value,

                        })
                      )
                    }
                    required
                  />

                </div>

              </div>


              <div className="project-form-actions">

                <button
                  type="button"
                  className="project-cancel-button"
                  onClick={() =>
                    setShowExpenseModal(
                      false
                    )
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="projects-primary-button"
                >

                  <Plus size={17} />

                  Add Expense

                </button>

              </div>


            </form>

          </div>

        </div>

      )}


      {/* =========================
          PAYMENT MODAL
      ========================= */}

      {showPaymentModal && (

        <div
          className="project-modal-overlay"
          onClick={() =>
            setShowPaymentModal(
              false
            )
          }
        >

          <div
            className="project-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <div className="project-modal-header">

              <div>

                <h2>
                  Add Client Payment
                </h2>

                <p>
                  Record the amount received from the client and payment date.
                </p>

              </div>


              <button
                className="project-modal-close"
                onClick={() =>
                  setShowPaymentModal(
                    false
                  )
                }
              >

                <X size={19} />

              </button>

            </div>


            <form
              className="project-form"
              onSubmit={
                handlePaymentSubmit
              }
            >


              <div className="project-form-row">

                <div className="project-form-group">

                  <label>
                    Payment Date *
                  </label>


                  <input
                    type="date"
                    value={
                      paymentForm.date
                    }
                    onChange={(e) =>
                      setPaymentForm(
                        (prev) => ({
                          ...prev,

                          date:
                            e.target.value,

                        })
                      )
                    }
                    required
                  />

                </div>


                <div className="project-form-group">

                  <label>
                    Amount Received *
                  </label>


                  <input
                    type="number"
                    min="0"
                    value={
                      paymentForm.amount
                    }
                    onChange={(e) =>
                      setPaymentForm(
                        (prev) => ({
                          ...prev,

                          amount:
                            e.target.value,

                        })
                      )
                    }
                    placeholder="e.g. 50000"
                    required
                  />

                </div>

              </div>


              <div className="payment-form-preview">

                <span>
                  Current Total Received
                </span>

                <strong>

                  ₹
                  {totalReceived.toLocaleString(
                    "en-IN"
                  )}

                </strong>

              </div>


              <div className="project-form-actions">

                <button
                  type="button"
                  className="project-cancel-button"
                  onClick={() =>
                    setShowPaymentModal(
                      false
                    )
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="projects-primary-button"
                >

                  <Check size={17} />

                  Save Payment

                </button>

              </div>


            </form>

          </div>

        </div>

      )}

    </div>

  );

}


export default ProjectDetails;