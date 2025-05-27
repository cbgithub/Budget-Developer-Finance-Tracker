// Define the spreadsheet and the corresponding sheets
var ss = SpreadsheetApp.getActiveSpreadsheet();
var categoriesSheet = ss.getSheetByName('Categories');
var savingsSheet = ss.getSheetByName('Savings');
var incomeSheet = ss.getSheetByName('Income');
var planSheet = ss.getSheetByName('Plan');
var transactionsSheet = ss.getSheetByName('Transactions');
var badgeSheet = ss.getSheetByName('Badges');
var badgesEarnedSheet = ss.getSheetByName('BadgesEarned');

function setup() {
  ss = SpreadsheetApp.getActiveSpreadsheet();
  categoriesSheet = ss.getSheetByName('Categories');
  incomeSheet = ss.getSheetByName('Income');
  planSheet = ss.getSheetByName('Plan');
  transactionsSheet = ss.getSheetByName('Transactions');
  badgeSheet = ss.getSheetByName('Badges');
  badgesEarnedSheet = ss.getSheetByName('BadgesEarned');
  savingsSheet = ss.getSheetByName('Savings');
}

function doGet() {
  var output = HtmlService.createHtmlOutputFromFile('index');
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1');

  return output;
}

// Get summary data
function getSummaryData(month, year) {
  // Replace with actual logic to fetch data from your Google Sheet
  return {
    moneySummary: "Spent $500 on groceries this month.",
    overBudgetCategories: "Groceries: $100 over",
    underBudgetCategories: "Dining Out: $50 under",
    totalIncome: "$5,000",
    budgetVsActual: "90% of budget spent"
  };
}



// Get all data from Categories Sheet
function getCategories() {
  const data = categoriesSheet.getDataRange().getValues();


  // Exclude the 3rd column (index 2)
  const filteredData = data.slice(1).map(row => row.filter((_, colIndex) => colIndex !== 2));
  

  return filteredData; // Return data without the excluded column
 
}

function getSystemCategories(){
  const data = categoriesSheet.getDataRange().getValues();
    // Exclude the 3rd column (index 2)
  let filteredData = data.slice(1).map(row => row.filter((_, colIndex) => colIndex !== 2));
  filteredData = filteredData.filter(row => row[3] === true );
  return filteredData; // Return data without the excluded column
}


// Get all data from Savings Sheet
function getSavingFundNames() {
  const data = savingsSheet.getDataRange().getValues();

  // Extract column index 2 (third column), skip header
  const names = data.slice(1).map(row => row[2]);

  // Use a Set to remove duplicates
  const uniqueNames = [...new Set(names)];


  return uniqueNames; // Return array of unique fund names
 
}

// Add a new Category
function addCategory(categoryName) {
  const lastRow = categoriesSheet.getLastRow() + 1;
  categoriesSheet.appendRow([generateUniqueId(), categoryName, new Date()]);
  // Return a response to indicate success
  return 'success';  // Make sure this matches the value checked in your frontend
}

// Edit an existing Category
function editCategory(categoryId, newCategoryName) {
  const data = categoriesSheet.getDataRange().getValues();
  let output = "";
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] + "" == categoryId) {
      categoriesSheet.getRange(i + 1, 2).setValue(newCategoryName); // Update the category name
      categoriesSheet.getRange(i + 1, 3).setValue(new Date()); // Update the category name
      output = "success";
      break;
    }
  }
  return output;
}

// Delete a Category
function deleteCategory(categoryId) {
  const data = categoriesSheet.getDataRange().getValues();
  let output = "";
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] + "" == categoryId) {
      categoriesSheet.deleteRow(i + 1); // Deleting the row with the given ID
      output = "success";
      break;
    }
  }

  return output;
}

// Add new income
function addIncome(month, year, amount, source) {
  const lastRow = incomeSheet.getLastRow() + 1;
  incomeSheet.appendRow([generateUniqueId(), new Date(), month, year, parseFloat(amount), source]);
  return 'success';  // Make sure this matches the value checked in your frontend
}

