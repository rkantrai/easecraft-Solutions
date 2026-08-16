import React, { useEffect, useRef, useState } from "react";

import {
  Plus,
  Search,
  UsersRound,
  UserPlus,
  IndianRupee,
  Clock3,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

import { supabase } from "../lib/supabase";


function Manpower({
  manpower = [],
  onAddManpower,
  onEditManpower,
  onRemoveManpower,
}) {

  const [showForm, setShowForm] =
    useState(false);

  const [editingPerson, setEditingPerson] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Prevent duplicate loading
   * in React development/StrictMode.
   */
  const loadedIdsRef =
    useRef(new Set());


  const [formData, setFormData] =
    useState({

      workerName: "",
      role: "",
      hourlyRate: "",
      status: "Active",

    });


  /*
   * ---------------------------------------
   * MAP SUPABASE ROW TO APP FORMAT
   * ---------------------------------------
   *
   * Supabase:
   *
   * name
   * role
   * hourly_rate
   * status
   *
   * App:
   *
   * workerName
   * role
   * hourlyRate
   * status
   */

  const mapWorkerFromSupabase =
    (worker) => {

      return {

        id: worker.id,

        workerName:
          worker.name || "",

        role:
          worker.role || "",

        hourlyRate:
          worker.hourly_rate ?? 0,

        status:
          worker.status === "inactive"
            ? "Inactive"
            : "Active",

      };

    };


  /*
   * ---------------------------------------
   * LOAD MANPOWER
   * ---------------------------------------
   */

  useEffect(() => {

    let cancelled = false;


    const loadManpower =
      async () => {

        setLoading(true);
        setError("");


        /*
         * Make sure user is logged in.
         */

        const {
          data: {
            user,
          },
          error:
            userError,
        } =
          await supabase.auth.getUser();


        if (userError) {

          console.error(
            "Supabase user error:",
            userError
          );

          if (!cancelled) {

            setError(
              userError.message
            );

            setLoading(false);

          }

          return;

        }


        if (!user) {

          if (!cancelled) {

            setError(
              "No logged-in user found. Please login again."
            );

            setLoading(false);

          }

          return;

        }


        /*
         * RLS will automatically return
         * only this user's manpower.
         */

        const {
          data,
          error:
            fetchError,
        } =
          await supabase
            .from("manpower")
            .select("*")
            .order(
              "created_at",
              {
                ascending: false,
              }
            );


        if (fetchError) {

          console.error(
            "Supabase manpower loading error:",
            fetchError
          );

          if (!cancelled) {

            setError(
              fetchError.message
            );

            setLoading(false);

          }

          return;

        }


        /*
         * Add database workers to
         * existing App state.
         */

        if (!cancelled) {

          (data || []).forEach(
            (worker) => {

              /*
               * Don't add the same worker
               * twice to App state.
               */

              if (
                !loadedIdsRef.current.has(
                  worker.id
                )
              ) {

                loadedIdsRef.current.add(
                  worker.id
                );

                onAddManpower(
                  mapWorkerFromSupabase(
                    worker
                  )
                );

              }

            }
          );

          setLoading(false);

        }

      };


    loadManpower();


    return () => {

      cancelled = true;

    };

  }, [onAddManpower]);


  /*
   * ---------------------------------------
   * OPEN ADD FORM
   * ---------------------------------------
   */

  const openAddForm = () => {

    setEditingPerson(null);

    setError("");

    setFormData({

      workerName: "",
      role: "",
      hourlyRate: "",
      status: "Active",

    });

    setShowForm(true);

  };


  /*
   * ---------------------------------------
   * OPEN EDIT FORM
   * ---------------------------------------
   */

  const openEditForm =
    (person) => {

      setEditingPerson(person);

      setError("");

      setFormData({

        workerName:
          person.workerName || "",

        role:
          person.role || "",

        hourlyRate:
          person.hourlyRate ?? "",

        status:
          person.status || "Active",

      });

      setShowForm(true);

    };


  /*
   * ---------------------------------------
   * CLOSE FORM
   * ---------------------------------------
   */

  const closeForm = () => {

    if (saving) {

      return;

    }

    setShowForm(false);

    setEditingPerson(null);

    setError("");

  };


  /*
   * ---------------------------------------
   * FORM CHANGE
   * ---------------------------------------
   */

  const handleChange =
    (e) => {

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
   * ---------------------------------------
   * SAVE WORKER
   * ---------------------------------------
   */

  const handleSubmit =
    async (e) => {

      e.preventDefault();


      if (
        !formData.workerName.trim() ||
        !formData.role.trim()
      ) {

        return;

      }


      setSaving(true);

      setError("");


      /*
       * Convert UI status to
       * database status.
       *
       * Database:
       * active
       * inactive
       */

      const databaseStatus =
        formData.status ===
        "Inactive"
          ? "inactive"
          : "active";


      /*
       * ===================================
       * EDIT EXISTING WORKER
       * ===================================
       */

      if (editingPerson) {

        const {
          data,
          error:
            updateError,
        } =
          await supabase
            .from("manpower")
            .update({

              /*
               * IMPORTANT:
               * Database column is `name`
               * NOT `worker_name`
               */

              name:
                formData.workerName.trim(),

              role:
                formData.role.trim(),

              hourly_rate:
                formData.hourlyRate === ""
                  ? 0
                  : Number(
                      formData.hourlyRate
                    ),

              status:
                databaseStatus,

            })
            .eq(
              "id",
              editingPerson.id
            )
            .select()
            .single();


        if (updateError) {

          console.error(
            "Supabase manpower update error:",
            updateError
          );

          setError(
            updateError.message
          );

          setSaving(false);

          return;

        }


        const updatedWorker =
          mapWorkerFromSupabase(
            data
          );


        onEditManpower(
          updatedWorker
        );

      }


      /*
       * ===================================
       * ADD NEW WORKER
       * ===================================
       */

      else {

        /*
         * Get logged-in Supabase user.
         */

        const {
          data: {
            user,
          },
          error:
            userError,
        } =
          await supabase.auth.getUser();


        if (userError) {

          console.error(
            "Supabase authentication error:",
            userError
          );

          setError(
            userError.message
          );

          setSaving(false);

          return;

        }


        if (!user) {

          setError(
            "No logged-in user found. Please login again."
          );

          setSaving(false);

          return;

        }


        /*
         * IMPORTANT:
         *
         * Your database requires:
         *
         * user_id NOT NULL
         *
         * So we MUST send user.id.
         */

        const workerToInsert = {

          user_id:
            user.id,

          /*
           * Database column is `name`
           */

          name:
            formData.workerName.trim(),

          role:
            formData.role.trim(),

          hourly_rate:
            formData.hourlyRate === ""
              ? 0
              : Number(
                  formData.hourlyRate
                ),

          status:
            databaseStatus,

        };


        const {
          data,
          error:
            insertError,
        } =
          await supabase
            .from("manpower")
            .insert(
              workerToInsert
            )
            .select()
            .single();


        if (insertError) {

          console.error(
            "Supabase manpower creation error:",
            insertError
          );

          setError(
            insertError.message
          );

          setSaving(false);

          return;

        }


        const newWorker =
          mapWorkerFromSupabase(
            data
          );


        /*
         * Remember this ID so it
         * isn't added twice.
         */

        loadedIdsRef.current.add(
          data.id
        );


        onAddManpower(
          newWorker
        );

      }


      /*
       * RESET FORM
       */

      setSaving(false);

      setShowForm(false);

      setEditingPerson(null);

      setFormData({

        workerName: "",
        role: "",
        hourlyRate: "",
        status: "Active",

      });

    };


  /*
   * ---------------------------------------
   * REMOVE WORKER
   * ---------------------------------------
   */

  const handleRemove =
    async (person) => {

      const confirmed =
        window.confirm(

          `Remove ${person.workerName} from the manpower list?\n\nIf this worker is assigned to any project, they will also be removed from those project assignments.`

        );


      if (!confirmed) {

        return;

      }


      setError("");


      const {
        error:
          deleteError,
      } =
        await supabase
          .from("manpower")
          .delete()
          .eq(
            "id",
            person.id
          );


      if (deleteError) {

        console.error(
          "Supabase manpower deletion error:",
          deleteError
        );

        setError(
          deleteError.message
        );

        return;

      }


      loadedIdsRef.current.delete(
        person.id
      );


      onRemoveManpower(
        person.id
      );

    };


  /*
   * ---------------------------------------
   * SUMMARY
   * ---------------------------------------
   */

  const activeManpower =
    manpower.filter(
      (person) =>
        person.status ===
        "Active"
    ).length;


  const inactiveManpower =
    manpower.filter(
      (person) =>
        person.status ===
        "Inactive"
    ).length;


  const totalHourlyRates =
    manpower
      .filter(
        (person) =>
          person.status ===
          "Active"
      )
      .reduce(
        (sum, person) =>
          sum +
          Number(
            person.hourlyRate ||
              0
          ),
        0
      );


  /*
   * ---------------------------------------
   * SEARCH
   * ---------------------------------------
   */

  const filteredManpower =
    manpower.filter(
      (person) => {

        const searchText =
          search
            .toLowerCase()
            .trim();


        return (

          person.workerName
            ?.toLowerCase()
            .includes(
              searchText
            ) ||

          person.role
            ?.toLowerCase()
            .includes(
              searchText
            )

        );

      }
    );


  /*
   * ---------------------------------------
   * UI
   * ---------------------------------------
   */

  return (

    <div className="manpower-page">


      {/* HEADER */}

      <div className="manpower-header">

        <div>

          <h2 className="manpower-title">
            Manpower
          </h2>

          <p className="manpower-subtitle">
            Manage your manpower records and hourly rates.
          </p>

        </div>


        <button
          className="manpower-primary-button"
          onClick={
            openAddForm
          }
        >

          <Plus size={18} />

          <span>
            Add Manpower
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

      <div className="manpower-summary">


        <div className="manpower-summary-card">

          <div className="manpower-summary-icon">

            <UsersRound size={19} />

          </div>

          <div>

            <div className="manpower-summary-label">
              Total Manpower
            </div>

            <div className="manpower-summary-value">
              {manpower.length}
            </div>

            <div className="manpower-summary-note">
              All manpower records
            </div>

          </div>

        </div>


        <div className="manpower-summary-card">

          <div className="manpower-summary-icon">

            <UserPlus size={19} />

          </div>

          <div>

            <div className="manpower-summary-label">
              Active
            </div>

            <div className="manpower-summary-value">
              {activeManpower}
            </div>

            <div className="manpower-summary-note">
              Currently available
            </div>

          </div>

        </div>


        <div className="manpower-summary-card">

          <div className="manpower-summary-icon">

            <Clock3 size={19} />

          </div>

          <div>

            <div className="manpower-summary-label">
              Inactive
            </div>

            <div className="manpower-summary-value">
              {inactiveManpower}
            </div>

            <div className="manpower-summary-note">
              Not currently available
            </div>

          </div>

        </div>


        <div className="manpower-summary-card">

          <div className="manpower-summary-icon">

            <IndianRupee size={19} />

          </div>

          <div>

            <div className="manpower-summary-label">
              Hourly Rates
            </div>

            <div className="manpower-summary-value">

              ₹
              {totalHourlyRates.toLocaleString(
                "en-IN"
              )}

            </div>

            <div className="manpower-summary-note">
              Active manpower total
            </div>

          </div>

        </div>

      </div>


      {/* RECORDS */}

      <div className="manpower-card">


        <div className="manpower-card-header">

          <div>

            <h3>
              Manpower Records
            </h3>

            <p>
              Workers available for project assignment
            </p>

          </div>


          <div className="manpower-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search manpower..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

        </div>


        {loading ? (

          <div className="manpower-empty">

            <div className="manpower-empty-icon">

              <UsersRound size={28} />

            </div>

            <h3>
              Loading manpower...
            </h3>

            <p>
              Connecting to your Supabase database.
            </p>

          </div>

        ) : manpower.length === 0 ? (

          <div className="manpower-empty">

            <div className="manpower-empty-icon">

              <UsersRound size={28} />

            </div>

            <h3>
              No manpower added
            </h3>

            <p>
              Add manpower here. Project assignment will be done from the Projects section.
            </p>

            <button
              className="manpower-secondary-button"
              onClick={
                openAddForm
              }
            >

              <Plus size={17} />

              Add Manpower

            </button>

          </div>

        ) : filteredManpower.length === 0 ? (

          <div className="manpower-empty">

            <div className="manpower-empty-icon">

              <Search size={26} />

            </div>

            <h3>
              No results found
            </h3>

            <p>
              Try searching with another worker or role.
            </p>

          </div>

        ) : (

          <div className="manpower-table-wrapper">

            <table className="manpower-table">

              <thead>

                <tr>

                  <th>
                    Worker
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Hourly Rate
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredManpower.map(
                  (person) => (

                    <tr
                      key={
                        person.id
                      }
                    >

                      <td>

                        <div className="manpower-worker-cell">

                          <div className="manpower-worker-icon">

                            <UsersRound size={16} />

                          </div>

                          <strong>
                            {
                              person.workerName
                            }
                          </strong>

                        </div>

                      </td>


                      <td>
                        {person.role}
                      </td>


                      <td>

                        <strong>

                          ₹
                          {Number(
                            person.hourlyRate ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </strong>

                        <span
                          style={{
                            marginLeft:
                              "4px",
                            color:
                              "#8b93a3",
                            fontSize:
                              "11px",
                          }}
                        >
                          /hr
                        </span>

                      </td>


                      <td>

                        <span
                          className={`manpower-status ${
                            person.status ===
                            "Inactive"
                              ? "inactive"
                              : "active"
                          }`}
                        >

                          {
                            person.status
                          }

                        </span>

                      </td>


                      <td>

                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "7px",
                            alignItems:
                              "center",
                          }}
                        >

                          <button
                            type="button"
                            title="Edit manpower"
                            onClick={() =>
                              openEditForm(
                                person
                              )
                            }
                            style={{
                              width:
                                "32px",
                              height:
                                "32px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              border:
                                "1px solid #e4e7ed",
                              borderRadius:
                                "8px",
                              background:
                                "#fff",
                              color:
                                "#596477",
                              cursor:
                                "pointer",
                            }}
                          >

                            <Pencil
                              size={15}
                            />

                          </button>


                          <button
                            type="button"
                            title="Remove manpower"
                            onClick={() =>
                              handleRemove(
                                person
                              )
                            }
                            style={{
                              width:
                                "32px",
                              height:
                                "32px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              border:
                                "1px solid #f0dede",
                              borderRadius:
                                "8px",
                              background:
                                "#fff",
                              color:
                                "#c15b5b",
                              cursor:
                                "pointer",
                            }}
                          >

                            <Trash2
                              size={15}
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ADD / EDIT MODAL */}

      {showForm && (

        <div
          className="manpower-modal-overlay"
          onClick={
            closeForm
          }
        >

          <div
            className="manpower-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="manpower-modal-header">

              <div>

                <h2>

                  {editingPerson
                    ? "Edit Manpower"
                    : "Add Manpower"}

                </h2>

                <p>

                  {editingPerson
                    ? "Update this worker's details."
                    : "Create a manpower record. Project assignment is handled from Projects."}

                </p>

              </div>


              <button
                className="manpower-modal-close"
                onClick={
                  closeForm
                }
                disabled={
                  saving
                }
              >

                <X size={19} />

              </button>

            </div>


            <form
              className="manpower-form"
              onSubmit={
                handleSubmit
              }
            >


              <div className="manpower-form-group">

                <label>
                  Worker Name *
                </label>

                <input
                  name="workerName"
                  value={
                    formData.workerName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Ramesh Kumar"
                  required
                />

              </div>


              <div className="manpower-form-group">

                <label>
                  Role *
                </label>

                <input
                  name="role"
                  value={
                    formData.role
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Carpenter"
                  required
                />

              </div>


              <div className="manpower-form-group">

                <label>
                  Hourly Rate
                </label>

                <div
                  style={{
                    position:
                      "relative",
                  }}
                >

                  <span
                    style={{
                      position:
                        "absolute",
                      left:
                        "12px",
                      top:
                        "50%",
                      transform:
                        "translateY(-50%)",
                      color:
                        "#7c8595",
                      fontSize:
                        "13px",
                      pointerEvents:
                        "none",
                    }}
                  >
                    ₹
                  </span>


                  <input
                    type="number"
                    name="hourlyRate"
                    value={
                      formData.hourlyRate
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 150"
                    min="0"
                    step="0.01"
                    style={{
                      paddingLeft:
                        "28px",
                    }}
                  />

                </div>


                <small
                  style={{
                    marginTop:
                      "5px",
                    color:
                      "#929aa8",
                    fontSize:
                      "10px",
                  }}
                >
                  Labour cost will be calculated using worked hours × hourly rate.
                </small>

              </div>


              <div className="manpower-form-group">

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

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                </select>

              </div>


              {error && (

                <div
                  style={{
                    padding:
                      "10px 12px",
                    borderRadius:
                      "7px",
                    background:
                      "#fff1f2",
                    color:
                      "#b42318",
                    border:
                      "1px solid #fecdd3",
                    fontSize:
                      "13px",
                  }}
                >

                  Supabase error: {error}

                </div>

              )}


              <div className="manpower-form-actions">

                <button
                  type="button"
                  className="manpower-cancel-button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="manpower-primary-button"
                  disabled={
                    saving
                  }
                >

                  {editingPerson ? (

                    <Pencil size={17} />

                  ) : (

                    <Plus size={17} />

                  )}


                  {saving
                    ? "Saving..."
                    : editingPerson
                    ? "Save Changes"
                    : "Add Manpower"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}


export default Manpower;