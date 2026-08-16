import React, { useEffect, useState } from "react";

import {
  Plus,
  Search,
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  IndianRupee,
  X,
  CheckCircle2,
  Clock3,
  ChevronRight,
} from "lucide-react";

import { supabase } from "../lib/supabase";


function Projects({
  projects,
  onCreateProject,
  onProjectClick,
}) {

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
   * CREATE PROJECT FORM
   */

  const [formData, setFormData] =
    useState({

      name: "",
      client: "",
      location: "",
      startDate: "",
      expectedEndDate: "",
      actualEndDate: "",
      budget: "",
      status: "active",

    });


  /*
   * CONVERT SUPABASE PROJECT
   * INTO APP PROJECT FORMAT
   */

  const mapProjectFromSupabase = (
    project
  ) => {

    return {

      id: project.id,

      name:
        project.name || "",

      client:
        project.client || "",

      location:
        project.location || "",

      startDate:
        project.start_date || "",

      expectedEndDate:
        project.expected_end_date || "",

      actualEndDate:
        project.actual_end_date || "",

      budget:
        project.budget ?? 0,

      status:
        project.status || "active",

      userId:
        project.user_id || null,

    };

  };


  /*
   * LOAD PROJECTS
   * FOR CURRENT LOGGED-IN USER
   */

  useEffect(() => {

    const loadProjects =
      async () => {

        setLoading(true);
        setError("");


        /*
         * GET CURRENT SUPABASE USER
         */

        const {
          data: {
            user,
          },
          error:
            authError,
        } =
          await supabase.auth.getUser();


        if (authError) {

          console.error(
            "Supabase auth error:",
            authError
          );

          setError(
            authError.message
          );

          setLoading(false);

          return;

        }


        if (!user) {

          setError(
            "No logged-in Supabase user found."
          );

          setLoading(false);

          return;

        }


        console.log(
          "Logged-in user:",
          user.email,
          user.id
        );


        /*
         * LOAD ONLY THIS USER'S PROJECTS
         */

        const {
          data,
          error:
            fetchError,
        } =
          await supabase
            .from("projects")
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


        if (fetchError) {

          console.error(
            "Supabase project loading error:",
            fetchError
          );

          setError(
            fetchError.message
          );

          setLoading(false);

          return;

        }


        const mappedProjects =
          (data || []).map(
            mapProjectFromSupabase
          );


        /*
         * PUT LOADED PROJECTS
         * INTO APP STATE
         */

        mappedProjects.forEach(
          (project) => {

            onCreateProject(
              project
            );

          }
        );


        setLoading(false);

      };


    loadProjects();

  }, []);


  /*
   * FORM CHANGE
   */

  const handleChange = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;


    setFormData(
      (prev) => ({

        ...prev,

        [name]: value,

      })
    );

  };


  /*
   * RESET FORM
   */

  const resetForm = () => {

    setFormData({

      name: "",
      client: "",
      location: "",
      startDate: "",
      expectedEndDate: "",
      actualEndDate: "",
      budget: "",
      status: "active",

    });

  };


  /*
   * CREATE PROJECT
   */

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();


    if (
      !formData.name.trim() ||
      !formData.client.trim()
    ) {

      return;

    }


    setSaving(true);
    setError("");


    /*
     * GET CURRENT LOGGED-IN USER
     */

    const {
      data: {
        user,
      },
      error:
        authError,
    } =
      await supabase.auth.getUser();


    if (authError) {

      console.error(
        "Supabase auth error:",
        authError
      );

      setError(
        authError.message
      );

      setSaving(false);

      return;

    }


    if (!user) {

      setError(
        "You are not logged in. Please login again."
      );

      setSaving(false);

      return;

    }


    /*
     * IMPORTANT
     *
     * projects.user_id references
     * auth.users(id)
     *
     * Therefore we MUST send
     * the logged-in user's UUID.
     */

    const projectToInsert = {

      user_id:
        user.id,

      name:
        formData.name.trim(),

      client:
        formData.client.trim(),

      location:
        formData.location.trim() ||
        null,

      start_date:
        formData.startDate ||
        null,

      expected_end_date:
        formData.expectedEndDate ||
        null,

      actual_end_date:
        formData.actualEndDate ||
        null,

      budget:
        formData.budget === ""
          ? 0
          : Number(
              formData.budget
            ),

      status:
        formData.status,

    };


    console.log(
      "Logged-in user:",
      user.email,
      user.id
    );


    console.log(
      "Project being sent to Supabase:",
      projectToInsert
    );


    /*
     * SAVE PROJECT
     */

    const {
      data,
      error:
        insertError,
    } =
      await supabase
        .from("projects")
        .insert(
          projectToInsert
        )
        .select()
        .single();


    if (insertError) {

      console.error(
        "Supabase project creation error:",
        insertError
      );

      setError(
        insertError.message
      );

      setSaving(false);

      return;

    }


    /*
     * CONVERT SUPABASE RESULT
     */

    const newProject =
      mapProjectFromSupabase(
        data
      );


    /*
     * UPDATE APP STATE
     */

    onCreateProject(
      newProject
    );


    /*
     * RESET
     */

    resetForm();

    setShowForm(false);

    setSaving(false);

  };


  /*
   * SUMMARY
   */

  const totalProjects =
    projects.length;


  const activeProjects =
    projects.filter(
      (project) =>
        project.status ===
        "active"
    ).length;


  const completedProjects =
    projects.filter(
      (project) =>
        project.status ===
        "completed"
    ).length;


  const totalBudget =
    projects.reduce(
      (sum, project) =>
        sum +
        Number(
          project.budget || 0
        ),
      0
    );


  /*
   * SEARCH
   */

  const filteredProjects =
    projects.filter(
      (project) => {

        const text =
          search
            .toLowerCase()
            .trim();


        return (

          project.name
            ?.toLowerCase()
            .includes(text) ||

          project.client
            ?.toLowerCase()
            .includes(text) ||

          project.location
            ?.toLowerCase()
            .includes(text)

        );

      }
    );


  /*
   * DISPLAY STATUS
   */

  const getStatusLabel = (
    status
  ) => {

    if (
      status ===
      "active"
    ) {

      return "Active";

    }


    if (
      status ===
      "completed"
    ) {

      return "Completed";

    }


    if (
      status ===
      "cancelled"
    ) {

      return "Cancelled";

    }


    return status;

  };


  /*
   * RETURN
   */

  return (

    <div className="projects-page">


      {/* HEADER */}

      <div className="projects-header">

        <div>

          <h2 className="projects-title">
            Projects
          </h2>

          <p className="projects-subtitle">
            Manage your manpower projects, clients and budgets.
          </p>

        </div>


        <button
          className="projects-primary-button"
          onClick={() =>
            setShowForm(true)
          }
        >

          <Plus size={18} />

          <span>
            New Project
          </span>

        </button>

      </div>


      {/* ERROR */}

      {error && (

        <div
          style={{
            marginBottom:
              "16px",
            padding:
              "12px 16px",
            borderRadius:
              "8px",
            background:
              "#fff1f2",
            color:
              "#b42318",
            border:
              "1px solid #fecdd3",
            fontSize:
              "14px",
          }}
        >

          Supabase error: {error}

        </div>

      )}


      {/* SUMMARY */}

      <div className="projects-summary">


        {/* TOTAL */}

        <div className="project-summary-card">

          <div className="project-summary-icon">

            <BriefcaseBusiness
              size={19}
            />

          </div>

          <div>

            <div className="project-summary-label">
              Total Projects
            </div>

            <div className="project-summary-value">
              {totalProjects}
            </div>

          </div>

        </div>


        {/* ACTIVE */}

        <div className="project-summary-card">

          <div className="project-summary-icon">

            <Clock3
              size={19}
            />

          </div>

          <div>

            <div className="project-summary-label">
              Active Projects
            </div>

            <div className="project-summary-value">
              {activeProjects}
            </div>

          </div>

        </div>


        {/* COMPLETED */}

        <div className="project-summary-card">

          <div className="project-summary-icon">

            <CheckCircle2
              size={19}
            />

          </div>

          <div>

            <div className="project-summary-label">
              Completed
            </div>

            <div className="project-summary-value">
              {completedProjects}
            </div>

          </div>

        </div>


        {/* BUDGET */}

        <div className="project-summary-card">

          <div className="project-summary-icon">

            <IndianRupee
              size={19}
            />

          </div>

          <div>

            <div className="project-summary-label">
              Total Budget
            </div>

            <div className="project-summary-value">

              ₹
              {totalBudget.toLocaleString(
                "en-IN"
              )}

            </div>

          </div>

        </div>

      </div>


      {/* PROJECT TABLE */}

      <div className="projects-card">

        <div className="projects-card-header">

          <div>

            <h3>
              All Projects
            </h3>

            <p>
              Your project records
            </p>

          </div>


          <div className="projects-search">

            <Search
              size={16}
            />

            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="projects-empty">

            <div className="projects-empty-icon">

              <BriefcaseBusiness
                size={28}
              />

            </div>

            <h3>
              Loading projects...
            </h3>

            <p>
              Connecting to your Supabase database.
            </p>

          </div>


        ) : projects.length ===
          0 ? (

          <div className="projects-empty">

            <div className="projects-empty-icon">

              <BriefcaseBusiness
                size={28}
              />

            </div>

            <h3>
              No projects yet
            </h3>

            <p>
              Create your first project to start tracking manpower, work and expenses.
            </p>

            <button
              className="projects-secondary-button"
              onClick={() =>
                setShowForm(true)
              }
            >

              <Plus size={17} />

              Create Project

            </button>

          </div>


        ) : filteredProjects.length ===
          0 ? (

          <div className="projects-empty">

            <div className="projects-empty-icon">

              <Search
                size={26}
              />

            </div>

            <h3>
              No projects found
            </h3>

            <p>
              Try another project, client or location.
            </p>

          </div>


        ) : (

          <div className="projects-table-wrapper">

            <table className="projects-table">

              <thead>

                <tr>

                  <th>
                    Project
                  </th>

                  <th>
                    Client
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Start
                  </th>

                  <th>
                    Expected End
                  </th>

                  <th>
                    Budget
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredProjects.map(
                  (project) => {

                    const budget =
                      Number(
                        project.budget ||
                        0
                      );


                    return (

                      <tr
                        key={
                          project.id
                        }
                        className="project-clickable-row"
                        onClick={() =>
                          onProjectClick(
                            project
                          )
                        }
                      >

                        <td>

                          <div className="project-name-cell">

                            <div className="project-table-icon">

                              <BriefcaseBusiness
                                size={16}
                              />

                            </div>

                            <strong>
                              {
                                project.name
                              }
                            </strong>

                          </div>

                        </td>


                        <td>
                          {
                            project.client
                          }
                        </td>


                        <td>

                          <div className="project-location">

                            <MapPin
                              size={14}
                            />

                            {
                              project.location ||
                              "—"
                            }

                          </div>

                        </td>


                        <td>

                          <div className="project-date">

                            <CalendarDays
                              size={14}
                            />

                            {
                              project.startDate ||
                              "—"
                            }

                          </div>

                        </td>


                        <td>

                          <div className="project-date">

                            <CalendarDays
                              size={14}
                            />

                            {
                              project.expectedEndDate ||
                              "—"
                            }

                          </div>

                        </td>


                        <td>

                          ₹
                          {
                            budget.toLocaleString(
                              "en-IN"
                            )
                          }

                        </td>


                        <td>

                          <span
                            className={`project-status ${
                              project.status ===
                              "completed"
                                ? "completed"
                                : "active"
                            }`}
                          >

                            {
                              getStatusLabel(
                                project.status
                              )
                            }

                          </span>

                        </td>


                        <td>

                          <ChevronRight
                            size={18}
                            className="project-row-arrow"
                          />

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


      {/* CREATE PROJECT MODAL */}

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


            {/* MODAL HEADER */}

            <div className="project-modal-header">

              <div>

                <h2>
                  Create New Project
                </h2>

                <p>
                  Add the commercial and schedule details.
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


              {/* PROJECT NAME */}

              <div className="project-form-group">

                <label>
                  Project Name *
                </label>

                <input
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Moody's Cafeteria Modification"
                  required
                />

              </div>


              {/* CLIENT + LOCATION */}

              <div className="project-form-row">

                <div className="project-form-group">

                  <label>
                    Client *
                  </label>

                  <input
                    name="client"
                    value={
                      formData.client
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Moody's"
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
                      formData.location
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Gurgaon"
                  />

                </div>

              </div>


              {/* START + EXPECTED END */}

              <div className="project-form-row">

                <div className="project-form-group">

                  <label>
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={
                      formData.startDate
                    }
                    onChange={
                      handleChange
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
                      formData.expectedEndDate
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>


              {/* ACTUAL END + BUDGET */}

              <div className="project-form-row">

                <div className="project-form-group">

                  <label>
                    Actual End Date
                  </label>

                  <input
                    type="date"
                    name="actualEndDate"
                    value={
                      formData.actualEndDate
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                <div className="project-form-group">

                  <label>
                    Project Amount / Budget
                  </label>

                  <input
                    type="number"
                    name="budget"
                    value={
                      formData.budget
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="0"
                    min="0"
                  />

                </div>

              </div>


              {/* STATUS */}

              <div className="project-form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="active">
                    Active
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                </select>

              </div>


              {/* ACTIONS */}

              <div className="project-form-actions">

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

                  <Plus
                    size={17}
                  />

                  {
                    saving
                      ? "Saving..."
                      : "Create Project"
                  }

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}


export default Projects;