function editIncome(incomeId, newMonth, newYear, newAmount, newDescription) {
  const data = incomeSheet.getDataRange().getValues();
  let output = '';
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] + "" == incomeId) {

      incomeSheet.getRange(i + 1, 2).setValue(new Date());
      incomeSheet.getRange(i + 1, 3).setValue(newMonth);
      incomeSheet.getRange(i + 1, 4).setValue(parseInt(newYear));
      incomeSheet.getRange(i + 1, 5).setValue(parseFloat(newAmount));
      incomeSheet.getRange(i + 1, 6).setValue(newDescription);
      output = 'success';
      break;
    }
  }

  return output;

}

// Delete a Income
function deleteIncome(incomeId) {
  const data = incomeSheet.getDataRange().getValues();
  let output = "";
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] + "" == incomeId) {
      incomeSheet.deleteRow(i + 1); // Deleting the row with the given ID
      output = "success";
      break;
    }
  }

  return output;
}


function copyPreviousMonthIncome(currentMonth, currentYear) {
  const data = incomeSheet.getDataRange().getValues();
  const rows = data.slice(1); // Exclude header row

  const currentMonthData = rows.filter(row => row[2] === currentMonth && row[3] == currentYear);
  if (currentMonthData.length > 0) {
    return "Data for the current month already exists.";
  }

  const monthNames = [
    "January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", "December"
  ];

  const currentMonthIndex = monthNames.indexOf(currentMonth);
  let previousMonthIndex = currentMonthIndex - 1;
  let previousYear = currentYear;

  if (previousMonthIndex < 0) {
    previousMonthIndex = 11; // December
    previousYear = currentYear - 1;
  }

  const previousMonth = monthNames[previousMonthIndex];
  const filteredData = rows.filter(row => row[2] === previousMonth && row[3] == previousYear);

  if (filteredData.length === 0) {
    return "No data found for the previous month.";
  }

  filteredData.forEach(row => {
    let [, , , , amount, source] = row; // Extract necessary fields (adjust indices as per your sheet structure)
    source = source.replace(previousMonth, currentMonth);
    source = source.replace(previousYear, currentYear);
    addIncome(currentMonth, currentYear, amount, source); // Use your existing addIncome function
  });

  return `${filteredData.length} rows copied for ${currentMonth} ${currentYear}.`;
}

function copyPreviousMonthPlan(currentMonth, currentYear) {
  const data = planSheet.getDataRange().getValues();
  const rows = data.slice(1); // Exclude header row

  const currentMonthData = rows.filter(row => row[2] === currentMonth && row[3] == currentYear);
  if (currentMonthData.length > 0) {
    return "Data for the current month already exists.";
  }

  const monthNames = [
    "January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", "December"
  ];

  const currentMonthIndex = monthNames.indexOf(currentMonth);
  let previousMonthIndex = currentMonthIndex - 1;
  let previousYear = currentYear;

  if (previousMonthIndex < 0) {
    previousMonthIndex = 11; // December
    previousYear = currentYear - 1;
  }

  const previousMonth = monthNames[previousMonthIndex];
  const filteredData = rows.filter(row => row[2] === previousMonth && row[3] == previousYear);

  if (filteredData.length === 0) {
    return "No data found for the previous month.";
  }

  filteredData.forEach(row => {
    let [, , , , amount, source, description, systemCategory] = row; // Extract necessary fields (adjust indices as per your sheet structure)
    description = description.replace(previousMonth, currentMonth);
    description = description.replace(previousYear, currentYear);
    addPlan(currentMonth, currentYear, amount, source, description, systemCategory); // Use your existing addPlan function
  });

  return `${filteredData.length} rows copied for ${currentMonth} ${currentYear}.`;
}



