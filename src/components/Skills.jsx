import React, { useState, useEffect } from 'react';
import { Globe, Database, Code, Smartphone, Shield } from 'lucide-react';
import DragDrop from "./ui/DragDrop";

// Map string icon names to actual icon components
const iconMap = {
  Globe: Globe,
  Database: Database,
  Code: Code, 
  Smartphone: Smartphone,
  Shield: Shield
};

// Local color map for Skills component
const defaultColorMap = {
  "blue": "bg-blue-700 dark:bg-blue-900 border-blue-200 dark:border-blue-800 text-white dark:text-blue-200",
  "green": "bg-green-700 dark:bg-green-900 border-green-200 dark:border-green-800 text-white dark:text-green-200",
  "purple": "bg-purple-700 dark:bg-purple-900 border-purple-200 dark:border-purple-800 text-white dark:text-purple-200",
  "pink": "bg-pink-700 dark:bg-pink-900 border-pink-200 dark:border-pink-800 text-white dark:text-pink-200",
  "red": "bg-red-700 dark:bg-red-900 border-red-200 dark:border-red-800 text-white dark:text-red-200",
  "yellow": "bg-yellow-700 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800 text-white dark:text-yellow-200"
};

// Local function to get color classes
const getColorClasses = (color) => {
  return defaultColorMap[color] || defaultColorMap.blue || '';
};

const Skills = ({ isAdmin, categories, setCategories, updateContent }) => {
  const [editCategory, setEditCategory] = useState(null);
  const [editData, setEditData] = useState(null);

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
  const saveEdit = async (idx) => {
    if (!setCategories) return;
    const newCategories = [...categories];
    newCategories[idx] = editData;
    setCategories(newCategories);
    setEditCategory(null);
    setEditData(null);
    if (updateContent) {
      await updateContent('skillCategories', newCategories);
    }
  };

  return (
    <section id="skills" className="min-h-[100vh] py-16 flex items-center justify-center">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 text-center mb-16">
        <h2 className="text-4xl font-serif font-bold text-black dark:text-purple-500 mb-6">
          Skills
        </h2>
        <br />
        <p className="text-purple-600 dark:text-orange-400 text-lg max-w-3xl mx-auto">
          With a passion for creating efficient, elegant solutions, I've developed expertise across various technologies and domains.
        </p>
        <br />
        <br />
        {isAdmin ? (
          <DragDrop
            items={categories}
            onChange={async newOrder => {
              setCategories(newOrder);
              if (updateContent) {
                await updateContent('skillCategories', newOrder);
              }
            }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8"
            renderItem={(category, dragProps, idx, isDragged, isDropTarget) =>
              editCategory === idx ? (
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
                <div
                  key={idx}
                  {...dragProps}
                  className={`flex flex-col h-auto overflow-visible rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gray-100 dark:bg-gray-800 ${isDragged ? 'opacity-50' : ''} ${isDropTarget ? 'ring-4 ring-green-400' : ''}`}
                  style={{ cursor: 'grab' }}
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
                  </div>                <div className="flex-1 p-6">
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, i) => (
                        <span
                          key={i}
                          className={`inline-block text-sm px-3 py-1 rounded-full ${getColorClasses(
                            category.color
                          )}`}
                          style={{ 
                            color: '#ffffff',
                            backgroundColor: category.color === 'blue' ? '#1e40af' : 
                                           category.color === 'green' ? '#059669' :
                                           category.color === 'purple' ? '#7c3aed' :
                                           category.color === 'pink' ? '#db2777' :
                                           category.color === 'red' ? '#dc2626' : '#ca8a04'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {categories.map((category, idx) => (
              // Display card
              editCategory === idx ? (
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
                <div
                  key={idx}
                  className="flex flex-col h-auto overflow-visible rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gray-100 dark:bg-gray-800"
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
                  </div>                <div className="flex-1 p-6">
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, i) => (
                        <span
                          key={i}
                          className={`inline-block text-sm px-3 py-1 rounded-full ${getColorClasses(
                            category.color
                          )}`}
                          style={{ 
                            color: '#ffffff',
                            backgroundColor: category.color === 'blue' ? '#1e40af' : 
                                           category.color === 'green' ? '#059669' :
                                           category.color === 'purple' ? '#7c3aed' :
                                           category.color === 'pink' ? '#db2777' :
                                           category.color === 'red' ? '#dc2626' : '#ca8a04'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;