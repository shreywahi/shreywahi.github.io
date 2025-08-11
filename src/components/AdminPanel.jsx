const AdminPanel = ({ 
  isAdmin,
  screenSize = 'desktop',
  loading,
  onClose
}) => {  
  if (!isAdmin) return null;
  if (screenSize === 'mobile' || screenSize === 'tablet') return null;

  return (
    <div className="fixed top-8 right-8 z-50 bg-slate-800 text-white p-4 rounded-lg shadow-lg max-w-md">
      {typeof onClose === 'function' && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Close Admin Panel"
        >
          ×
        </button>
      )}
      <h3 className="text-lg font-bold mb-2">Admin Panel</h3>
      <div className="mb-3 text-sm text-gray-300">
        Local content is in use. Editing features are enabled in each section for admins.
      </div>
      {loading && <div className="text-xs text-gray-400">Loading content...</div>}
    </div>
  );
};

export default AdminPanel;