function getIncome(month, year) {
  const data = incomeSheet.getDataRange().getValues();


  year = year + '';
  const rows = data.slice(1); // Exclude header row

  const monthIndex = 2; // Update index based on "Month" position
  const yearIndex = 3;  // Update index based on "Year" position

  const normalizedMonth = month && month.trim() !== '' ? month.trim().toLowerCase() : 'all';
  const normalizedYear = year && year.trim() !== '' ? year.trim().toLowerCase() : 'all';

  const filteredRows = rows.filter(row => {
    const rowMonth = row[monthIndex] ? row[monthIndex].toLowerCase() : '';
    const rowYear = row[yearIndex] ? row[yearIndex] : '';
    row[1] = new Date(row[1]).toLocaleDateString();
    row[0] = row[0] + "";

    const matchMonth = normalizedMonth === 'all' || rowMonth === normalizedMonth;
    const matchYear = normalizedYear === 'all' || rowYear === parseInt(normalizedYear);

    return matchMonth && matchYear;
  });

  return filteredRows;

}


// Add new plan data
function addPlan(month, year, plannedAmount, category, description, mainCategory) {
  const lastRow = planSheet.getLastRow() + 1;
  planSheet.appendRow([generateUniqueId(), new Date(), month, parseInt(year), parseFloat(plannedAmount), category, description, mainCategory]);
  return 'success';
}



// Get plan data
function getPlans(month, year) {
  const data = planSheet.getDataRange().getValues();



  year = year + '';
  const rows = data.slice(1); // Exclude header row

  const monthIndex = 2; // Update index based on "Month" position
  const yearIndex = 3;  // Update index based on "Year" position

  const normalizedMonth = month && month.trim() !== '' ? month.trim().toLowerCase() : 'all';
  const normalizedYear = year && year.trim() !== '' ? year.trim().toLowerCase() : 'all';

  const filteredRows = rows.filter(row => {
    const rowMonth = row[monthIndex] ? row[monthIndex].toLowerCase() : '';
    const rowYear = row[yearIndex] ? row[yearIndex] : '';
    row[1] = new Date(row[1]).toLocaleString();
    row[0] = row[0] + "";

    const matchMonth = normalizedMonth === 'all' || rowMonth === normalizedMonth;
    const matchYear = normalizedYear === 'all' || rowYear === parseInt(normalizedYear);

    return matchMonth && matchYear;
  });

  return filteredRows;
}

function editPlan(planId, newMonth, newYear, newAmount, newCategory, newDescription, newMainCategory) {
  const data = planSheet.getDataRange().getValues();
  let output = '';


  for (let i = 1; i < data.length; i++) {
    if (data[i][0] + "" == planId) {

      planSheet.getRange(i + 1, 2).setValue(new Date());
      planSheet.getRange(i + 1, 3).setValue(newMonth);
      planSheet.getRange(i + 1, 4).setValue(parseInt(newYear));
      planSheet.getRange(i + 1, 5).setValue(parseFloat(newAmount));
      planSheet.getRange(i + 1, 6).setValue(newCategory);
      planSheet.getRange(i + 1, 7).setValue(newDescription);
      planSheet.getRange(i + 1, 8).setValue(newMainCategory);
      output = 'success';
      break;
    }
  }

  return output;

}

// Delete a Plan
function deletePlan(planId) {
  const data = planSheet.getDataRange().getValues();
  let output = "";
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] + "" == planId) {
      planSheet.deleteRow(i + 1); // Deleting the row with the given ID
      output = "success";
      break;
    }
  }

  return output;
}

// Add new transaction
function addTransaction(date, amount, category, description) {
  const lastRow = transactionsSheet.getLastRow() + 1;
  transactionsSheet.appendRow([generateUniqueId(), date, parseFloat(amount), category, description]);
}

