import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  ClipboardList,
  Clock3,
  IndianRupee,
  CalendarDays,
  X,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";

function WorkDone({
  projects = [],
  manpower = [],
  workEntries = [],
  onAddWorkEntry,
  onUpdateWorkEntry,
  onDeleteWorkEntry,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    projectId: "",
    manpowerId: "",
    hours: "",
    advance: "",
    status: "Present",
    remarks: "",
  });

  const selectedWorker = availableManpower.find(
    (person) => person.id === Number(formData.manpowerId)
  );

  const assignedWorkers = useMemo(() => {
    if (!formData.projectId) return manpower;

    const project = projects.find(
      (item) => item.id === Number(formData.projectId)
    );

    if (!project) return manpower;

    const assignedIds = project.assignedManpowerIds || [];

    return manpower.filter((person) =>
      assignedIds.includes(person.id)
    );
  }, [formData.projectId, projects, manpower]);

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      projectId: "",
      manpowerId: "",
      hours: "",
      advance: "",
      status: "Present",
      remarks: "",
    });

    setEditingEntry(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (entry) => {
    setEditingEntry(entry);

    setFormData({
      date: entry.date || "",
      projectId: String(entry.projectId || ""),
      manpowerId: String(entry.manpowerId || ""),
      hours: entry.hours || "",
      advance: entry.advance || "",
      status: entry.status || "Present",
      remarks: entry.remarks || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "projectId") {
      setFormData((prev) => ({
        ...prev,
        projectId: value,
        manpowerId: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.date ||
      !formData.projectId ||
      !formData.manpowerId
    ) {
      return;
    }

    const worker = availableManpower.find(
      (person) => person.id === Number(formData.manpowerId)
    );

    if (!worker) return;

    const hourlyRate = Number(worker.hourlyRate || 0);
    const hours = Number(formData.hours || 0);
    const advance = Number(formData.advance || 0);

    const entry = {
      id: editingEntry?.id || Date.now(),
      date: formData.date,
      projectId: Number(formData.projectId),
      manpowerId: Number(formData.manpowerId),
      workerName: worker.workerName,
      role: worker.role,
      hourlyRate,
      hours,
      wages: hourlyRate * hours,
      advance,
      netPayable: hourlyRate * hours - advance,
      status: formData.status,
      remarks: formData.remarks,
    };

    if (editingEntry) {
      onUpdateWorkEntry(entry);
    } else {
      onAddWorkEntry(entry);
    }

    closeForm();
  };

  const getProjectName = (projectId) => {
    const project = projects.find(
      (item) => item.id === Number(projectId)
    );

    return project?.name || "Unknown Project";
  };

  const filteredEntries = workEntries.filter((entry) => {
    const text = search.toLowerCase();

    return (
      entry.workerName?.toLowerCase().includes(text) ||
      getProjectName(entry.projectId)
        .toLowerCase()
        .includes(text) ||
      entry.role?.toLowerCase().includes(text) ||
      entry.date?.includes(text)
    );
  });

  const totalHours = workEntries.reduce(
    (sum, entry) => sum + Number(entry.hours || 0),
    0
  );

  const totalWages = workEntries.reduce(
    (sum, entry) => sum + Number(entry.wages || 0),
    0
  );

  const totalAdvance = workEntries.reduce(
    (sum, entry) => sum + Number(entry.advance || 0),
    0
  );

  const totalPayable = workEntries.reduce(
    (sum, entry) => sum + Number(entry.netPayable || 0),
    0
  );

  return (
    <div className="workdone-page">

      {/* HEADER */}

      <div className="workdone-header">

        <div>
          <h2 className="workdone-title">
            Daily Work Entry
          </h2>

          <p className="workdone-subtitle">
            Record daily hours, wages and advances for project manpower.
          </p>
        </div>

        <button
          className="workdone-primary-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Work Entry
        </button>

      </div>


      {/* SUMMARY */}

      <div className="workdone-summary">

        <div className="workdone-summary-card">
          <div className="workdone-summary-icon">
            <ClipboardList size={19} />
          </div>

          <div>
            <span>Total Entries</span>
            <strong>{workEntries.length}</strong>
          </div>
        </div>


        <div className="workdone-summary-card">
          <div className="workdone-summary-icon">
            <Clock3 size={19} />
          </div>

          <div>
            <span>Total Hours</span>
            <strong>{totalHours.toFixed(2)}</strong>
          </div>
        </div>


        <div className="workdone-summary-card">
          <div className="workdone-summary-icon">
            <IndianRupee size={19} />
          </div>

          <div>
            <span>Total Wages</span>
            <strong>
              ₹{totalWages.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>


        <div className="workdone-summary-card">
          <div className="workdone-summary-icon">
            <IndianRupee size={19} />
          </div>

          <div>
            <span>Advance</span>
            <strong>
              ₹{totalAdvance.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>


        <div className="workdone-summary-card">
          <div className="workdone-summary-icon">
            <IndianRupee size={19} />
          </div>

          <div>
            <span>Net Payable</span>
            <strong>
              ₹{totalPayable.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

      </div>


      {/* RECORDS */}

      <div className="workdone-card">

        <div className="workdone-card-header">

          <div>
            <h3>Daily Records</h3>
            <p>
              All manpower work entries
            </p>
          </div>

          <div className="workdone-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search worker, project..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

        </div>


        {filteredEntries.length === 0 ? (

          <div className="workdone-empty">

            <div className="workdone-empty-icon">
              <ClipboardList size={28} />
            </div>

            <h3>
              No work entries yet
            </h3>

            <p>
              Add the first daily work entry to start tracking hours and wages.
            </p>

            <button
              className="workdone-secondary-button"
              onClick={openAddForm}
            >
              <Plus size={17} />
              Add Work Entry
            </button>

          </div>

        ) : (

          <div className="workdone-table-wrapper">

            <table className="workdone-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Worker</th>
                  <th>Project</th>
                  <th>Hours</th>
                  <th>Rate / Hr</th>
                  <th>Wages</th>
                  <th>Advance</th>
                  <th>Net Payable</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {filteredEntries.map((entry) => (

                  <tr key={entry.id}>

                    <td>
                      <div className="workdone-date">
                        <CalendarDays size={14} />
                        {entry.date}
                      </div>
                    </td>

                    <td>
                      <div className="workdone-worker">
                        <strong>
                          {entry.workerName}
                        </strong>

                        <span>
                          {entry.role}
                        </span>
                      </div>
                    </td>

                    <td>
                      {getProjectName(entry.projectId)}
                    </td>

                    <td>
                      {Number(entry.hours || 0).toFixed(2)}
                    </td>

                    <td>
                      ₹{Number(
                        entry.hourlyRate || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      ₹{Number(
                        entry.wages || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      ₹{Number(
                        entry.advance || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <strong>
                        ₹{Number(
                          entry.netPayable || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`workdone-status ${
                          entry.status
                            ?.toLowerCase()
                            .replace(" ", "-")
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>

                    <td>

                      <div className="workdone-actions">

                        <button
                          title="Edit"
                          onClick={() =>
                            openEditForm(entry)
                          }
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          title="Delete"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Delete this work entry?"
                              )
                            ) {
                              onDeleteWorkEntry(
                                entry.id
                              );
                            }
                          }}
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* FORM MODAL */}

      {showForm && (

        <div
          className="workdone-modal-overlay"
          onClick={closeForm}
        >

          <div
            className="workdone-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="workdone-modal-header">

              <div>
                <h2>
                  {editingEntry
                    ? "Edit Work Entry"
                    : "Add Daily Work Entry"}
                </h2>

                <p>
                  Enter the worker's daily working details.
                </p>
              </div>

              <button
                className="workdone-modal-close"
                onClick={closeForm}
              >
                <X size={19} />
              </button>

            </div>


            <form
              className="workdone-form"
              onSubmit={handleSubmit}
            >

              {/* DATE */}

              <div className="workdone-form-group">

                <label>
                  Date *
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* PROJECT */}

              <div className="workdone-form-group">

                <label>
                  Project *
                </label>

                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Project
                  </option>

                  {projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                    >
                      {project.name}
                    </option>
                  ))}

                </select>

              </div>


              {/* WORKER */}

              <div className="workdone-form-group">

                <label>
                  Worker *
                </label>

                <select
                  name="manpowerId"
                  value={formData.manpowerId}
                  onChange={handleChange}
                  required
                  disabled={!formData.projectId}
                >

                  <option value="">
                    {formData.projectId
                      ? "Select Worker"
                      : "Select project first"}
                  </option>

                  {assignedWorkers.map((person) => (
                    <option
                      key={person.id}
                      value={person.id}
                    >
                      {person.workerName} — {person.role}
                    </option>
                  ))}

                </select>

              </div>


              {/* RATE */}

              {selectedWorker && (

                <div className="workdone-rate-info">

                  <span>
                    Hourly Rate
                  </span>

                  <strong>
                    ₹{Number(
                      selectedWorker.hourlyRate || 0
                    ).toLocaleString("en-IN")} / hour
                  </strong>

                </div>

              )}


              {/* HOURS + ADVANCE */}

              <div className="workdone-form-row">

                <div className="workdone-form-group">

                  <label>
                    Worked Hours *
                  </label>

                  <input
                    type="number"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    placeholder="e.g. 8"
                    min="0"
                    step="0.5"
                    required
                  />

                </div>


                <div className="workdone-form-group">

                  <label>
                    Advance Taken
                  </label>

                  <input
                    type="number"
                    name="advance"
                    value={formData.advance}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    min="0"
                    step="1"
                  />

                </div>

              </div>


              {/* LIVE CALCULATION */}

              {selectedWorker && (

                <div className="workdone-calculation">

                  <div>
                    <span>
                      Wages
                    </span>

                    <strong>
                      ₹{(
                        Number(
                          selectedWorker.hourlyRate || 0
                        ) *
                        Number(
                          formData.hours || 0
                        )
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Advance
                    </span>

                    <strong>
                      ₹{Number(
                        formData.advance || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Net Payable
                    </span>

                    <strong>
                      ₹{(
                        Number(
                          selectedWorker.hourlyRate || 0
                        ) *
                        Number(
                          formData.hours || 0
                        ) -
                        Number(
                          formData.advance || 0
                        )
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                </div>

              )}


              {/* STATUS */}

              <div className="workdone-form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >

                  <option value="Present">
                    Present
                  </option>

                  <option value="Half Day">
                    Half Day
                  </option>

                  <option value="Absent">
                    Absent
                  </option>

                </select>

              </div>


              {/* REMARKS */}

              <div className="workdone-form-group">

                <label>
                  Remarks
                </label>

                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Optional notes..."
                  rows="3"
                />

              </div>


              {/* ACTIONS */}

              <div className="workdone-form-actions">

                <button
                  type="button"
                  className="workdone-cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="workdone-save-button"
                >
                  <Check size={17} />

                  {editingEntry
                    ? "Update Entry"
                    : "Save Entry"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default WorkDone;