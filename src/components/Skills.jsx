import { useState } from "react";
import { skillCategories, getColorClasses, getIconColor } from './content';
import DragDrop from "./ui/DragDrop";

const Skills = ({ isAdmin, categories = skillCategories, setCategories }) => {
  const [editIdx, setEditIdx] = useState(null);
  const [editData, setEditData] = useState(null);

  const startEdit = idx => {
    setEditIdx(idx);
    setEditData(JSON.parse(JSON.stringify(categories[idx])));
  };
  const cancelEdit = () => {
    setEditIdx(null);
    setEditData(null);
  };
  const saveEdit = idx => {
    if (!setCategories) return;
    const newList = categories.slice();
    const orig = skillCategories.find(cat => cat.title === editData.title) || skillCategories[idx];
    newList[idx] = { ...editData, icon: orig.icon };
    setCategories(newList);
    setEditIdx(null);
    setEditData(null);
  };

  const getIconByTitle = (title, fallbackIdx) => {
    const found = skillCategories.find(cat => cat.title === title);
    return found ? found.icon : skillCategories[fallbackIdx]?.icon;
  };

  return (
    <section id="skills" className="min-h-[100vh] py-10 sm:py-20 bg-blue-950 dark:bg-gray-950 flex items-center justify-center pb-24 sm:pb-0">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-serif font-bold text-orange-400 dark:text-purple-500 mb-4 sm:mb-6">
            Skills & Expertise
          </h2>
        </div>
        <br /><br />
        <div className="font-mono grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {categories.map((category, idx) =>
            isAdmin && editIdx === idx ? (
              <div key={category.title + idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-yellow-400">
                <input
                  value={editData.title}
                  onChange={e => setEditData({ ...editData, title: e.target.value })}
                  className="w-full mb-2 p-2 rounded border"
                  placeholder="Category Title"
                />
                <input
                  value={editData.color}
                  onChange={e => setEditData({ ...editData, color: e.target.value })}
                  className="w-full mb-2 p-2 rounded border"
                  placeholder="Color"
                />
                <div>
                  <label>Skills (comma separated):</label>
                  <input
                    value={editData.skills.join(', ')}
                    onChange={e => setEditData({ ...editData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full mb-2 p-2 rounded border"
                  />
                </div>
                <button onClick={() => saveEdit(idx)} className="mr-2">Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <div
                key={category.title + idx}
                className={`bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${getColorClasses(category.color)}`}
                style={{ borderRadius: "1rem" }}
              >
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className={`p-0 sm:p-3 rounded-lg ${category.color === 'blue' ? 'bg-blue-200 dark:bg-blue-900' : category.color === 'green' ? 'bg-green-200 dark:bg-green-900' : category.color === 'purple' ? 'bg-purple-200 dark:bg-purple-900' : category.color === 'pink' ? 'bg-pink-200 dark:bg-pink-900' : category.color === 'red' ? 'bg-red-200 dark:bg-red-900' : 'bg-yellow-200 dark:bg-yellow-900'}`}>
                    {(() => {
                      const Icon = getIconByTitle(category.title, idx);
                      return Icon ? <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${getIconColor(category.color)}`} /> : null;
                    })()}
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white ml-3 sm:ml-4">{category.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, i) => (
                    <span
                      key={i}
                      className={`px-1 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getColorClasses(category.color)}`}
                      style={{ color: "#fff" }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {isAdmin && setCategories && (
                  <button
                    className="mt-2 px-2 py-1 bg-gray-300 rounded"
                    onClick={() => startEdit(idx)}
                  >
                    Edit
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Skills;