//Add new transaction with planid
function addTransaction(planid, amount, description, category, savingsCategory) {
  const lastRow = transactionsSheet.getLastRow() + 1;
  const transactionId = generateUniqueId();
  const dateAdded = new Date();
  transactionsSheet.appendRow([transactionId, planid, dateAdded, parseFloat(amount), description, category]);
  if(savingsCategory.toLowerCase().replaceAll(' ', '') == 'savings&sinkingfunds'){ //Savings&SinkingFunds
    addSaving(transactionId,category,amount,description,dateAdded);
  }

  
  return 'success';
}

//Add new savings with transactionId
function addSaving(transactionId,savingsCategory, amount, description, date){
   const lastRow = savingsSheet.getLastRow() + 1;
   savingsSheet.appendRow([transactionId,date,savingsCategory,amount,description, date.getMonth() + 1, date.getFullYear()]);
   return 'success';

}



// Get transaction data
function getTransactionsByPlan(planId) {
  const data = transactionsSheet.getDataRange().getValues();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short'
  };

  return data.filter(row => {
    row[2] = new Date(row[2]).toLocaleString('en-US', options);
    row[1] = row[1] + "";
    return row[1] === planId;
  });
}

// Get transaction data
function getTransactions(month, year) {
  const data = transactionsSheet.getDataRange().getValues();
  return data.filter(row => {
    row[0] = row[0] + "";
    const transactionDate = new Date(row[1]);
    return transactionDate.getMonth() + 1 == month && transactionDate.getFullYear() == year;
  });
}

// Edit an existing transaction
function editTransaction(transactionId, planId, newAmount, newDescription, newFundName, newSystemCategory) {
  const data = transactionsSheet.getDataRange().getValues();
  let output = '';
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] + "" == transactionId) {
      transactionsSheet.getRange(i + 1, 3).setValue(new Date());
      transactionsSheet.getRange(i + 1, 4).setValue(parseFloat(newAmount));
      transactionsSheet.getRange(i + 1, 5).setValue(newDescription);
      transactionsSheet.getRange(i + 1, 6).setValue(newFundName);
      output = 'success';
      break;
    }
  }
  if(newSystemCategory.toLowerCase().replaceAll(' ','') == 'savings&sinkingfunds'){
    updateSavingsRowById(transactionId,newAmount,newDescription, newFundName);
  }
  return output;
}

function updateSavingsRowById(transactionId, newAmount, newDescription, newFundName) {
  const data = savingsSheet.getDataRange().getValues();
  let output = '';

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] + "" === transactionId) { // assuming transactionId is in column A
      savingsSheet.getRange(i + 1, 2).setValue(new Date());
      savingsSheet.getRange(i + 1, 3).setValue(newFundName);
      savingsSheet.getRange(i + 1, 4).setValue(parseFloat(newAmount));
      savingsSheet.getRange(i + 1, 5).setValue(newDescription);
      output = 'success';
      break;
    }
  }
  return output;
}


// Delete a transaction
function deleteTransaction(transactionId) {
  const data = transactionsSheet.getDataRange().getValues();
  let output = '';
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == transactionId) {
      transactionsSheet.deleteRow(i + 1); // Deleting the row with the given ID
      output = 'success';
      break;
    }
  }
  deleteSavingsByTransactionId(transactionId);

  return output;
}

function deleteSavingsByTransactionId(transactionId){
  const data = savingsSheet.getDataRange().getValues();
  let output = '';
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == transactionId) {
      savingsSheet.deleteRow(i + 1); // Deleting the row with the given ID
      output = 'success';
      break;
    }
  }

  return output;

}

