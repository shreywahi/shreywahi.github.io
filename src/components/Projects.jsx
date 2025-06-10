import { useState, useEffect } from "react";
import { Github, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import Modal from "./ui/Modal";
import DragDrop from "./ui/DragDrop";

const Projects = ({ onSectionChange, isAdmin, projectList, setProjectList }) => {
    // Editable project list
    const [selectedProject, setSelectedProject] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem('openProjectModalTitle');
            if (saved) {
                return projectList.find(project => project.title === saved) || null;
            }
        }
        return null;
    });
    const [searchQuery, setSearchQuery] = useState("");

    // Persist modal state to localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (selectedProject && selectedProject.title) {
            localStorage.setItem('openProjectModalTitle', selectedProject.title);
        } else {
            localStorage.removeItem('openProjectModalTitle');
        }
    }, [selectedProject]);

    // Restore modal state on mount
    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = localStorage.getItem('openProjectModalTitle');
        if (saved && !selectedProject) {
            const project = projectList.find(project => project.title === saved);
            if (project) setSelectedProject(project);
        }
    }, []);

    // When modal opens, notify parent to set section to "projects"
    useEffect(() => {
        if (selectedProject && onSectionChange) {
            onSectionChange("projects");
        }
    }, [selectedProject, onSectionChange]);

    // Filter projects by name (case-insensitive) for display only
    const filteredProjects = projectList.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Custom handler to update the order in the full list, not just filtered
    const handleDragDrop = (newFilteredOrder) => {
        if (!searchQuery) {
            // No filter: update the whole list
            setProjectList(newFilteredOrder);
        } else {
            // Filtered: update only the filtered items' order in the full list
            const filteredIds = filteredProjects.map(p => p.title);
            const newOrder = [];
            let filteredIdx = 0;
            for (let i = 0; i < projectList.length; i++) {
                if (filteredIds.includes(projectList[i].title)) {
                    newOrder.push(newFilteredOrder[filteredIdx]);
                    filteredIdx++;
                } else {
                    newOrder.push(projectList[i]);
                }
            }
            setProjectList(newOrder);
        }
    };

    // Admin editing state
    const [editIdx, setEditIdx] = useState(null);
    const [editData, setEditData] = useState(null);

    const startEdit = idx => {
        setEditIdx(idx);
        setEditData(JSON.parse(JSON.stringify(projectList[idx])));
    };
    const cancelEdit = () => {
        setEditIdx(null);
        setEditData(null);
    };
    const saveEdit = idx => {
        if (!setProjectList) return;
        const newList = projectList.slice();
        newList[idx] = editData;
        setProjectList(newList);
        setEditIdx(null);
        setEditData(null);
    };

    return (
        <section id="projects" className="min-h-[100vh] py-10 sm:py-16 bg-gradient-to-br from-blue-950 via-blue-300 to-blue-950 dark:from-gray-950 dark:via-gray-500 dark:to-gray-950 flex items-center justify-center pb-24 sm:pb-0">
            <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-serif font-bold text-green-950 dark:text-white mb-4 sm:mb-6">
                        Personal Projects
                    </h2>
                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search projects by name..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full max-w-md mx-auto px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black dark:text-white dark:bg-gray-800 dark:border-gray-700"
                        aria-label="Search projects"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                    {filteredProjects.map((project, idx) => {
                        const realIdx = projectList.findIndex(p => p.title === project.title);
                        return isAdmin && editIdx === realIdx ? (
                            <div key={project.title + idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-400">
                                <input
                                    value={editData.title}
                                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                                    className="w-full mb-2 p-2 rounded border"
                                />
                                <textarea
                                    value={editData.description}
                                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                                    className="w-full mb-2 p-2 rounded border"
                                />
                                <input
                                    value={editData.githubUrl}
                                    onChange={e => setEditData({ ...editData, githubUrl: e.target.value })}
                                    className="w-full mb-2 p-2 rounded border"
                                    placeholder="GitHub URL"
                                />
                                <input
                                    value={editData.demoUrl}
                                    onChange={e => setEditData({ ...editData, demoUrl: e.target.value })}
                                    className="w-full mb-2 p-2 rounded border"
                                    placeholder="Demo URL"
                                />
                                <input
                                    value={editData.imageUrl}
                                    onChange={e => setEditData({ ...editData, imageUrl: e.target.value })}
                                    className="w-full mb-2 p-2 rounded border"
                                    placeholder="Image URL"
                                />
                                <div>
                                    <label>Tags (comma separated):</label>
                                    <input
                                        value={editData.tags.join(', ')}
                                        onChange={e => setEditData({ ...editData, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                        className="w-full mb-2 p-2 rounded border"
                                    />
                                </div>
                                <button
                                    onClick={() => saveEdit(realIdx)}
                                    className="mr-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="px-4 py-2 rounded bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <Card
                                key={project.title + idx}
                                className={`overflow-hidden h-full flex flex-col border-2 border-red-500 dark:border-blue-900 transition-all duration-300 hover:shadow-2xl bg-orange-200 dark:bg-gray-800 cursor-pointer items-center text-center`}
                                style={{
                                    borderRadius: "1rem",
                                    transition: "transform 200ms cubic-bezier(.4,2,.6,1), box-shadow 200ms",
                                    zIndex: 1,
                                }}
                                onClick={() => setSelectedProject(project)}
                                role="button"
                                aria-label={`View details for ${project.title}`}
                                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setSelectedProject(project); }}
                            >
                                {project.imageUrl && (
                                    <div className="h-16 sm:h-48 overflow-hidden flex justify-center items-center w-full">
                                        <img
                                            src={project.imageUrl}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            aria-label={`${project.title} screenshot`}
                                        />
                                    </div>
                                )}
                                <CardHeader className="w-full flex flex-col items-center text-center">
                                    <CardTitle className="text-lg sm:text-xl font-mono items-center text-center">{project.title}</CardTitle>
                                </CardHeader>
                                {isAdmin && (
                                    <button
                                        className="mt-2 px-4 py-2 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
                                        onClick={e => { e.stopPropagation(); startEdit(realIdx); }}
                                    >
                                        Edit
                                    </button>
                                )}
                            </Card>
                        );
                    })}
                </div>

                <div className="text-center font-mono mt-8 sm:mt-12">
                    <Button variant="outline" size="lg" asChild aria-label="View more projects on GitHub">
                        <a
                        href="https://github.com/dodoshrey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                        >
                            <Github size={20} />
                            View More on GitHub
                        </a>
                    </Button>
                </div>
            </div>

            {/* Modal for Project Details */}
            <Modal open={!!selectedProject} onClose={() => { setSelectedProject(null); }} ariaLabel={selectedProject ? selectedProject.title : "Project Details"}>
                {selectedProject && (
                    <div className="rounded-xl p-0 sm:p-0">
                        <div className="flex flex-col sm:items-center sm:justify-between mb-2 gap-2">
                            <h2 className="text-2xl font-mono font-bold text-center sm:text-left mb-0">{selectedProject.title}</h2>
                            <div className="flex gap-2 justify-center sm:justify-end">
                                <Button className="bg-blue-700 dark:bg-blue-900 text-white dark:text-blue-200" variant="outline" size="sm" asChild aria-label="View on GitHub">
                                    <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        <Github size={16} />
                                        GitHub
                                    </a>
                                </Button>
                                {selectedProject.demoUrl && (
                                    <Button className="bg-blue-700 dark:bg-blue-900 text-white dark:text-blue-200" variant="outline" size="sm" asChild aria-label="View live demo">
                                        <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                            <ExternalLink size={16} />
                                            Open in Browser
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="font-mono flex flex-wrap gap-2 mb-4 justify-center">
                            {selectedProject.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="bg-blue-700 dark:bg-blue-900 text-white dark:text-blue-200 text-xs px-2 py-1 rounded-full"
                                    style={{ color: "#fff" }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <p className="font-mono mb-4 text-gray-800 dark:text-gray-200 text-center">{selectedProject.description}</p>

                        {/* Screenshots */}
                        {selectedProject.screenshots && (
                            <div className="mb-4 flex gap-4 overflow-x-auto justify-center">
                                {selectedProject.screenshots.map((src, i) => (
                                    <img key={i} src={src} alt={`Screenshot ${i + 1}`} className="h-120 rounded-lg border" aria-label={`Screenshot ${i + 1} of ${selectedProject.title}`} />
                                ))}
                            </div>
                        )}

                        {/* Embedded browser/iframe for live demo */}
                        {selectedProject.demoUrl && (
                            <div className="mt-4 flex justify-center">
                                <div
                                    className="bg-gray-200 dark:bg-gray-900 rounded-lg shadow-lg border border-gray-400 dark:border-gray-700 w-full"
                                    style={{ maxWidth: '100%', margin: "0 auto" }}
                                >
                                    {/* Fake browser bar */}
                                    <div className="flex items-center px-3 py-2 bg-gray-300 dark:bg-gray-800 rounded-t-lg border-b border-gray-400 dark:border-gray-700">
                                        <span className="flex gap-1 mr-3">
                                            <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                                            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
                                            <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
                                        </span>
                                        <span className="flex-1 text-xs truncate bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                                            {selectedProject.demoUrl}
                                        </span>
                                    </div>
                                    {/* Responsive desktop-like iframe */}
                                    <div
                                        style={{
                                            width: "100%",
                                            aspectRatio: "16/9",
                                            background: "black",
                                            position: "relative",
                                        }}
                                    >
                                        <iframe
                                            src={selectedProject.demoUrl}
                                            title="Live Demo"
                                            width="100%"
                                            height="100%"
                                            className="rounded-b-lg border-0"
                                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                border: 0,
                                                background: "white",
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </section>
    );
};

export default Projects;