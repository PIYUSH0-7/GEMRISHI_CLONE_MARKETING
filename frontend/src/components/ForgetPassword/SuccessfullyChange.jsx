"use client"

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[#38AF51]"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

export default function SuccessfullyChange({ onClose, onLoginClick }) {
  const handleDone = () => {
    if (onLoginClick) {
      onLoginClick()
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <div
        className="bg-white rounded-[20px] shadow-2xl relative w-[547px] max-w-full overflow-hidden"
        style={{ minHeight: "471px" }}
      >
        <div className="flex flex-col items-center justify-between h-full p-12 pt-20 text-center">
          <div className="flex flex-col items-center w-full">
            <div className="w-[100px] h-[100px] rounded-full bg-[#E5F7E7] flex items-center justify-center mb-8">
              <CheckCircleIcon />
            </div>

            <h2 className="text-3xl font-serif font-bold text-[#264A3F] mb-2 leading-snug">
              Your password has been successfully reset!
            </h2>
            <p className="text-base text-gray-700">You can now log in with your new password</p>
          </div>

          <div className="w-full mt-12">
            <button
              onClick={handleDone}
              className="w-full bg-[#264A3F] text-white font-medium py-3 rounded-xl transition duration-150 ease-in-out shadow-md hover:bg-[#1e3a30]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