function getSummaryData(month, year) {

 


  month = month == 'all' ? 'all' : parseInt(month);
  year = year == 'all' ? 'all' : parseInt(year);
  // Get plan data and map PlanId to Categories and Budgets
  const planData = planSheet.getDataRange().getValues().slice(1);
  const planMap = {}; // Maps PlanId to { category, budget }
  let totalBudgeted = 0;
  planData.forEach(row => {
    const planId = row[0] + ""; // Assuming the first column contains PlanId
    const category = row[5]; // Assuming the fifth column contains Category
    const budget = row[4]; // Assuming the fourth column contains Budget
    const date = new Date(row[2] + " " + row[3]);
    planMap[planId] = { category, budget, date };
      if (shouldIncludeDate(date, month, year)) {

           totalBudgeted += row[4];

      }
  });

  // Get total income from IncomeSheet
  const incomeData = incomeSheet.getDataRange().getValues().slice(1);
  let totalIncome = 0;
  incomeData.forEach(row => {
    const date = new Date(row[2] + " " + row[3]); // Assuming the first column contains income dates
    if (shouldIncludeDate(date, month, year)) {
      totalIncome += row[4]; // Assuming the fourth column contains income amounts
    }
  });

  // Get total expenses and spending by category from TransactionsSheet
  const transactionData = transactionsSheet.sort(3, false).getDataRange().getValues().slice(1);

  let totalExpenses = 0;
  const spendingByCategory = {};
  const recentTransactions = [];
  let count = 0;
  transactionData.forEach(row => {
    const planId = row[1] + "";
    if (!planMap[planId]) return; // or continue if in a loop
    const date = planMap[planId].date;

    const transactionDate = new Date(row[2]);
    const transactionDes = row[4];

    const amount = parseFloat(Math.abs(row[3])) || 0; // Safely parse the fourth column as a number


    if (shouldIncludeDate(date, month, year)) {
      const planId = row[1] + ""; // Assuming the second column contains PlanId

      totalExpenses += amount;
      if(count < 2){
      recentTransactions.push(`${transactionDate} (Desc: ${transactionDes}, Spent: $${amount})`);
      }
      count++;

      // Map PlanId to Category
      if (planMap[planId]) {
        const category = planMap[planId].category;


        // Only consider the plan if its date matches the filter

        spendingByCategory[category] = (spendingByCategory[category] || 0) + amount;



      }




    }
  });





  // Calculate over/under budget categories
  const overBudgetCategories = [];
  const underBudgetCategories = [];
 
  Object.keys(planMap).forEach(planId => {
    const { category, budget, date } = planMap[planId];
    const spent = spendingByCategory[category] || 0;
    // Only add to over/under budget if the plan's date matches the selected month/year
    if (shouldIncludeDate(date, month, year)) {
      // Add to over/under budget lists based on the spending comparison
      if (spent > 0) {
        if (spent > budget) {
          overBudgetCategories.push(`${category} (Budget: $${budget}, Spent: $${spent})`);
        } else {
          underBudgetCategories.push(`${category} (Budget: $${budget}, Spent: $${spent})`);
        }
      }
    }
  });


  // If no spending data, show "No Data Available"
  let spendingData = {
    labels: Object.keys(spendingByCategory),
    values: Object.values(spendingByCategory),
  };

  if (spendingData.labels.length === 0) {
    spendingData = { labels: ['No Data Available'], values: [''] };
  }

  // Return summary data
  const output = {
    totalIncome: `$${Number.parseFloat(totalIncome).toFixed(2)}`,
    budgetVsActual: `Budgeted: $${Number.parseFloat(totalBudgeted).toFixed(2)}, Actual: $${Number.parseFloat(totalExpenses).toFixed(2)}`,
    overBudgetCategories,
    underBudgetCategories,
    spendingData,
    recentTransactions,
    badgeSummary: getBadgeProgressSummary()
  };

  return output;
}

// Helper function to check if a date should be included based on the month and year
function shouldIncludeDate(date, month, year) {
  const dateMonth = date.getMonth() + 1; // getMonth() is zero-based, so add 1 to get the actual month
  const dateYear = date.getFullYear();

  if (month === 'all' && year === 'all') {
    return true; // Include all dates
  }

  if (month === 'all' && dateYear === year) {
    return true; // Include all months for the selected year
  }

  if (year === 'all' && dateMonth === month) {
    return true; // Include all years for the selected month
  }

  return dateMonth === month && dateYear === year; // Include only the matching month and year
}




