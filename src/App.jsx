import React, {
  useEffect,
  useState,
} from "react";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  UsersRound,
  Bell,
  LogOut,
} from "lucide-react";

import "./styles/global.css";

import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
import Manpower from "./pages/Manpower.jsx";
import Login from "./pages/Login.jsx";

import { supabase } from "./lib/supabase";


const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    icon: BriefcaseBusiness,
  },
  {
    label: "Manpower",
    icon: UsersRound,
  },
];


function App() {

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [projects, setProjects] = useState([]);
  const [manpower, setManpower] = useState([]);

  const [projectManpower, setProjectManpower] = useState({});
  const [projectWorkRecords, setProjectWorkRecords] = useState({});
  const [projectExpenses, setProjectExpenses] = useState({});
  const [projectPayments, setProjectPayments] = useState({});

  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedProject, setSelectedProject] = useState(null);


  /* =========================
     LOAD PROJECT DATA
     ========================= */

  const loadProjectData = async () => {

    const [
      manpowerResult,
      expensesResult,
      paymentsResult,
      workResult,
    ] = await Promise.all([
      supabase
        .from("project_manpower")
        .select("project_id, manpower_id")
        .is("removed_at", null),

      supabase
        .from("expenses")
        .select("id, project_id, expense_date, expense_name, amount, created_at")
        .order("expense_date", { ascending: true }),

      supabase
        .from("client_payments")
        .select("id, project_id, payment_date, amount, reference, notes, created_at")
        .order("payment_date", { ascending: true }),

      supabase
        .from("project_work_records")
        .select("id, project_id, manpower_id, work_date, hours, advance, created_at, updated_at")
        .order("work_date", { ascending: true }),
    ]);

    const firstError = [
      manpowerResult.error,
      expensesResult.error,
      paymentsResult.error,
      workResult.error,
    ].find(Boolean);

    if (firstError) {
      console.error("Project data loading error:", firstError);
      return;
    }

    const nextProjectManpower = {};

    (manpowerResult.data || []).forEach((row) => {
      const projectId = String(row.project_id);
      const workerId = String(row.manpower_id);

      if (!nextProjectManpower[projectId]) {
        nextProjectManpower[projectId] = [];
      }

      if (!nextProjectManpower[projectId].includes(workerId)) {
        nextProjectManpower[projectId].push(workerId);
      }
    });

    const nextExpenses = {};

    (expensesResult.data || []).forEach((row) => {
      const projectId = String(row.project_id);

      if (!nextExpenses[projectId]) {
        nextExpenses[projectId] = [];
      }

      nextExpenses[projectId].push({
        id: row.id,
        name: row.expense_name || "",
        amount: Number(row.amount || 0),
        date: row.expense_date || "",
      });
    });

    const nextPayments = {};

    (paymentsResult.data || []).forEach((row) => {
      const projectId = String(row.project_id);

      if (!nextPayments[projectId]) {
        nextPayments[projectId] = [];
      }

      nextPayments[projectId].push({
        id: row.id,
        date: row.payment_date || "",
        amount: Number(row.amount || 0),
        reference: row.reference || "",
        notes: row.notes || "",
      });
    });

    const nextWorkRecords = {};

    (workResult.data || []).forEach((row) => {
      const projectId = String(row.project_id);
      const date = row.work_date;
      const workerId = String(row.manpower_id);

      if (!nextWorkRecords[projectId]) {
        nextWorkRecords[projectId] = {};
      }

      if (!nextWorkRecords[projectId][date]) {
        nextWorkRecords[projectId][date] = {};
      }

      nextWorkRecords[projectId][date][workerId] = {
        id: row.id,
        hours: row.hours ?? "",
        advance: row.advance ?? "",
      };
    });

    setProjectManpower(nextProjectManpower);
    setProjectExpenses(nextExpenses);
    setProjectPayments(nextPayments);
    setProjectWorkRecords(nextWorkRecords);
  };


  /* =========================
     CHECK SUPABASE SESSION
     ========================= */

  useEffect(() => {

    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
      }

      if (mounted) {
        setSession(data?.session || null);
        setAuthLoading(false);
      }
    };

    loadSession();

    const { data: authListener } =
      supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession || null);
      });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };

  }, []);


  /* =========================
     LOAD PERSISTENT PROJECT DATA
     ========================= */

  useEffect(() => {

    if (!session?.user?.id) {
      return;
    }

    loadProjectData();

  }, [session?.user?.id]);


  const handleLogin = (newSession) => {
    setSession(newSession);
  };


  const handleLogout = async () => {

    await supabase.auth.signOut();

    setProjects([]);
    setManpower([]);
    setProjectManpower({});
    setProjectWorkRecords({});
    setProjectExpenses({});
    setProjectPayments({});
    setSelectedProject(null);
    setActivePage("Dashboard");
    setSession(null);

  };


  const handleNavigation = (page) => {
    setActivePage(page);
    setSelectedProject(null);
  };


  /* =========================
     PROJECT STATE
     ========================= */

  const handleCreateProject = (projectData) => {

    setProjects((prev) => {

      const exists = prev.some(
        (project) => String(project.id) === String(projectData.id)
      );

      if (exists) {
        return prev.map((project) =>
          String(project.id) === String(projectData.id)
            ? projectData
            : project
        );
      }

      return [projectData, ...prev];
    });
  };


  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };


  const handleBackToProjects = () => {
    setSelectedProject(null);
  };


  /* =========================
     EDIT PROJECT - DATABASE + UI
     ========================= */

  const handleUpdateProject = async (updatedProject) => {

    /*
     * Keep the exact budget value entered by the user.
     *
     * Number("") becomes 0, so we explicitly check
     * for empty/null/undefined before converting.
     */

    const rawBudget = updatedProject?.budget;

    const budget =
      rawBudget === "" ||
      rawBudget === null ||
      rawBudget === undefined
        ? 0
        : Number(rawBudget);


    const status =
      String(
        updatedProject.status ||
        "active"
      ).toLowerCase();


    const payload = {

      name:
        updatedProject.name?.trim() ||
        "",

      client:
        updatedProject.client?.trim() ||
        "",

      location:
        updatedProject.location?.trim() ||
        null,

      start_date:
        updatedProject.startDate ||
        null,

      expected_end_date:
        updatedProject.expectedEndDate ||
        null,

      actual_end_date:
        updatedProject.actualEndDate ||
        updatedProject.endDate ||
        null,

      /*
       * FIX:
       * Save the actual edited budget value.
       */

      budget:
        Number.isFinite(budget)
          ? budget
          : 0,

      status,

    };


    console.log(
      "Updating project:",
      updatedProject
    );

    console.log(
      "Project update payload:",
      payload
    );


    const {
      data,
      error,
    } =
      await supabase
        .from("projects")
        .update(payload)
        .eq(
          "id",
          updatedProject.id
        )
        .select()
        .single();


    if (error) {

      console.error(
        "Supabase project update error:",
        error
      );

      return false;

    }


    /*
     * Convert database project
     * back into application format.
     */

    const mappedProject = {

      id:
        data.id,

      name:
        data.name || "",

      client:
        data.client || "",

      location:
        data.location || "",

      startDate:
        data.start_date || "",

      expectedEndDate:
        data.expected_end_date || "",

      actualEndDate:
        data.actual_end_date || "",

      /*
       * IMPORTANT:
       * Read the saved database value,
       * not the old project value.
       */

      budget:
        data.budget ?? 0,

      status:
        data.status || "active",

    };


    /*
     * Update project in main list.
     */

    setProjects((prev) =>
      prev.map((project) =>
        String(project.id) ===
        String(mappedProject.id)
          ? mappedProject
          : project
      )
    );


    /*
     * Update currently opened project.
     */

    setSelectedProject(
      mappedProject
    );


    return true;

  };


  /* =========================
     MANPOWER STATE
     ========================= */

  // Upsert-by-ID prevents React StrictMode / reload effects from
  // displaying the same database worker twice.
  const handleAddManpower = (newManpower) => {

    setManpower((prev) => {

      const exists = prev.some(
        (person) => String(person.id) === String(newManpower.id)
      );

      if (exists) {
        return prev.map((person) =>
          String(person.id) === String(newManpower.id)
            ? newManpower
            : person
        );
      }

      return [newManpower, ...prev];
    });
  };


  const handleEditManpower = (updatedManpower) => {

    setManpower((prev) =>
      prev.map((person) =>
        String(person.id) === String(updatedManpower.id)
          ? updatedManpower
          : person
      )
    );
  };


  const handleRemoveManpower = (workerId) => {

    setManpower((prev) =>
      prev.filter((person) => String(person.id) !== String(workerId))
    );

    setProjectManpower((prev) => {
      const updated = {};

      Object.entries(prev).forEach(([projectId, workerIds]) => {
        updated[projectId] = (workerIds || []).filter(
          (id) => String(id) !== String(workerId)
        );
      });

      return updated;
    });
  };


  /* =========================
     ASSIGN MANPOWER - DATABASE
     ========================= */

  const handleAssignManpower = async (projectId, workerIds) => {

    const uniqueWorkerIds = [...new Set(
      (workerIds || []).map((id) => String(id))
    )];

    const { error: deleteError } = await supabase
      .from("project_manpower")
      .delete()
      .eq("project_id", projectId);

    if (deleteError) {
      console.error("Supabase manpower assignment delete error:", deleteError);
      return false;
    }

    if (uniqueWorkerIds.length > 0) {

      const rows = uniqueWorkerIds.map((workerId) => ({
        project_id: projectId,
        manpower_id: workerId,
      }));

      const { error: insertError } = await supabase
        .from("project_manpower")
        .insert(rows);

      if (insertError) {
        console.error("Supabase manpower assignment insert error:", insertError);
        return false;
      }
    }

    setProjectManpower((prev) => ({
      ...prev,
      [String(projectId)]: uniqueWorkerIds,
    }));

    return true;
  };


  /* =========================
     DAILY WORK - DATABASE
     ========================= */

  const handleSaveWorkRecord = async (projectId, date, records) => {

    const entries = Object.entries(records || {});

    if (entries.length === 0) {
      return;
    }

    const rows = entries.map(([workerId, record]) => ({
      project_id: projectId,
      manpower_id: workerId,
      work_date: date,
      hours: Number(record?.hours || 0),
      advance: Number(record?.advance || 0),
    }));

    const { data, error } = await supabase
      .from("project_work_records")
      .upsert(rows, {
        onConflict: "project_id,manpower_id,work_date",
      })
      .select();

    if (error) {
      console.error("Supabase work record save error:", error);
      return false;
    }

    const normalizedRecords = {};

    (data || rows).forEach((row) => {
      normalizedRecords[String(row.manpower_id)] = {
        id: row.id,
        hours: row.hours ?? 0,
        advance: row.advance ?? 0,
      };
    });

    setProjectWorkRecords((prev) => ({
      ...prev,
      [String(projectId)]: {
        ...(prev[String(projectId)] || {}),
        [date]: {
          ...(prev[String(projectId)]?.[date] || {}),
          ...normalizedRecords,
        },
      },
    }));

    return true;
  };


  /* =========================
     EXPENSES - DATABASE
     ========================= */

  const handleAddProjectExpense = async (projectId, expense) => {

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        project_id: projectId,
        expense_date: expense.date,
        expense_name: expense.name,
        amount: Number(expense.amount || 0),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase expense creation error:", error);
      return false;
    }

    const newExpense = {
      id: data.id,
      name: data.expense_name || "",
      amount: Number(data.amount || 0),
      date: data.expense_date || "",
    };

    setProjectExpenses((prev) => ({
      ...prev,
      [String(projectId)]: [
        ...(prev[String(projectId)] || []),
        newExpense,
      ],
    }));

    return true;
  };


  const handleRemoveProjectExpense = async (projectId, expenseId) => {

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("project_id", projectId);

    if (error) {
      console.error("Supabase expense deletion error:", error);
      return false;
    }

    setProjectExpenses((prev) => ({
      ...prev,
      [String(projectId)]: (prev[String(projectId)] || []).filter(
        (expense) => String(expense.id) !== String(expenseId)
      ),
    }));

    return true;
  };


  /* =========================
     CLIENT PAYMENTS - DATABASE
     ========================= */

  const handleAddProjectPayment = async (projectId, payment) => {

    const { data, error } = await supabase
      .from("client_payments")
      .insert({
        project_id: projectId,
        payment_date: payment.date,
        amount: Number(payment.amount || 0),
        reference: payment.reference || null,
        notes: payment.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase payment creation error:", error);
      return false;
    }

    const newPayment = {
      id: data.id,
      date: data.payment_date || "",
      amount: Number(data.amount || 0),
      reference: data.reference || "",
      notes: data.notes || "",
    };

    setProjectPayments((prev) => ({
      ...prev,
      [String(projectId)]: [
        ...(prev[String(projectId)] || []),
        newPayment,
      ],
    }));

    return true;
  };


  const handleRemoveProjectPayment = async (projectId, paymentId) => {

    const { error } = await supabase
      .from("client_payments")
      .delete()
      .eq("id", paymentId)
      .eq("project_id", projectId);

    if (error) {
      console.error("Supabase payment deletion error:", error);
      return false;
    }

    setProjectPayments((prev) => ({
      ...prev,
      [String(projectId)]: (prev[String(projectId)] || []).filter(
        (payment) => String(payment.id) !== String(paymentId)
      ),
    }));

    return true;
  };


  /*
   * WAIT FOR AUTH
   */

  if (authLoading) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "Arial, sans-serif",
        }}
      >

        Loading Easecraft...

      </div>

    );

  }


  /*
   * LOGIN
   */

  if (!session) {

    return (

      <Login
        onLogin={
          handleLogin
        }
      />

    );

  }


  /*
   * MAIN APPLICATION
   */

  return (

    <div className="app-shell">


      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-name">
            Easecraft
          </div>

          <div className="brand-subtitle">
            Manpower Expenses
          </div>

        </div>


        <div className="sidebar-content">

          <div className="nav-section-title">
            Main Menu
          </div>


          <nav className="nav-list">

            {navigation.map(
              (item) => {

                const Icon =
                  item.icon;


                const isActive =
                  activePage ===
                    item.label &&
                  !selectedProject;


                return (

                  <button
                    key={
                      item.label
                    }
                    className={`nav-item ${
                      isActive
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleNavigation(
                        item.label
                      )
                    }
                  >

                    <Icon
                      className="nav-icon"
                    />

                    <span>
                      {item.label}
                    </span>

                  </button>

                );

              }
            )}

          </nav>

        </div>


        <div className="sidebar-footer">

          <div className="company-footer-name">
            Easecraft
          </div>

          <div className="company-footer-subtitle">
            Manpower Expenses
          </div>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main-area">


        {/* TOPBAR */}

        <header className="topbar">

          <button
            className="notification-button"
            title="Notifications"
          >

            <Bell size={20} />

          </button>


          <div className="user-block">

            <div className="user-info">

              <div className="user-name">

                {session.user?.email ||
                  "Administrator"}

              </div>

              <div className="user-role">
                Administrator
              </div>

            </div>


            <div className="user-avatar">
              RR
            </div>

          </div>


          <button
            className="logout-button"
            onClick={
              handleLogout
            }
          >

            <LogOut size={17} />

            <span>
              Logout
            </span>

          </button>

        </header>


        {/* PAGE */}

        <section className="page-content">


          {selectedProject ? (

            <ProjectDetails

              project={
                selectedProject
              }

              manpower={
                manpower
              }

              assignedManpowerIds={
                projectManpower[
                  selectedProject.id
                ] || []
              }

              onAssignManpower={
                handleAssignManpower
              }

              onUpdateProject={
                handleUpdateProject
              }

              workRecords={
                projectWorkRecords[
                  selectedProject.id
                ] || {}
              }

              onSaveWorkRecord={
                handleSaveWorkRecord
              }

              expenses={
                projectExpenses[
                  selectedProject.id
                ] || []
              }

              onAddExpense={
                handleAddProjectExpense
              }

              onDeleteExpense={
                handleRemoveProjectExpense
              }

              payments={
                projectPayments[
                  selectedProject.id
                ] || []
              }

              onAddPayment={
                handleAddProjectPayment
              }

              onDeletePayment={
                handleRemoveProjectPayment
              }

              onBack={
                handleBackToProjects
              }

            />

          ) : activePage ===
            "Dashboard" ? (

            <>

              <div className="page-heading">

                <h1 className="page-title">
                  Dashboard
                </h1>

                <p className="page-description">
                  Overview of your manpower projects and expenses.
                </p>

              </div>

              <Dashboard />

            </>

          ) : activePage ===
            "Projects" ? (

            <>

              <div className="page-heading">

                <h1 className="page-title">
                  Projects
                </h1>

                <p className="page-description">
                  Manage your manpower projects, clients and budgets.
                </p>

              </div>


              <Projects

                projects={
                  projects
                }

                onCreateProject={
                  handleCreateProject
                }

                onProjectClick={
                  handleProjectClick
                }

              />

            </>

          ) : activePage ===
            "Manpower" ? (

            <>

              <div className="page-heading">

                <h1 className="page-title">
                  Manpower
                </h1>

                <p className="page-description">
                  Manage manpower records and hourly rates.
                </p>

              </div>


              <Manpower

                manpower={
                  manpower
                }

                onAddManpower={
                  handleAddManpower
                }

                onEditManpower={
                  handleEditManpower
                }

                onRemoveManpower={
                  handleRemoveManpower
                }

              />

            </>

          ) : null}

        </section>

      </main>

    </div>

  );

}


export default App;