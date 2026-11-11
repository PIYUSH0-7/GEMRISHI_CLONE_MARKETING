function IsActiveSwitch({ isActive, setFormData }) {
  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  return (
    <div className="flex items-center space-x-3">
      <label className="text-sm font-medium text-gray-700">Active</label>
      <button
        type="button"
        onClick={handleToggle}
        className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${
          isActive ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
            isActive ? "translate-x-6" : "translate-x-0"
          }`}
        ></div>
      </button>
    </div>
  );
}

export default IsActiveSwitch