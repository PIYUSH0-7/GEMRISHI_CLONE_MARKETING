import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import {
	useGetCategoryQuery,
	useChangeCategoryOrderMutation,
} from "../../features/api/apiSlice";
import { toast } from "react-toastify";
import CategorySkeleton from "../../skeletons/CategorySkeleton";

function CategoryOrderPage() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const navigate = useNavigate();

	const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoryQuery();
	const [changeCategoryOrder, { isLoading: isUpdating }] = useChangeCategoryOrderMutation();

	const [items, setItems] = useState([]);

	useEffect(() => {
		if (categoriesData?.categories) {
			// Sort by order if available, otherwise default order
			const sorted = [...categoriesData.categories].sort((a, b) => (a.order || 0) - (b.order || 0));
			setItems(sorted);
		}
	}, [categoriesData]);

	const handleSave = async () => {
		const orderedIds = items.map((item) => item._id);
		try {
			await changeCategoryOrder({ orderedIds }).unwrap();
			toast.success("Category order updated successfully");
			navigate("/category");
		} catch (error) {
			toast.error(
				error?.data?.msg ||
				error?.data?.message ||
				error?.error ||
				"Something went wrong"
			);
		}
	};

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	const closeSidebar = () => {
		setIsSidebarOpen(false);
	};

	return (
		<div className="w-full flex flex-row min-h-screen bg-gray-100">
			<div className="hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200">
				<Navbar
					isSidebarOpen={true}
					toggleSidebar={toggleSidebar}
					closeSidebar={closeSidebar}
				/>
			</div>

			<AnimatePresence>
				{isSidebarOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
						onClick={closeSidebar}
					></motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{isSidebarOpen && (
					<motion.div
						initial={{ x: "-100%" }}
						animate={{ x: 0 }}
						exit={{ x: "-100%" }}
						transition={{ type: "tween", duration: 0.3 }}
						className="fixed inset-y-0 left-0 z-50 w-[230px] bg-white border-r border-gray-200 lg:hidden"
					>
						<Navbar
							isSidebarOpen={isSidebarOpen}
							toggleSidebar={toggleSidebar}
							closeSidebar={closeSidebar}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col relative z-10">
				<div className="w-full sticky top-0 z-20">
					<UpperBar toggleSidebar={toggleSidebar} />
				</div>

				<div className="p-6">

					{/* Breadcrumb */}
					<div className="mb-4">
						<span
						className="text-gray-500 text-sm cursor-pointer"
						onClick={() => navigate("/")}
						>
						Dashboard
						</span>
						<span className="text-gray-400 mx-2">{">"}</span>
						<span
						className="text-gray-500 text-sm cursor-pointer"
						onClick={() => navigate("/category")}
						>
						Gemstone Categories
						</span>
						<span className="text-gray-400 mx-2">{">"}</span>
						<span className="text-gray-700 text-sm font-medium">
						Categories Order
						</span>
					</div>

					<div className="bg-white w-full h-auto rounded-lg p-8">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-semibold">
								Reorder Categories
							</h2>
							<div className="flex gap-4">
								<Button
									className="cursor-pointer bg-gray-500 text-white"
									onClick={() => navigate("/category")}
								>
									Cancel
								</Button>
								<Button
									className="cursor-pointer bg-[#264A3F] text-white"
									onClick={handleSave}
									disabled={isUpdating}
								>
									{isUpdating ? "Saving..." : "Save Order"}
								</Button>
							</div>
						</div>

						{categoriesLoading ? (
							<CategorySkeleton />
						) : (
							<Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
								{items.map((item) => (
									<Reorder.Item key={item._id} value={item} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div className="p-2 bg-gray-100 rounded">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
											</div>
											<span className="font-medium text-gray-700">{item.name}</span>
										</div>
									</Reorder.Item>
								))}
							</Reorder.Group>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default CategoryOrderPage;
