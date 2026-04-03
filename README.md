<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dynamic CPU Scheduling Simulator</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #9cbbeb;
      margin: 0;
      padding: 20px;
      display: flex;
      justify-content: center;
      gap: 20px;
    }
    h1 {
      color: #333;
      text-align: center;
    }
    .container {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      width: 60%;
      max-width: 800px;
      text-align: center;
    }
    .description {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      width: 40%;
      max-width: 600px;
      text-align: left;
      overflow-y: auto;
      max-height: 90vh;
    }
    input, select {
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 100%;
      font-size: 16px;
    }
    button {
      padding: 10px 20px;
      margin: 10px 5px;
      border: none;
      border-radius: 4px;
      color: #fff;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.2s ease;
    }
    button:hover {
      transform: translateY(-2px);
    }
    .add-button {
      background-color: #28a745;
    }
    .add-button:hover {
      background-color: #218838;
    }
    .import-button {
      background-color: #17a2b8;
    }
    .import-button:hover {
      background-color: #138496;
    }
    .export-button {
      background-color: #ffc107;
      color: #333;
    }
    .export-button:hover {
      background-color: #e0a800;
    }
    .simulate-button {
      background-color: #007bff;
    }
    .simulate-button:hover {
      background-color: #0056b3;
    }
    .clear-button {
      background-color: #dc3545;
    }
    .clear-button:hover {
      background-color: #c82333;
    }
    .output {
      margin-top: 20px;
      text-align: left;
    }
    .task {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 10px;
      background-color: #f9f9f9;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .task:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .chart {
      margin-top: 20px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: #f9f9f9;
      width: 100%;
    }
    .hidden {
      display: none;
    }
    .gantt-chart {
      margin-top: 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .gantt-bar {
      height: 30px;
      background-color: #007bff;
      border-radius: 4px;
      text-align: center;
      color: white;
      font-size: 14px;
      line-height: 30px;
      padding: 0 15px;
      white-space: nowrap;
      transition: background-color 0.3s ease;
    }
    .gantt-bar:hover {
      background-color: #0056b3;
    }
    .task-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .task-table th, .task-table td {
      border: 1px solid #ccc;
      padding: 10px;
      text-align: center;
    }
    .task-table th {
      background-color: #f4f4f9;
    }
    .task-form {
      margin-top: 20px;
    }
    .task-form input {
      margin-bottom: 10px;
    }
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #333;
      color: #fff;
      padding: 10px 20px;
      border-radius: 5px;
      display: none;
      z-index: 1000;
    }
    .toast.show {
      display: block;
      animation: fadeInOut 3s ease-in-out;
    }
    @keyframes fadeInOut {
      0%, 100% { opacity: 0; }
      10%, 90% { opacity: 1; }
    }
    .tips {
      margin-top: 30px;
      padding: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: #9cbbeb;
      clear: both;
    }
    .tips h3 {
      margin-top: 0;
      color: #333;
    }
    .tips ul {
      padding-left: 20px;
      margin-bottom: 0;
    }
    .metrics-box {
      margin-top: 20px;
      padding: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: #9cbbeb;
      text-align: left;
    }
    .metrics-box h3 {
      margin-top: 0;
      color: #333;
    }
    .metrics-box p {
      margin: 5px 0;
    }
    .edit-button {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    .edit-button:hover {
      background-color: #218838;
    }
    .delete-button {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    .delete-button:hover {
      background-color: #c82333;
    }
    .energy-meter {
      width: 100%;
      height: 20px;
      background-color: #f0f0f0;
      border-radius: 10px;
      margin-top: 10px;
      overflow: hidden;
    }
    .energy-level {
      height: 100%;
      background: linear-gradient(to right, #4CAF50, #FFC107, #F44336);
      transition: width 0.5s ease;
    }
    .chart-container {
      position: relative;
      height: 400px;
      width: 100%;
      margin-top: 20px;
    }
    .energy-legend {
      display: flex;
      justify-content: center;
      margin: 20px 0 10px 0;
      gap: 20px;
      flex-wrap: wrap;
      padding: 12px;
      background-color: #f9f9f9;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    .legend-item {
      display: flex;
      align-items: center;
      margin: 5px 0;
    }
    .legend-color {
      width: 18px;
      height: 18px;
      margin-right: 8px;
      border-radius: 3px;
    }
    .energy-pie-chart {
      margin-top: 25px;
      padding: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: #f9f9f9;
    }
    .pie-chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
    .priority-label {
      font-weight: bold;
      margin-right: 5px;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <!-- Rest of your HTML content remains exactly the same -->
  <div class="container">
    <h1>Dynamic CPU Scheduling Simulator</h1>
    <h2>Enter Task Details</h2>
    <div class="task-form">
      <input type="number" id="arrivalTime" placeholder="Arrival Time" required>
      <input type="number" id="burstTime" placeholder="Burst Time" required>
      <input type="number" id="priority" placeholder="Priority (1: System, 2: Interactive, 3: Background)" class="hidden">
      <button class="add-button" onclick="addTask()">Add Task</button>
      <input type="file" id="importFile" accept=".csv" style="display: none;">
      <button class="import-button" onclick="importTasks()">Import Tasks from CSV</button>
      <button class="export-button" onclick="exportTasks()">Export Tasks as CSV</button>
    </div>
    <select id="algorithm">
      <option value="FCFS">First-Come, First-Served (FCFS)</option>
      <option value="SJF">Shortest Job First (SJF)</option>
      <option value="PriorityNP">Priority Scheduling (Non-Preemptive)</option>
      <option value="PriorityP">Priority Scheduling (Preemptive)</option>
      <option value="RR">Round Robin (RR)</option>
      <option value="SRTF">Shortest Remaining Time First (SRTF)</option>
      <option value="MLQ">Multilevel Queue Scheduling (MLQ)</option>
    </select>
    <select id="mode">
      <option value="standard">Standard Mode (Performance)</option>
      <option value="eco">Eco Mode (Energy Efficiency)</option>
      <option value="balanced">Balanced Mode (Performance + Energy)</option>
    </select>
    <input type="number" id="timeQuantum" placeholder="Time Quantum (for RR, MLQ)" class="hidden">
    <button class="simulate-button" onclick="simulate()">Start Simulation</button>
    <button class="clear-button" onclick="clearData()">Clear Data</button>

    <div class="metrics-box" id="metricsBox">
      <h3>Performance Metrics</h3>
      <p>Average Turnaround Time: <span id="avgTurnaroundTime">0.00</span> units</p>
      <p>Average Waiting Time: <span id="avgWaitingTime">0.00</span> units</p>
      <h3>Energy Metrics</h3>
      <p>Total Energy Consumption: <span id="totalEnergy">0</span> units</p>
      <p>Energy Efficiency: <span id="energyEfficiency">0%</span></p>
      <div class="energy-meter">
        <div class="energy-level" id="energyLevel" style="width: 0%"></div>
      </div>
    </div>

    <div class="output" id="output"></div>
    <div class="chart" id="chart"></div>
  </div>

  <div class="description" id="description">
    <h2>Algorithm Description</h2>
    <p id="algorithmDescription">Select an algorithm to see its description.</p>
    <h3>Task Table</h3>
    <table class="task-table" id="taskTable">
      <thead>
        <tr>
          <th>Task ID</th>
          <th>Arrival Time</th>
          <th>Burst Time</th>
          <th>Priority</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="taskTableBody"></tbody>
    </table>
    <h3>Gantt Chart</h3>
    <div class="gantt-chart" id="ganttChart"></div>
    <h3>Energy Consumption Analysis</h3>
    <div class="chart-container">
      <canvas id="energyChart"></canvas>
      <div class="energy-legend" id="energyLegend">
        <div class="legend-item">
          <div class="legend-color" style="background-color: rgba(255, 99, 132, 0.7);"></div>
          <span class="priority-label">System Priority</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: rgba(54, 162, 235, 0.7);"></div>
          <span class="priority-label">Interactive Priority</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: rgba(75, 192, 192, 0.7);"></div>
          <span class="priority-label">Background Priority</span>
        </div>
      </div>
    </div>
    <div class="tips">
      <h3>Energy-Saving Tips</h3>
      <ul>
        <li>Use Eco Mode to reduce energy consumption by up to 20%.</li>
        <li>Group tasks with similar burst times to minimize context switching.</li>
        <li>Use Balanced Mode for a trade-off between performance and energy efficiency.</li>
        <li>Higher priority tasks consume more energy - optimize their execution.</li>
      </ul>
    </div>
    <div class="energy-pie-chart">
      <h3>Energy Distribution by Priority</h3>
      <div class="pie-chart-container">
        <canvas id="priorityChart"></canvas>
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    let tasks = [];
    let taskIdCounter = 1;
    let energyChart = null;
    let priorityChart = null;

    const algorithmDescriptions = {
      FCFS: "First-Come, First-Served (FCFS): Tasks are executed in the order they arrive. Simple and fair, but may lead to long waiting times for short tasks.",
      SJF: "Shortest Job First (SJF): Tasks with the shortest burst time are executed first. Minimizes average waiting time but requires knowledge of burst times.",
      PriorityNP: "Priority Scheduling (Non-Preemptive): Tasks are executed based on priority. Higher priority tasks are executed first, but once a task starts, it runs to completion.",
      PriorityP: "Priority Scheduling (Preemptive): Tasks are executed based on priority, and higher priority tasks can preempt lower priority ones. Ensures high-priority tasks are handled quickly.",
      RR: "Round Robin (RR): Each task is given a fixed time slice (time quantum). Tasks are executed in a circular order, ensuring fair CPU time allocation.",
      SRTF: "Shortest Remaining Time First (SRTF): The task with the shortest remaining burst time is executed next. Preemptive version of SJF, minimizing waiting time.",
      MLQ: "Multilevel Queue Scheduling (MLQ): Tasks are divided into multiple queues based on priority. Each queue can use a different scheduling algorithm (e.g., FCFS, RR).",
    };

    // Energy consumption factors for different task priorities
    const energyFactors = {
      1: 2.5,  // System tasks (high priority) consume more energy
      2: 1.8,  // Interactive tasks
      3: 1.0   // Background tasks (low priority) are energy efficient
    };

    const priorityNames = {
      1: "System",
      2: "Interactive",
      3: "Background"
    };

    const priorityColors = {
      1: 'rgba(255, 99, 132, 0.7)',
      2: 'rgba(54, 162, 235, 0.7)',
      3: 'rgba(75, 192, 192, 0.7)'
    };

    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.className = `toast ${type}`;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }

    function addTask() {
      const arrivalTime = document.getElementById('arrivalTime').value;
      const burstTime = document.getElementById('burstTime').value;
      const priority = document.getElementById('priority').value;

      if (!arrivalTime || !burstTime || arrivalTime < 0 || burstTime <= 0) {
        showToast('Please enter valid arrival and burst times.', 'error');
        return;
      }

      const task = {
        id: taskIdCounter++,
        arrivalTime: parseInt(arrivalTime),
        burstTime: parseInt(burstTime),
        priority: priority ? parseInt(priority) : null,
      };

      tasks.push(task);
      updateTaskTable();
      document.getElementById('arrivalTime').value = '';
      document.getElementById('burstTime').value = '';
      document.getElementById('priority').value = '';
      showToast('Task added successfully!');
    }

    function editTask(taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newArrivalTime = prompt('Enter new arrival time:', task.arrivalTime);
      const newBurstTime = prompt('Enter new burst time:', task.burstTime);
      const newPriority = prompt('Enter new priority (1: System, 2: Interactive, 3: Background):', task.priority);

      if (newArrivalTime === null || newBurstTime === null || newPriority === null) return;

      task.arrivalTime = parseInt(newArrivalTime);
      task.burstTime = parseInt(newBurstTime);
      task.priority = parseInt(newPriority);

      updateTaskTable();
      showToast('Task updated successfully!');
    }

    function deleteTask(taskId) {
      tasks = tasks.filter(t => t.id !== taskId);
      updateTaskTable();
      showToast('Task deleted successfully!');
    }

    function updateTaskTable() {
      const taskTableBody = document.getElementById('taskTableBody');
      taskTableBody.innerHTML = '';

      tasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${task.id}</td>
          <td>${task.arrivalTime}</td>
          <td>${task.burstTime}</td>
          <td>${task.priority ? priorityNames[task.priority] : '-'}</td>
          <td>
            <button class="edit-button" onclick="editTask(${task.id})">Edit</button>
            <button class="delete-button" onclick="deleteTask(${task.id})">Delete</button>
          </td>
        `;
        taskTableBody.appendChild(row);
      });
    }

    document.getElementById('algorithm').addEventListener('change', function () {
      const priorityInput = document.getElementById('priority');
      const timeQuantumInput = document.getElementById('timeQuantum');
      const algorithmDescription = document.getElementById('algorithmDescription');

      if (this.value === 'PriorityNP' || this.value === 'PriorityP' || this.value === 'MLQ') {
        priorityInput.classList.remove('hidden');
        timeQuantumInput.classList.remove('hidden');
      } else if (this.value === 'RR') {
        priorityInput.classList.add('hidden');
        timeQuantumInput.classList.remove('hidden');
      } else {
        priorityInput.classList.add('hidden');
        timeQuantumInput.classList.add('hidden');
      }

      algorithmDescription.innerHTML = algorithmDescriptions[this.value] || 'Select an algorithm to see its description.';
    });

    function clearData() {
      tasks = [];
      taskIdCounter = 1;
      updateTaskTable();
      document.getElementById('output').innerHTML = '';
      document.getElementById('chart').innerHTML = '';
      document.getElementById('ganttChart').innerHTML = '';
      document.getElementById('energyChart').innerHTML = '';
      document.getElementById('timeQuantum').value = '';
      document.getElementById('avgTurnaroundTime').textContent = '0.00';
      document.getElementById('avgWaitingTime').textContent = '0.00';
      document.getElementById('totalEnergy').textContent = '0';
      document.getElementById('energyEfficiency').textContent = '0%';
      document.getElementById('energyLevel').style.width = '0%';
      document.getElementById('energyLegend').innerHTML = `
        <div class="legend-item">
          <div class="legend-color" style="background-color: rgba(255, 99, 132, 0.7);"></div>
          <span class="priority-label">System Priority</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: rgba(54, 162, 235, 0.7);"></div>
          <span class="priority-label">Interactive Priority</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: rgba(75, 192, 192, 0.7);"></div>
          <span class="priority-label">Background Priority</span>
        </div>
      `;
      if (energyChart) {
        energyChart.destroy();
        energyChart = null;
      }
      if (priorityChart) {
        priorityChart.destroy();
        priorityChart = null;
      }
      showToast('Data cleared successfully!');
    }

    function exportTasks() {
      if (tasks.length === 0) {
        showToast('No tasks to export.', 'error');
        return;
      }

      const csvContent = "data:text/csv;charset=utf-8," +
        "Task ID,Arrival Time,Burst Time,Priority\n" +
        tasks.map(task => `${task.id},${task.arrivalTime},${task.burstTime},${task.priority || ''}`).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "tasks.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Tasks exported successfully!');
    }

    function importTasks() {
      const fileInput = document.getElementById('importFile');
      fileInput.click();

      fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          const text = e.target.result;
          const rows = text.split('\n').slice(1); // Skip header row
          tasks = [];
          taskIdCounter = 1;

          rows.forEach(row => {
            const [id, arrivalTime, burstTime, priority] = row.split(',');
            if (arrivalTime && burstTime) {
              tasks.push({
                id: taskIdCounter++,
                arrivalTime: parseInt(arrivalTime),
                burstTime: parseInt(burstTime),
                priority: priority ? parseInt(priority) : null,
              });
            }
          });

          updateTaskTable();
          showToast('Tasks imported successfully!');
        };
        reader.readAsText(file);
      });
    }

    function fcfsScheduler(tasks) {
      tasks.sort((a, b) => a.arrivalTime - b.arrivalTime);
      const schedule = [];
      let currentTime = 0;

      tasks.forEach(task => {
        schedule.push({
          taskId: task.id,
          arrivalTime: task.arrivalTime,
          startTime: currentTime,
          endTime: currentTime + task.burstTime,
          burstTime: task.burstTime,
          priority: task.priority || 2, // Default to interactive priority
        });
        currentTime += task.burstTime;
      });

      return schedule;
    }

    function sjfScheduler(tasks) {
      tasks.sort((a, b) => a.burstTime - b.burstTime);
      const schedule = [];
      let currentTime = 0;

      tasks.forEach(task => {
        schedule.push({
          taskId: task.id,
          arrivalTime: task.arrivalTime,
          startTime: currentTime,
          endTime: currentTime + task.burstTime,
          burstTime: task.burstTime,
          priority: task.priority || 2,
        });
        currentTime += task.burstTime;
      });

      return schedule;
    }

    function priorityNPScheduler(tasks) {
      tasks.sort((a, b) => b.priority - a.priority);
      const schedule = [];
      let currentTime = 0;

      tasks.forEach(task => {
        schedule.push({
          taskId: task.id,
          arrivalTime: task.arrivalTime,
          startTime: currentTime,
          endTime: currentTime + task.burstTime,
          burstTime: task.burstTime,
          priority: task.priority,
        });
        currentTime += task.burstTime;
      });

      return schedule;
    }

    function priorityPScheduler(tasks) {
      let currentTime = 0;
      const schedule = [];
      const queue = [];

      while (tasks.length > 0 || queue.length > 0) {
        while (tasks.length > 0 && tasks[0].arrivalTime <= currentTime) {
          queue.push(tasks.shift());
        }

        if (queue.length === 0) {
          currentTime = tasks[0].arrivalTime;
          continue;
        }

        queue.sort((a, b) => b.priority - a.priority);
        const task = queue[0];

        schedule.push({
          taskId: task.id,
          arrivalTime: task.arrivalTime,
          startTime: currentTime,
          endTime: currentTime + 1,
          burstTime: 1,
          priority: task.priority,
        });

        task.burstTime -= 1;
        currentTime += 1;

        if (task.burstTime === 0) {
          queue.shift();
        }
      }

      return schedule;
    }

    function roundRobinScheduler(tasks, timeQuantum) {
      let currentTime = 0;
      const queue = [...tasks];
      const schedule = [];

      while (queue.length > 0) {
        const task = queue.shift();
        if (currentTime < task.arrivalTime) {
          currentTime = task.arrivalTime;
        }

        const executionTime = Math.min(timeQuantum, task.burstTime);
        schedule.push({
          taskId: task.id,
          arrivalTime: task.arrivalTime,
          startTime: currentTime,
          endTime: currentTime + executionTime,
          burstTime: executionTime,
          priority: task.priority || 2,
        });

        task.burstTime -= executionTime;
        currentTime += executionTime;

        if (task.burstTime > 0) {
          queue.push(task);
        }
      }

      return schedule;
    }

    function srtfScheduler(tasks) {
      let currentTime = 0;
      const schedule = [];
      const queue = [];

      while (tasks.length > 0 || queue.length > 0) {
        while (tasks.length > 0 && tasks[0].arrivalTime <= currentTime) {
          queue.push(tasks.shift());
        }

        if (queue.length === 0) {
          currentTime = tasks[0].arrivalTime;
          continue;
        }

        queue.sort((a, b) => a.burstTime - b.burstTime);
        const task = queue[0];

        schedule.push({
          taskId: task.id,
          arrivalTime: task.arrivalTime,
          startTime: currentTime,
          endTime: currentTime + 1,
          burstTime: 1,
          priority: task.priority || 2,
        });

        task.burstTime -= 1;
        currentTime += 1;

        if (task.burstTime === 0) {
          queue.shift();
        }
      }

      return schedule;
    }

    function mlqScheduler(tasks, timeQuantum) {
      const systemQueue = tasks.filter(task => task.priority === 1);
      const interactiveQueue = tasks.filter(task => task.priority === 2);
      const backgroundQueue = tasks.filter(task => task.priority === 3);

      const systemSchedule = fcfsScheduler(systemQueue);
      const interactiveSchedule = roundRobinScheduler(interactiveQueue, timeQuantum);
      const backgroundSchedule = fcfsScheduler(backgroundQueue);

      return [...systemSchedule, ...interactiveSchedule, ...backgroundSchedule];
    }

    function generateGanttChart(schedule) {
      const ganttChart = document.getElementById('ganttChart');
      ganttChart.innerHTML = '';

      schedule.forEach(task => {
        const ganttBar = document.createElement('div');
        ganttBar.className = 'gantt-bar';
        ganttBar.style.width = `${(task.endTime - task.startTime) * 20}px`;
        ganttBar.textContent = `Task ${task.taskId} (${task.startTime}-${task.endTime})`;
        ganttBar.style.backgroundColor = priorityColors[task.priority] || '#007bff';
        ganttChart.appendChild(ganttBar);
      });
    }

    function calculateEnergyConsumption(schedule) {
      let totalEnergy = 0;
      const taskEnergy = {};
      const priorityEnergy = {
        1: 0, // System
        2: 0, // Interactive
        3: 0  // Background
      };
      
      schedule.forEach(task => {
        // Calculate energy based on priority and burst time
        const priority = task.priority || 2; // Default to interactive priority
        const energyFactor = energyFactors[priority] || 1.5; // Default factor
        const taskEnergyConsumed = task.burstTime * energyFactor;
        
        totalEnergy += taskEnergyConsumed;
        priorityEnergy[priority] += taskEnergyConsumed;
        
        // Track energy per task for the chart
        if (!taskEnergy[task.taskId]) {
          taskEnergy[task.taskId] = 0;
        }
        taskEnergy[task.taskId] += taskEnergyConsumed;
      });
      
      // Calculate energy efficiency (lower is better)
      const totalBurstTime = schedule.reduce((sum, task) => sum + task.burstTime, 0);
      const energyEfficiency = Math.round((1 - (totalEnergy / (totalBurstTime * 2.5))) * 100); // 2.5 is max possible factor
      
      return {
        totalEnergy: Math.round(totalEnergy),
        taskEnergy,
        priorityEnergy,
        energyEfficiency: Math.max(0, energyEfficiency) // Ensure it's not negative
      };
    }

    function generateEnergyChart(schedule, energyData) {
      const ctx = document.getElementById('energyChart').getContext('2d');
      const legendContainer = document.getElementById('energyLegend');
      
      // Destroy previous chart if it exists
      if (energyChart) {
        energyChart.destroy();
      }
      
      // Prepare data for the chart
      const taskLabels = Object.keys(energyData.taskEnergy).map(id => `Task ${id}`);
      const energyValues = Object.values(energyData.taskEnergy);
      const backgroundColors = Object.keys(energyData.taskEnergy).map(id => {
        const task = schedule.find(t => t.taskId == id);
        return priorityColors[task.priority] || 'rgba(201, 203, 207, 0.7)';
      });
      
      // Create the chart
      energyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: taskLabels,
          datasets: [{
            label: 'Energy Consumption per Task',
            data: energyValues,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Energy Units'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Tasks'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Task Energy Consumption Distribution',
              font: {
                size: 16
              }
            },
            tooltip: {
              callbacks: {
                afterLabel: function(context) {
                  const taskId = context.label.replace('Task ', '');
                  const task = schedule.find(t => t.taskId == taskId);
                  return `Priority: ${priorityNames[task.priority] || 'N/A'}`;
                }
              }
            },
            legend: {
              display: false
            }
          }
        }
      });
      
      // Update legend (already exists in HTML)
    }
    
    function generatePriorityPieChart(energyData) {
      const priorityCtx = document.getElementById('priorityChart').getContext('2d');
      
      // Destroy previous chart if it exists
      if (priorityChart) {
        priorityChart.destroy();
      }
      
      priorityChart = new Chart(priorityCtx, {
        type: 'pie',
        data: {
          labels: Object.entries(priorityNames).map(([_, name]) => name),
          datasets: [{
            data: Object.entries(energyData.priorityEnergy).map(([_, energy]) => energy),
            backgroundColor: Object.entries(priorityColors).map(([_, color]) => color),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Energy Consumption by Priority',
              font: {
                size: 14
              }
            },
            legend: {
              position: 'right'
            }
          }
        }
      });
    }

    function calculateMetrics(schedule) {
      let totalTurnaroundTime = 0;
      let totalWaitingTime = 0;

      schedule.forEach(task => {
        const turnaroundTime = task.endTime - task.arrivalTime;
        const waitingTime = turnaroundTime - task.burstTime;

        totalTurnaroundTime += turnaroundTime;
        totalWaitingTime += waitingTime;
      });

      const averageTurnaroundTime = totalTurnaroundTime / schedule.length;
      const averageWaitingTime = totalWaitingTime / schedule.length;

      return {
        averageTurnaroundTime,
        averageWaitingTime,
      };
    }

    function simulate() {
      const algorithm = document.getElementById('algorithm').value;
      const mode = document.getElementById('mode').value;
      const timeQuantum = parseFloat(document.getElementById('timeQuantum').value);

      if (tasks.length === 0) {
        showToast('Please add at least one task before simulating.', 'error');
        return;
      }

      let schedule;
      switch (algorithm) {
        case 'FCFS':
          schedule = fcfsScheduler([...tasks]);
          break;
        case 'SJF':
          schedule = sjfScheduler([...tasks]);
          break;
        case 'PriorityNP':
          if (tasks.some(t => t.priority === null || t.priority === undefined)) {
            showToast('Please set priorities for all tasks when using Priority Scheduling.', 'error');
            return;
          }
          schedule = priorityNPScheduler([...tasks]);
          break;
        case 'PriorityP':
          if (tasks.some(t => t.priority === null || t.priority === undefined)) {
            showToast('Please set priorities for all tasks when using Priority Scheduling.', 'error');
            return;
          }
          schedule = priorityPScheduler([...tasks]);
          break;
        case 'RR':
          if (isNaN(timeQuantum) || timeQuantum <= 0) {
            showToast('Please enter a valid time quantum for Round Robin.', 'error');
            return;
          }
          schedule = roundRobinScheduler([...tasks], timeQuantum);
          break;
        case 'SRTF':
          schedule = srtfScheduler([...tasks]);
          break;
        case 'MLQ':
          if (isNaN(timeQuantum) || timeQuantum <= 0) {
            showToast('Please enter a valid time quantum for Multilevel Queue Scheduling.', 'error');
            return;
          }
          if (tasks.some(t => t.priority === null || t.priority === undefined)) {
            showToast('Please set priorities for all tasks when using MLQ Scheduling.', 'error');
            return;
          }
          schedule = mlqScheduler([...tasks], timeQuantum);
          break;
        default:
          showToast('Invalid algorithm selected.', 'error');
          return;
      }

      // Apply mode-specific adjustments
      let energyAdjustment = 1.0;
      if (mode === 'eco') {
        schedule = schedule.map(task => ({
          ...task,
          burstTime: Math.ceil(task.burstTime * 0.8),
        }));
        energyAdjustment = 0.8;
      } else if (mode === 'balanced') {
        schedule = schedule.map(task => ({
          ...task,
          burstTime: Math.ceil(task.burstTime * 0.9),
        }));
        energyAdjustment = 0.9;
      }

      const metrics = calculateMetrics(schedule);
      const energyData = calculateEnergyConsumption(schedule);
      
      // Apply mode adjustment to energy
      energyData.totalEnergy = Math.round(energyData.totalEnergy * energyAdjustment);
      energyData.energyEfficiency = Math.min(100, Math.round(energyData.energyEfficiency / energyAdjustment));

      // Update UI with metrics
      document.getElementById('avgTurnaroundTime').textContent = metrics.averageTurnaroundTime.toFixed(2);
      document.getElementById('avgWaitingTime').textContent = metrics.averageWaitingTime.toFixed(2);
      document.getElementById('totalEnergy').textContent = energyData.totalEnergy;
      document.getElementById('energyEfficiency').textContent = `${energyData.energyEfficiency}%`;
      
      // Update energy meter
      const energyLevel = document.getElementById('energyLevel');
      const energyPercentage = Math.min(100, Math.round(energyData.totalEnergy / 50 * 100)); // Assuming 50 is max for visualization
      energyLevel.style.width = `${energyPercentage}%`;
      
      // Set color based on efficiency
      if (energyData.energyEfficiency > 70) {
        energyLevel.style.background = 'linear-gradient(to right, #4CAF50, #8BC34A)';
      } else if (energyData.energyEfficiency > 40) {
        energyLevel.style.background = 'linear-gradient(to right, #FFC107, #FF9800)';
      } else {
        energyLevel.style.background = 'linear-gradient(to right, #F44336, #E91E63)';
      }

      // Generate output
      const output = document.getElementById('output');
      output.innerHTML = `
        <h3>Simulation Results (${algorithm} - ${mode})</h3>
        <h4>Task Schedule:</h4>
        ${schedule.map(task => `
          <div class="task">
            <p>Task ID: ${task.taskId}</p>
            <p>Start Time: ${task.startTime} units</p>
            <p>End Time: ${task.endTime} units</p>
            <p>Burst Time: ${task.burstTime} units</p>
            <p>Priority: ${task.priority ? priorityNames[task.priority] : 'N/A'}</p>
            <p>Energy Consumed: ${Math.round((task.burstTime * (energyFactors[task.priority] || 1.5)) * energyAdjustment)} units</p>
          </div>
        `).join('')}
      `;

      generateGanttChart(schedule);
      generateEnergyChart(schedule, energyData);
      generatePriorityPieChart(energyData);
 
      showToast('Simulation completed successfully!');
    }
  </script>
</body>
</html>
