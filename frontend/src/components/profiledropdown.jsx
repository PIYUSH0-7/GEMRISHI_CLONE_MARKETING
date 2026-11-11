import { useState, useRef, useEffect, useCallback } from "react";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../features/api/authSlice";
import { useLogoutMutation } from "../features/api/apiSlice";

function ProfileDropdown({ user }) {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [logoutApi] = useLogoutMutation();

	const handleAccountClick = () => setOpen(!open);

	// Logout handler
	const handleLogout = useCallback(async () => {
		try {
			await logoutApi().unwrap(); // call backend logout
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			dispatch(logoutAction()); // clear Redux state
			localStorage.removeItem("userInfo"); // remove from localStorage
			navigate("/", { replace: true }); // redirect home
		}
	}, [dispatch, logoutApi, navigate]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative " ref={dropdownRef}>
			{/* Avatar */}
			<div
				className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-[#264A3F] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1e3a30] transition-colors"
				onClick={handleAccountClick}>
				{user?.profilePic ? (
					<img
						src={user.profilePic || "/placeholder.svg"}
						alt={`${user.name}'s profile`}
						className="w-9 h-9 rounded-full object-cover"
					/>
				) : (
					<AccountCircleOutlinedIcon className="w-9 h-9 text-white" />
				)}
			</div>

			{/* Dropdown menu */}
			{open && (
				<div className="absolute right-0 mt-2 w-40 bg-white shadow-lg  z-50">
					<button
						className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 cursor cursor-pointer"
						onClick={() => {
							navigate("/personal/profile");
							setOpen(false);
						}}>
						Profile
					</button>
					<button
						className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 cursor cursor-pointer"
						onClick={() => {
							handleLogout();
							setOpen(false);
						}}>
						Logout
					</button>
				</div>
			)}
		</div>
	);
}

export default ProfileDropdown;
