import { fetchDashboardData } from './services/sheetService';

async function test() {
  const data = await fetchDashboardData();
  console.log("Total Sales:", data.totalSales);
  console.log("Daily Target:", data.dailyTarget);
  console.log("Progress:", data.totalSales / data.dailyTarget);
  console.log("Branches sample:", data.branches.slice(0, 3).map(b => ({ id: b.id, name: b.name, target: b.dailyTarget })));
}

test();