function getFilteredPlansWithCount(month, year, searchTerm, startIndex, itemsPerPage) {

  const data = planSheet.getDataRange().getValues();

  month = month == '' || month == null ? 'all' : month;
  year = year == '' || year == null ? 'all' : year + '';
  searchTerm = searchTerm == '' || searchTerm == null ? '' : searchTerm;

  startIndex = startIndex == null || startIndex == '' ? 0 : startIndex;

  itemsPerPage = itemsPerPage == null || itemsPerPage == '' ? 5 : itemsPerPage;

  const rows = data.slice(1); // Exclude header row

  const monthIndex = 2; // Update index based on "Month" position
  const yearIndex = 3;  // Update index based on "Year" position



  const normalizedMonth = month && month.trim() !== '' ? month.trim().toLowerCase() : 'all';
  const normalizedYear = year && year.trim() !== '' ? year.trim().toLowerCase() : 'all';

  const filteredData = rows.filter(row => {
    const rowMonth = row[monthIndex] ? row[monthIndex].toLowerCase() : '';
    const rowYear = row[yearIndex] ? row[yearIndex] : '';
    row[1] = new Date(row[1]).toLocaleString();
    row[0] = row[0] + "";

    const matchMonth = normalizedMonth === 'all' || rowMonth === normalizedMonth;
    const matchYear = normalizedYear === 'all' || rowYear === parseInt(normalizedYear);
    const matchSearch = searchTerm === "" || row[5].toLowerCase().includes(searchTerm.toLowerCase());

    return matchMonth && matchYear && matchSearch;
  });

  const totalRecords = filteredData.length;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  let output = { data: paginatedData, totalRecords };


  return output; // Return data and count
}

function getFilteredIncomesWithCount(month, year, searchTerm, startIndex, itemsPerPage) {

  const data = incomeSheet.getDataRange().getValues();

  month = month == '' || month == null ? 'all' : month;
  year = year == '' || year == null ? 'all' : year + '';
  searchTerm = searchTerm == '' || searchTerm == null ? '' : searchTerm;

  startIndex = startIndex == null || startIndex == '' ? 0 : startIndex;

  itemsPerPage = itemsPerPage == null || itemsPerPage == '' ? 5 : itemsPerPage;

  const rows = data.slice(1); // Exclude header row

  const monthIndex = 2; // Update index based on "Month" position
  const yearIndex = 3;  // Update index based on "Year" position



  const normalizedMonth = month && month.trim() !== '' ? month.trim().toLowerCase() : 'all';
  const normalizedYear = year && year.trim() !== '' ? year.trim().toLowerCase() : 'all';

  const filteredData = rows.filter(row => {
    const rowMonth = row[monthIndex] ? row[monthIndex].toLowerCase() : '';
    const rowYear = row[yearIndex] ? row[yearIndex] : '';
    row[1] = new Date(row[1]).toLocaleString();
    row[0] = row[0] + "";

    const matchMonth = normalizedMonth === 'all' || rowMonth === normalizedMonth;
    const matchYear = normalizedYear === 'all' || rowYear === parseInt(normalizedYear);
    const matchSearch = searchTerm === "" || row[5].toLowerCase().includes(searchTerm.toLowerCase());

    return matchMonth && matchYear && matchSearch;
  });

  const totalRecords = filteredData.length;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  let output = { data: paginatedData, totalRecords };

  return output; // Return data and count
}

