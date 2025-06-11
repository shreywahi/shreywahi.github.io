import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "./ui/card";
import Modal from "./ui/Modal";
import { certs as certsData } from '../utils/contentLoader';

const scrollToTop = () => {
    const element = document.getElementById('hero');
    element?.scrollIntoView({ behavior: 'smooth' });
};

const Certificates = ({ onSectionChange, isAdmin, certList, setCertList }) => {
    const [selectedCert, setselectedCert] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem('openCertModalTitle');
            if (saved) {
                // Find the cert by title
                return certsData.find(cert => cert.title === saved) || null;
            }
        }
        return null;
    });
    const [certs, setCerts] = useState(certsData);
    const [editIdx, setEditIdx] = useState(null);
    const [editData, setEditData] = useState(null);

    // Persist modal state to localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (selectedCert && selectedCert.title) {
            localStorage.setItem('openCertModalTitle', selectedCert.title);
        } else {
            localStorage.removeItem('openCertModalTitle');
        }
    }, [selectedCert]);

    // Restore modal state on mount
    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = localStorage.getItem('openCertModalTitle');
        if (saved && !selectedCert) {
            const cert = certsData.find(cert => cert.title === saved);
            if (cert) setselectedCert(cert);
        }
    }, []);

    // When modal opens, notify parent to set section to "certs"
    useEffect(() => {
        if (selectedCert && onSectionChange) {
            onSectionChange("certs");
        }
    }, [selectedCert, onSectionChange]);

    const startEdit = idx => {
        setEditIdx(idx);
        setEditData(JSON.parse(JSON.stringify(certList[idx])));
    };
    const cancelEdit = () => {
        setEditIdx(null);
        setEditData(null);
    };
    const saveEdit = idx => {
        if (!setCertList) return;
        const newList = certList.slice();
        newList[idx] = editData;
        setCertList(newList);
        setEditIdx(null);
        setEditData(null);
    };

    return (
        <section id="certs" className="min-h-[100vh] py-10 sm:py-16 bg-blue-950 dark:bg-gray-950 flex items-center justify-center pb-24 sm:pb-0">
            <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8">
                <div className="text-center mb-8 sm:mb-16">
                    <h2 className="text-4xl font-serif font-bold text-orange-400 dark:text-purple-500 mb-4 sm:mb-6">
                        Certificates & Proficiency
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                    {certList.map((cert, idx) =>
                        isAdmin && editIdx === idx ? (
                            <div key={cert.title + idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-pink-400">
                                <input
                                    value={editData.title}
                                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                                    className="w-full mb-2 p-2 rounded border"
                                    placeholder="Certificate Title"
                                    style={{ background: "#f9fafb", color: "#222", border: "1px solid #cbd5e1" }}
                                />
                                <div>
                                    <label>Tags (comma separated):</label>
                                    <input
                                        value={editData.tags.join(', ')}
                                        onChange={e => setEditData({ ...editData, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                        className="w-full mb-2 p-2 rounded border"
                                        style={{ background: "#f9fafb", color: "#222", border: "1px solid #cbd5e1" }}
                                    />
                                </div>
                                <input
                                    value={editData.imageUrl}
                                    onChange={e => setEditData({ ...editData, imageUrl: e.target.value })}
                                    className="w-full mb-2 p-2 rounded border"
                                    placeholder="Image URL"
                                    style={{ background: "#f9fafb", color: "#222", border: "1px solid #cbd5e1" }}
                                />
                                <div>
                                    <label>Screenshots (JSON array):</label>
                                    <input
                                        value={JSON.stringify(editData.screenshots || [])}
                                        onChange={e => {
                                            try {
                                                setEditData({ ...editData, screenshots: JSON.parse(e.target.value) });
                                            } catch {}
                                        }}
                                        className="w-full mb-2 p-2 rounded border"
                                        style={{ background: "#f9fafb", color: "#222", border: "1px solid #cbd5e1" }}
                                    />
                                </div>
                                <button
                                    onClick={() => saveEdit(idx)}
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
                                key={cert.title + idx}
                                className={`overflow-hidden h-full flex flex-col border-2 border-red-500 dark:border-blue-900 transition-all duration-300 hover:shadow-2xl bg-orange-200 dark:bg-gray-800 cursor-pointer items-center text-center`}
                                style={{
                                    borderRadius: "1rem",
                                    transition: "transform 200ms cubic-bezier(.4,2,.6,1), box-shadow 200ms",
                                    zIndex: 1,
                                }}
                                onClick={() => setselectedCert(cert)}
                                role="button"
                                tabIndex={0}
                                aria-label={`View details for ${cert.title}`}
                                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setselectedCert(cert); }}
                            >
                                {cert.imageUrl && (
                                    <div className="h-16 sm:h-48 overflow-hidden flex justify-center items-center w-full">
                                        <img
                                            src={cert.imageUrl}
                                            alt={cert.title}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            aria-label={`${cert.title} screenshot`}
                                        />
                                    </div>
                                )}
                                <CardHeader className="w-full flex flex-col items-center text-center">
                                    <CardTitle className="text-lg sm:text-xl font-mono items-center text-center">{cert.title}</CardTitle>
                                </CardHeader>
                                {isAdmin && (
                                    <button
                                        className="mt-2 px-4 py-2 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
                                        onClick={e => { e.stopPropagation(); startEdit(idx); }}
                                    >
                                        Edit
                                    </button>
                                )}
                            </Card>
                        )
                    )}
                </div>

                {/* Proficiency Highlights */}
                <div className="font-mono mt-8 sm:mt-16 text-center">
                    <h3 className="text-lg sm:text-2xl font-bold text-orange-400 dark:text-purple-500 mb-4 sm:mb-8">Proficiency Highlights</h3>
                    <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
                        <div className="bg-gradient-to-br from-blue-700 to-blue-900 dark:from-blue-900 dark:to-blue-800 p-4 sm:p-6 rounded-xl text-white">
                            <div className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">3+</div>
                            <div className="text-gray-100 text-xs sm:text-base">Years of Professional Experience</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-700 to-green-900 dark:from-green-900 dark:to-green-800 p-4 sm:p-6 rounded-xl text-white">
                            <div className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">20+</div>
                            <div className="text-gray-100 text-xs sm:text-base">Technologies Mastered</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-700 to-purple-900 dark:from-purple-900 dark:to-purple-800 p-4 sm:p-6 rounded-xl text-white">
                            <div className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">10+</div>
                            <div className="text-gray-100 text-xs sm:text-base">Projects Delivered</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Project Details */}
            <Modal open={!!selectedCert} onClose={() => setselectedCert(null)} ariaLabel={selectedCert ? selectedCert.title : "Project Details"}>
                {selectedCert && (
                    <div className="rounded-xl p-0 sm:p-0">
                        <h2 className="text-2xl font-mono font-bold mb-2 text-center">{selectedCert.title}</h2>
                        <div className="font-mono flex flex-wrap gap-2 mb-4 justify-center">
                            {selectedCert.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="bg-blue-700 dark:bg-blue-900 text-white dark:text-blue-200 text-xs px-2 py-1 rounded-full"
                                    style={{ color: "#fff" }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <p className="font-mono mb-4 text-gray-800 dark:text-gray-200 text-center">{selectedCert.description}</p>
                        {/* Screenshots */}
                        {selectedCert.screenshots && (
                            <div className="mb-4 flex gap-4 overflow-x-auto justify-center">
                                {selectedCert.screenshots.map((src, i) => (
                                    <img key={i} src={src} alt={`Screenshot ${i + 1}`} className="h-120 rounded-lg border" aria-label={`Screenshot ${i + 1} of ${selectedCert.title}`} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </section>
    );
};

export default Certificates;