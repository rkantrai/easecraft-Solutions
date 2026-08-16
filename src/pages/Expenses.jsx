import React, { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Receipt,
  IndianRupee,
  CalendarDays,
  Trash2,
  X,
  BriefcaseBusiness,
  TrendingDown,
} from "lucide-react";

import { supabase } from "../lib/supabase";


function Expenses() {

  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] =
    useState("all");

  const [showForm, setShowForm] =
    useState(false);

  const [formData, setFormData] = useState({
    projectId: "",
    expenseName: "",
    amount: "",
    expenseDate:
      new Date()
        .toISOString()
        .split("T")[0],
  });


  /*
   * LOAD PROJECTS + EXPENSES
   */

  useEffect(() => {

    const loadData = async () => {

      setLoading(true);
      setError("");

      const [
        projectsResult,
        expensesResult,
      ] = await Promise.all([

        supabase
          .from("projects")
          .select(
            "id, name, client"
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),

        supabase
          .from("expenses")
          .select("*")
          .order(
            "expense_date",
            {
              ascending: false,
            }
          ),

      ]);


      if (
        projectsResult.error
      ) {

        console.error(
          "Projects loading error:",
          projectsResult.error
        );

        setError(
          projectsResult.error.message
        );

        setLoading(false);

        return;
      }


      if (
        expensesResult.error
      ) {

        console.error(
          "Expenses loading error:",
          expensesResult.error
        );

        setError(
          expensesResult.error.message
        );

        setLoading(false);

        return;
      }


      setProjects(
        projectsResult.data || []
      );

      setExpenses(
        expensesResult.data || []
      );

      setLoading(false);

    };


    loadData();

  }, []);


  /*
   * PROJECT NAME HELPER
   */

  const getProject = (
    projectId
  ) => {

    return projects.find(
      (project) =>
        project.id === projectId
    );

  };


  /*
   * FORM CHANGE
   */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  /*
   * RESET FORM
   */

  const resetForm = () => {

    setFormData({

      projectId: "",

      expenseName: "",

      amount: "",

      expenseDate:
        new Date()
          .toISOString()
          .split("T")[0],

    });

  };


  /*
   * CREATE EXPENSE
   */

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    setError("");


    if (
      !formData.projectId
    ) {

      setError(
        "Please select a project."
      );

      return;

    }


    if (
      !formData.expenseName.trim()
    ) {

      setError(
        "Please enter an expense name."
      );

      return;

    }


    if (
      formData.amount === "" ||
      Number(formData.amount) < 0
    ) {

      setError(
        "Please enter a valid amount."
      );

      return;

    }


    setSaving(true);


    const expenseToInsert = {

      project_id:
        formData.projectId,

      expense_date:
        formData.expenseDate,

      expense_name:
        formData.expenseName.trim(),

      amount:
        Number(formData.amount),

    };


    console.log(
      "Expense being sent to Supabase:",
      expenseToInsert
    );


    const {
      data,
      error: insertError,
    } =
      await supabase
        .from("expenses")
        .insert(
          expenseToInsert
        )
        .select()
        .single();


    if (insertError) {

      console.error(
        "Supabase expense creation error:",
        insertError
      );

      setError(
        insertError.message
      );

      setSaving(false);

      return;

    }


    /*
     * Add new expense to UI
     */

    setExpenses(
      (previous) => [
        data,
        ...previous,
      ]
    );


    resetForm();

    setShowForm(false);

    setSaving(false);

  };


  /*
   * DELETE EXPENSE
   */

  const handleDelete = async (
    expense
  ) => {

    const confirmed =
      window.confirm(
        `Delete "${expense.expense_name}" expense of ₹${Number(
          expense.amount || 0
        ).toLocaleString("en-IN")}?`
      );


    if (!confirmed) {
      return;
    }


    setError("");


    const {
      error: deleteError,
    } =
      await supabase
        .from("expenses")
        .delete()
        .eq(
          "id",
          expense.id
        );


    if (deleteError) {

      console.error(
        "Supabase expense deletion error:",
        deleteError
      );

      setError(
        deleteError.message
      );

      return;

    }


    setExpenses(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !== expense.id
        )
    );

  };


  /*
   * FILTER EXPENSES
   */

  const filteredExpenses =
    useMemo(() => {

      const searchText =
        search
          .toLowerCase()
          .trim();


      return expenses.filter(
        (expense) => {

          const project =
            getProject(
              expense.project_id
            );


          const projectName =
            project?.name || "";


          const client =
            project?.client || "";


          const matchesSearch =
            !searchText ||
            expense.expense_name
              ?.toLowerCase()
              .includes(
                searchText
              ) ||
            projectName
              .toLowerCase()
              .includes(
                searchText
              ) ||
            client
              .toLowerCase()
              .includes(
                searchText
              );


          const matchesProject =
            projectFilter ===
              "all" ||
            expense.project_id ===
              projectFilter;


          return (
            matchesSearch &&
            matchesProject
          );

        }
      );

    }, [
      expenses,
      projects,
      search,
      projectFilter,
    ]);


  /*
   * SUMMARY
   */

  const totalExpenses =
    expenses.reduce(
      (sum, expense) =>
        sum +
        Number(
          expense.amount || 0
        ),
      0
    );


  const filteredTotal =
    filteredExpenses.reduce(
      (sum, expense) =>
        sum +
        Number(
          expense.amount || 0
        ),
      0
    );


  /*
   * TODAY
   */

  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  const todayExpenses =
    expenses
      .filter(
        (expense) =>
          expense.expense_date ===
          today
      )
      .reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount || 0
          ),
        0
      );


  /*
   * FORMAT DATE
   */

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


  /*
   * RETURN
   */

  return (

    <div
      style={{
        width: "100%",
      }}
    >

      {/* =========================
          HEADER
      ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "24px",
        }}
      >

        <div>

          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            Expenses
          </h2>

          <p
            style={{
              margin:
                "6px 0 0",
              color: "#667085",
              fontSize: "14px",
            }}
          >
            Track project expenses and
            monitor your spending.
          </p>

        </div>


        <button
          className="projects-primary-button"
          onClick={() =>
            setShowForm(true)
          }
        >

          <Plus size={18} />

          Add Expense

        </button>

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (

        <div
          style={{
            marginBottom: "16px",
            padding:
              "12px 16px",
            borderRadius: "8px",
            background:
              "#fff1f2",
            color: "#b42318",
            border:
              "1px solid #fecdd3",
            fontSize: "14px",
          }}
        >

          Supabase error: {error}

        </div>

      )}


      {/* =========================
          SUMMARY
      ========================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >

        {/* TOTAL */}

        <div
          className="project-summary-card"
        >

          <div
            className="project-summary-icon"
          >

            <Receipt
              size={19}
            />

          </div>

          <div>

            <div
              className="project-summary-label"
            >
              Total Expenses
            </div>

            <div
              className="project-summary-value"
            >
              ₹
              {totalExpenses.toLocaleString(
                "en-IN"
              )}
            </div>

          </div>

        </div>


        {/* TODAY */}

        <div
          className="project-summary-card"
        >

          <div
            className="project-summary-icon"
          >

            <TrendingDown
              size={19}
            />

          </div>

          <div>

            <div
              className="project-summary-label"
            >
              Today's Expenses
            </div>

            <div
              className="project-summary-value"
            >
              ₹
              {todayExpenses.toLocaleString(
                "en-IN"
              )}
            </div>

          </div>

        </div>


        {/* RECORDS */}

        <div
          className="project-summary-card"
        >

          <div
            className="project-summary-icon"
          >

            <BriefcaseBusiness
              size={19}
            />

          </div>

          <div>

            <div
              className="project-summary-label"
            >
              Expense Records
            </div>

            <div
              className="project-summary-value"
            >
              {expenses.length}
            </div>

          </div>

        </div>

      </div>


      {/* =========================
          EXPENSE CARD
      ========================= */}

      <div
        className="projects-card"
      >

        {/* HEADER */}

        <div
          className="projects-card-header"
        >

          <div>

            <h3>
              All Expenses
            </h3>

            <p>
              Project expense records
            </p>

          </div>


          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >

            {/* SEARCH */}

            <div
              className="projects-search"
            >

              <Search
                size={16}
              />

              <input
                type="text"
                placeholder="Search expenses..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>


            {/* PROJECT FILTER */}

            <select
              value={
                projectFilter
              }
              onChange={(e) =>
                setProjectFilter(
                  e.target.value
                )
              }
              style={{
                height: "38px",
                padding:
                  "0 12px",
                border:
                  "1px solid #d0d5dd",
                borderRadius:
                  "8px",
                background:
                  "#ffffff",
                fontSize:
                  "14px",
                color:
                  "#344054",
                outline: "none",
              }}
            >

              <option value="all">
                All Projects
              </option>

              {projects.map(
                (project) => (

                  <option
                    key={
                      project.id
                    }
                    value={
                      project.id
                    }
                  >
                    {project.name}
                  </option>

                )
              )}

            </select>

          </div>

        </div>


        {/* LOADING */}

        {loading ? (

          <div
            className="projects-empty"
          >

            <div
              className="projects-empty-icon"
            >

              <Receipt
                size={28}
              />

            </div>

            <h3>
              Loading expenses...
            </h3>

            <p>
              Connecting to your
              Supabase database.
            </p>

          </div>

        ) : filteredExpenses.length ===
          0 ? (

          <div
            className="projects-empty"
          >

            <div
              className="projects-empty-icon"
            >

              <Receipt
                size={28}
              />

            </div>

            <h3>
              No expenses found
            </h3>

            <p>
              Add your first project
              expense to start tracking
              spending.
            </p>

            <button
              className="projects-secondary-button"
              onClick={() =>
                setShowForm(true)
              }
            >

              <Plus size={17} />

              Add Expense

            </button>

          </div>

        ) : (

          <div
            className="projects-table-wrapper"
          >

            <table
              className="projects-table"
            >

              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Expense
                  </th>

                  <th>
                    Project
                  </th>

                  <th>
                    Client
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredExpenses.map(
                  (expense) => {

                    const project =
                      getProject(
                        expense.project_id
                      );


                    return (

                      <tr
                        key={
                          expense.id
                        }
                      >

                        <td>

                          <div
                            className="project-date"
                          >

                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              expense.expense_date
                            )}

                          </div>

                        </td>


                        <td>

                          <strong>
                            {
                              expense.expense_name
                            }
                          </strong>

                        </td>


                        <td>

                          <div
                            className="project-name-cell"
                          >

                            <div
                              className="project-table-icon"
                            >

                              <BriefcaseBusiness
                                size={16}
                              />

                            </div>

                            <span>
                              {
                                project?.name ||
                                "Unknown Project"
                              }
                            </span>

                          </div>

                        </td>


                        <td>

                          {
                            project?.client ||
                            "—"
                          }

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
                              handleDelete(
                                expense
                              )
                            }
                            title="Delete expense"
                          >

                            <Trash2
                              size={16}
                            />

                          </button>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>


            {/* FILTERED TOTAL */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                padding:
                  "16px 20px",
                borderTop:
                  "1px solid #eaecf0",
                fontSize:
                  "14px",
                color:
                  "#667085",
              }}
            >

              Showing:

              <strong
                style={{
                  marginLeft:
                    "6px",
                  color:
                    "#101828",
                }}
              >
                ₹
                {filteredTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

          </div>

        )}

      </div>


      {/* =========================
          ADD EXPENSE MODAL
      ========================= */}

      {showForm && (

        <div
          className="project-modal-overlay"
          onClick={() =>
            !saving &&
            setShowForm(false)
          }
        >

          <div
            className="project-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div
              className="project-modal-header"
            >

              <div>

                <h2>
                  Add Expense
                </h2>

                <p>
                  Record an expense against
                  a project.
                </p>

              </div>


              <button
                className="project-modal-close"
                onClick={() =>
                  !saving &&
                  setShowForm(false)
                }
                disabled={saving}
              >

                <X size={19} />

              </button>

            </div>


            {/* FORM */}

            <form
              className="project-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* PROJECT */}

              <div
                className="project-form-group"
              >

                <label>
                  Project *
                </label>

                <select
                  name="projectId"
                  value={
                    formData.projectId
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select Project
                  </option>

                  {projects.map(
                    (project) => (

                      <option
                        key={
                          project.id
                        }
                        value={
                          project.id
                        }
                      >
                        {project.name}
                        {project.client
                          ? ` — ${project.client}`
                          : ""}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* EXPENSE NAME */}

              <div
                className="project-form-group"
              >

                <label>
                  Expense Name *
                </label>

                <input
                  name="expenseName"
                  value={
                    formData.expenseName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Material transportation"
                  required
                />

              </div>


              {/* DATE + AMOUNT */}

              <div
                className="project-form-row"
              >

                <div
                  className="project-form-group"
                >

                  <label>
                    Expense Date *
                  </label>

                  <input
                    type="date"
                    name="expenseDate"
                    value={
                      formData.expenseDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>


                <div
                  className="project-form-group"
                >

                  <label>
                    Amount *
                  </label>

                  <input
                    type="number"
                    name="amount"
                    value={
                      formData.amount
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 5000"
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

              </div>


              {/* ACTIONS */}

              <div
                className="project-form-actions"
              >

                <button
                  type="button"
                  className="project-cancel-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="projects-primary-button"
                  disabled={saving}
                >

                  <Plus size={17} />

                  {saving
                    ? "Saving..."
                    : "Save Expense"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}


export default Expenses;