function getFilteredCategoriesWithCount(month, year, searchTerm, startIndex, itemsPerPage) {

  const data = categoriesSheet.getDataRange().getValues();


 
  searchTerm = searchTerm == '' || searchTerm == null ? '' : searchTerm;

  startIndex = startIndex == null || startIndex == '' ? 0 : startIndex;

  itemsPerPage = itemsPerPage == null || itemsPerPage == '' ? 5 : itemsPerPage;


    // Exclude the 3rd column (index 2)
  const rows = data.slice(1).map(row => row.filter((_, colIndex) => colIndex !== 2));




  const filteredData = rows.filter(row => {
    
    row[0] = row[0] + "";
    const matchSearch = searchTerm === ""  || row[1].toLowerCase().includes(searchTerm.toLowerCase());

    return matchSearch;
  });

  const totalRecords = filteredData.length;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  let output = { data: paginatedData, totalRecords };


  return output; // Return data and count
}

// Dynamically calculate user's current progress
function getUserProgress() {
  const transactionsCount = transactionsSheet.getLastRow() - 1; // Skip headers
  const planData = planSheet.getRange(2, 2, planSheet.getLastRow() - 1, 2).getValues();
  const incomeData = incomeSheet.getDataRange().getValues().slice(1); 
  const savingsData = savingsSheet.getDataRange().getValues().slice(1);
  // Assumes Column 1 = Date, Column 2 = Other Data

  const plansByMonthYear = {};

  planData.forEach(row => {
    const [date] = row;
    if (date instanceof Date) { // Only process valid dates
      const monthYear = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM");
      if (!plansByMonthYear[monthYear]) {
        plansByMonthYear[monthYear] = 0;
      }
      plansByMonthYear[monthYear]++;
    }
  });

  const incomeByMonthYear = {};
  incomeData.forEach(row => {
    const [id, date, month, year, amount, description] = row;
    let tempDate = new Date(year + '-' + month);
    if (tempDate instanceof Date) { // Only process valid dates
      const monthYear = Utilities.formatDate(tempDate, Session.getScriptTimeZone(), "yyyy-MM");
      if (!incomeByMonthYear[monthYear]) {
        incomeByMonthYear[monthYear] = 0;
      }
      incomeByMonthYear[monthYear]++;
    }
  });


  const savingsByMonthYear = {};
  let totalSavings = 0;
  savingsData.forEach(row => {
    const [id, date,fundname, amount, description, month, year] = row;
    totalSavings += amount;
    let d = new Date(year + '-' + month);
    if (d instanceof Date) { // Only process valid dates
      const monthYear = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM");
      if (!savingsByMonthYear[monthYear]) {
        savingsByMonthYear[monthYear] = 0;
      }
      savingsByMonthYear[monthYear]+=amount;
    }
  });


  return {
    transactionsLogged: transactionsCount,
    budgetsCreated: Object.keys(plansByMonthYear).length, // Total count
    budgetsByMonth: plansByMonthYear, // Grouped by month-year
    savingsByMonth: savingsByMonthYear,
    savingsLogged: totalSavings,
    incomeLogged: Object.keys(incomeByMonthYear).length
  };
}

// Get Badges + progress, determine earned
function getBadges() {
  const badgeData = badgeSheet.getRange(2, 1, badgeSheet.getLastRow() - 1, 7).getValues(); // Skip headers
  const earnedData = badgesEarnedSheet ? badgesEarnedSheet.getRange(2, 2, badgesEarnedSheet.getLastRow() - 1, 1).getValues().flat() : []; // Already earned badges
  const userProgress = getUserProgress(); // 👈 Dynamically calculate current progress

  const badges = badgeData.map(row => {
    const [id, name, title, description, image, criteriaType, criteriaCount] = row;
    const progressValue = userProgress[criteriaType] || 0;

    return {
      name,
      title,
      description,
      image,
      earned: earnedData.includes(name) || progressValue >= parseInt(criteriaCount), // Mark earned based on progress
      criteriaType,
      criteriaCount: parseInt(criteriaCount)
    };
  });


  return badges;
}



