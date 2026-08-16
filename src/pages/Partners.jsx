import React, { useState } from "react";
import {
  Plus,
  Search,
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

function Projects() {
  const [projects, setProjects] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    client: "",
    location: "",
    startDate: "",
    value: "",
    status: "Active",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProject = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.client.trim()) {
      return;
    }

    const newProject = {
      id: Date.now(),
      ...formData,
    };

    setProjects((prev) => [newProject, ...prev]);

    setFormData({
      name: "",
      client: "",
      location: "",
      startDate: "",
      value: "",
      status: "Active",
    });

    setShowForm(false);
  };

  const handleDelete = (id) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  };

  const filteredProjects = projects.filter((project) => {
    const search = searchTerm.toLowerCase();

    return (
      project.name.toLowerCase().includes(search) ||
      project.client.toLowerCase().includes(search) ||
      project.location.toLowerCase().includes(search)
    );
  });

  return (
    <div className="projects-page">

      {/* PROJECTS TOOLBAR */}
      <div className="projects-toolbar">

        <div className="projects-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={17} />
          <span>Add Project</span>
        </button>

      </div>


      {/* PROJECTS TABLE CARD */}
      <div className="projects-card">

        <div className="projects-card-header">

          <div>
            <h2>All Projects</h2>

            <p>
              Manage your manpower projects and project details.
            </p>
          </div>

          <div className="projects-count">
            {projects.length}{" "}
            {projects.length === 1 ? "Project" : "Projects"}
          </div>

        </div>


        {/* EMPTY STATE */}
        {filteredProjects.length === 0 ? (

          <div className="projects-empty">

            <div className="projects-empty-icon">
              <BriefcaseBusiness size={24} />
            </div>

            <h3>
              {projects.length === 0
                ? "No projects yet"
                : "No projects found"}
            </h3>

            <p>
              {projects.length === 0
                ? "Create your first project to start tracking manpower, work and expenses."
                : "Try changing your search."}
            </p>

            {projects.length === 0 && (
              <button
                className="primary-button"
                onClick={() => setShowForm(true)}
              >
                <Plus size={17} />
                Add First Project
              </button>
            )}

          </div>

        ) : (

          <div className="projects-table-wrapper">

            <table className="projects-table">

              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Location</th>
                  <th>Start Date</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {filteredProjects.map((project) => (

                  <tr key={project.id}>

                    <td>
                      <div className="project-name-cell">
                        <div className="project-icon">
                          <BriefcaseBusiness size={17} />
                        </div>

                        <div>
                          <strong>{project.name}</strong>
                          <span>Project ID: {project.id}</span>
                        </div>
                      </div>
                    </td>


                    <td>
                      <span className="table-main-text">
                        {project.client}
                      </span>
                    </td>


                    <td>
                      <div className="location-cell">
                        <MapPin size={14} />
                        <span>
                          {project.location || "—"}
                        </span>
                      </div>
                    </td>


                    <td>
                      <div className="date-cell">
                        <CalendarDays size={14} />
                        <span>
                          {project.startDate || "—"}
                        </span>
                      </div>
                    </td>


                    <td>
                      <span className="table-main-text">
                        {project.value
                          ? `₹${Number(project.value).toLocaleString("en-IN")}`
                          : "—"}
                      </span>
                    </td>


                    <td>
                      <span
                        className={`status-badge ${
                          project.status.toLowerCase()
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>


                    <td>

                      <div className="project-actions">

                        <button
                          className="icon-action-button"
                          title="Edit project"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          className="icon-action-button danger"
                          title="Delete project"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 size={15} />
                        </button>

                        <button
                          className="icon-action-button"
                          title="More options"
                        >
                          <MoreHorizontal size={16} />
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


      {/* ADD PROJECT MODAL */}

      {showForm && (

        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
            }
          }}
        >

          <div className="project-modal">

            <div className="project-modal-header">

              <div>
                <h2>Add New Project</h2>

                <p>
                  Enter the basic details of the project.
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>

            </div>


            <form
              className="project-form"
              onSubmit={handleAddProject}
            >

              <div className="form-grid">

                <div className="form-field full-width">
                  <label>
                    Project Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Moody's Cafeteria Modification"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>


                <div className="form-field">
                  <label>
                    Client <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="client"
                    placeholder="e.g. Moody's"
                    value={formData.client}
                    onChange={handleChange}
                    required
                  />
                </div>


                <div className="form-field">
                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Gurgaon"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>


                <div className="form-field">
                  <label>
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>


                <div className="form-field">
                  <label>
                    Project Value
                  </label>

                  <input
                    type="number"
                    name="value"
                    placeholder="₹ Project value"
                    value={formData.value}
                    onChange={handleChange}
                    min="0"
                  />
                </div>


                <div className="form-field">
                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Planning">
                      Planning
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="On Hold">
                      On Hold
                    </option>
                  </select>
                </div>

              </div>


              <div className="project-form-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Plus size={17} />
                  Create Project
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