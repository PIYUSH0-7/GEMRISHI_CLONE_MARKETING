import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useGetOrderStatsQuery } from "../features/api/apiSlice";

const COLORS = ["#00C49F", "#FF8042"]; // first = Online, second = COD

const PaymentMethodPieChart = () => {
  const [data, setData] = useState([]);

  const { data: orderStats } = useGetOrderStatsQuery();

  const chartData =
    orderStats?.paymentStats?.map((p) => {
      let displayName = p._id;
      if (p._id === "razorpay") displayName = "Online";
      if (p._id === "cod") displayName = "COD";

      return {
        name: displayName,
        value: p.count, // or p.revenue if you prefer revenue distribution
      };
    }) || [];

  return (
  <div className="flex flex-col justify-center items-center">
  <h2 className="text-xl mt-6">Sales Distribution</h2>

  <PieChart width={400} height={400}>
    <Pie
      data={chartData}
      cx="50%"
      cy="50%"
      labelLine={false}
      outerRadius={150}
      dataKey="value"
    >
      {chartData.map((_, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</div>

  );
};

export default PaymentMethodPieChart;