function getBadgeProgressSummary() {
 


  const badgeData = badgeSheet.getDataRange().getValues();
  const earnedData = badgesEarnedSheet.getDataRange().getValues();

  const headers = badgeData.shift();
  const earnedHeaders = earnedData.shift();

  const badges = badgeData.map(row => {
    const obj = {};
    headers.forEach((key, i) => obj[key] = row[i]);
    return obj;
  });

  const earnedBadgeIds = new Set(earnedData.map(row => row[1]));

  const total = badges.length;
  let earned = 0;
  const groups = {};

  badges.forEach(badge => {
    const group = badge.criteriaType || 'Other';
    const displayName = badge.displayName;
    const isEarned = earnedBadgeIds.has(badge['Badge Id']);

    if (!groups[group]) {
      groups[group] = { total: 0, earned: 0, name: displayName };
    }

    groups[group].total++;
    if (isEarned) {
      groups[group].earned++;
      earned++;
    }
  });



  return {
    totalBadges: total,
    earnedBadges: earned,
    groups: groups
  };
}


function getFilteredBadgesWithCount(searchTerm, startIndex, itemsPerPage, loadAll = false) {

  const data = badgeSheet.getDataRange().getValues();
  const earnedRows = badgesEarnedSheet ? badgesEarnedSheet.getDataRange().getValues() : []; // All earned rows
  const userProgress = getUserProgress(); // 👈 Dynamically calculate current progress
  const newEarnedBadges = []; // to track badges newly earned


  searchTerm = searchTerm == '' || searchTerm == null ? '' : searchTerm;

  startIndex = startIndex == null || startIndex == '' ? 0 : startIndex;

  itemsPerPage = itemsPerPage == null || itemsPerPage == '' ? 10: itemsPerPage;


  const rows = data.slice(1); // Exclude header row
  // Build a map: { badgeName: earnedDate }
  const earnedDataMap = {};
  earnedRows.slice(1).forEach(row => {
    const earnedDate = new Date(row[3]).toLocaleDateString(); // Column A - Date
    const badgeName = row[2];  // Column C - Badge Name
    const badgeId = row[1];
    if (badgeId) {
      earnedDataMap[badgeId] = earnedDate;
    }
  });


 

  const filteredData = rows.filter(row => {



    const matchSearch = searchTerm === "" || row[3].toLowerCase().replaceAll(' ', '').includes(searchTerm.toLowerCase().replaceAll(' ',''));

    return matchSearch;
  });


  const totalRecords = filteredData.length;
  const paginatedData = loadAll ? filteredData : filteredData.slice(startIndex, startIndex + itemsPerPage);
  const badges = paginatedData.map(row => {
    const [id, name, title, description, image, criteriaType, criteriaCount] = row;
    const progressValue = userProgress[criteriaType] || 0;
    const alreadyEarned = earnedDataMap.hasOwnProperty(id);
    const meetsCriteria = progressValue >= parseInt(criteriaCount);
    
    let earned = alreadyEarned;
    let earnedDate = earnedDataMap[id] || null;

    if (!alreadyEarned && meetsCriteria) {
      earned = true;
      earnedDate = new Date().toLocaleDateString();
      newEarnedBadges.push([generateUniqueId(), id, name, earnedDate]); // Save to sheet
    }

    return {
      name,
      title,
      description,
      image,
      earned,
      criteriaType,
      criteriaCount: parseInt(criteriaCount),
      earnedDate
    };
  });
   // If there are newly earned badges, write them to the "Badges Earned" sheet
  if (newEarnedBadges.length > 0) {
    badgesEarnedSheet.getRange(badgesEarnedSheet.getLastRow() + 1, 1, newEarnedBadges.length, 4).setValues(newEarnedBadges);
  }
  let output = { data: badges, totalRecords, newEarnedBadges: newEarnedBadges };




 
  return output; // Return data and count
}




//GENERATE UNIQUE ID
function generateUniqueId() {
  var date = new Date();
  let id = Utilities.getUuid() + date.getTime();
  return id;
}
