import React, { useState } from 'react';
import { Globe, Database, Code, Smartphone, Shield } from 'lucide-react';
import { getColorClasses, getIconColor } from '../utils/contentLoader';

// Map string icon names to actual icon components
const iconMap = {
  Globe: Globe,
  Database: Database,
  Code: Code, 
  Smartphone: Smartphone,
  Shield: Shield
};

const Skills = ({ isAdmin, categories, setCategories }) => {
  const [showAll, setShowAll] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editData, setEditData] = useState(null);

  // Toggle show all skills
  const toggleShowAll = () => setShowAll(!showAll);

  // Start editing a category
  const startEdit = (idx) => {
    setEditCategory(idx);
    setEditData({ ...categories[idx] });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditCategory(null);
    setEditData(null);
  };

  // Save edited category
  const saveEdit = (idx) => {
    if (!setCategories) return;
    const newCategories = [...categories];
    newCategories[idx] = editData;
    setCategories(newCategories);
    setEditCategory(null);
    setEditData(null);
  };

  return (
    <section id="skills" className="min-h-[100vh] py-16 bg-blue-950 dark:bg-gray-950 flex items-center justify-center">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-green-400 dark:text-purple-500 mb-6">
            Skills & Expertise
          </h2>
          <p className="text-white text-lg max-w-3xl mx-auto">
            With a passion for creating efficient, elegant solutions, I've developed expertise across various technologies and domains.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {categories.map((category, idx) =>
            isAdmin && editCategory === idx ? (
              // Edit form for admin
              <div key={idx} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-pink-400">
                <input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full mb-4 p-2 border rounded"
                  placeholder="Category Title"
                />
                <div className="mb-4">
                  <label className="block mb-2">Icon:</label>
                  <select
                    value={editData.icon}
                    onChange={(e) => setEditData({ ...editData, icon: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="Globe">Globe</option>
                    <option value="Database">Database</option>
                    <option value="Code">Code</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Shield">Shield</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Color:</label>
                  <select
                    value={editData.color}
                    onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="pink">Pink</option>
                    <option value="red">Red</option>
                    <option value="yellow">Yellow</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Skills (comma separated):</label>
                  <textarea
                    value={editData.skills.join(", ")}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        skills: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    className="w-full p-2 border rounded"
                    rows="4"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveEdit(idx)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display card
              <div
                key={idx}
                className={`flex flex-col ${
                  showAll ? "h-auto" : "h-80"
                } overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gray-100 dark:bg-gray-800`}
              >
                <div
                  className={`flex items-center px-6 py-4 border-b ${getColorClasses(
                    category.color
                  )}`}
                >
                  {/* Use the mapped icon component */}
                  {React.createElement(iconMap[category.icon] || Globe, {
                    className: "w-6 h-6 mr-3",
                    style: { flexShrink: 0 }
                  })}
                  <h3 className="text-xl font-bold">{category.title}</h3>
                  {isAdmin && (
                    <button
                      onClick={() => startEdit(idx)}
                      className="ml-auto px-2 py-1 text-xs bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="flex-1 p-6 overflow-hidden">
                  <div
                    className={`flex flex-wrap gap-2 ${
                      !showAll ? "max-h-44 overflow-hidden" : ""
                    }`}
                  >
                    {category.skills.map((skill, i) => (
                      <span
                        key={i}
                        className={`inline-block text-sm px-3 py-1 rounded-full ${getColorClasses(
                          category.color
                        )}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {categories.length > 0 && (
          <div className="text-center mt-10">
            <button
              onClick={toggleShowAll}
              className="px-6 py-2 bg-transparent border-2 border-green-400 text-green-400 dark:border-purple-500 dark:text-purple-500 rounded-full hover:bg-green-400 hover:text-white dark:hover:bg-purple-500 dark:hover:text-white transition-colors duration-300"
            >
              {showAll ? "Show Less" : "Show All Skills"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;