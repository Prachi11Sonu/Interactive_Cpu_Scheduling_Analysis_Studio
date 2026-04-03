let tasks = [];
    let taskIdCounter = 1;
    let energyChart = null;
    let priorityChart = null;
    let tradeoffChart = null;
    let playbackTimer = null;
    let playbackIndex = 0;
    let lastSimulation = null;
    let lastTradeoffResults = [];
    let challengeState = null;

    const algorithmDescriptions = {
      FCFS: "First-Come, First-Served (FCFS): Tasks are executed in the order they arrive. Simple and fair, but may lead to long waiting times for short tasks.",
      SJF: "Shortest Job First (SJF): Tasks with the shortest burst time are executed first. Minimizes average waiting time but requires knowledge of burst times.",
      PriorityNP: "Priority Scheduling (Non-Preemptive): Tasks are executed based on priority. Higher priority tasks are executed first, but once a task starts, it runs to completion.",
      PriorityP: "Priority Scheduling (Preemptive): Tasks are executed based on priority, and higher priority tasks can preempt lower priority ones. Ensures high-priority tasks are handled quickly.",
      RR: "Round Robin (RR): Each task is given a fixed time slice (time quantum). Tasks are executed in a circular order, ensuring fair CPU time allocation.",
      SRTF: "Shortest Remaining Time First (SRTF): The task with the shortest remaining burst time is executed next. Preemptive version of SJF, minimizing waiting time.",
      MLQ: "Multilevel Queue Scheduling (MLQ): Tasks are divided into multiple queues based on priority. Each queue can use a different scheduling algorithm (e.g., FCFS, RR).",
      CUSTOM: "Custom Hybrid Scheduler: You choose queue-specific policies and an aging interval to build an adaptive scheduler for your own operating-system strategy.",
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
      1: 'rgba(3, 52, 110, 0.92)',
      2: 'rgba(110, 172, 218, 0.9)',
      3: 'rgba(226, 226, 182, 0.92)'
    };

    function getThemePalette() {
      const styles = getComputedStyle(document.body);
      const textColor = styles.getPropertyValue('--text').trim() || '#021526';
      const lineColor = styles.getPropertyValue('--line-strong').trim() || 'rgba(3, 52, 110, 0.22)';
      return {
        textColor,
        gridColor: lineColor,
        priorityColors: [
          priorityColors[1],
          priorityColors[2],
          priorityColors[3]
        ],
        bubbleColors: [
          'rgba(3, 52, 110, 0.78)',
          'rgba(110, 172, 218, 0.82)',
          'rgba(226, 226, 182, 0.88)',
          'rgba(48, 119, 103, 0.82)'
        ]
      };
    }

    const workloadPresets = {
      student: {
        name: "Student Multitasking",
        description: "A balanced mix of interactive and background tasks such as browsing, coding, and music playback.",
        tasks: [
          { arrivalTime: 0, burstTime: 4, priority: 2 },
          { arrivalTime: 1, burstTime: 7, priority: 3 },
          { arrivalTime: 2, burstTime: 3, priority: 1 },
          { arrivalTime: 4, burstTime: 5, priority: 2 }
        ]
      },
      gaming: {
        name: "Gaming Session",
        description: "Fast user-facing actions with a few high-priority system tasks competing for CPU time.",
        tasks: [
          { arrivalTime: 0, burstTime: 6, priority: 1 },
          { arrivalTime: 1, burstTime: 2, priority: 2 },
          { arrivalTime: 3, burstTime: 4, priority: 2 },
          { arrivalTime: 5, burstTime: 8, priority: 3 }
        ]
      },
      server: {
        name: "API Server Rush",
        description: "A bursty backend load where fairness and response time matter under sustained pressure.",
        tasks: [
          { arrivalTime: 0, burstTime: 10, priority: 1 },
          { arrivalTime: 1, burstTime: 4, priority: 2 },
          { arrivalTime: 2, burstTime: 3, priority: 2 },
          { arrivalTime: 3, burstTime: 6, priority: 1 },
          { arrivalTime: 5, burstTime: 5, priority: 3 }
        ]
      },
      mobile: {
        name: "Mobile Battery Saver",
        description: "Short bursts of interaction with more emphasis on energy-aware execution.",
        tasks: [
          { arrivalTime: 0, burstTime: 2, priority: 2 },
          { arrivalTime: 1, burstTime: 5, priority: 3 },
          { arrivalTime: 3, burstTime: 2, priority: 2 },
          { arrivalTime: 4, burstTime: 1, priority: 1 },
          { arrivalTime: 6, burstTime: 4, priority: 3 }
        ]
      },
      hospital: {
        name: "Emergency Hospital Monitor",
        description: "Critical alerts, nurse station actions, and background record syncing all compete for CPU time.",
        tasks: [
          { arrivalTime: 0, burstTime: 3, priority: 1 },
          { arrivalTime: 1, burstTime: 2, priority: 1 },
          { arrivalTime: 2, burstTime: 5, priority: 2 },
          { arrivalTime: 4, burstTime: 7, priority: 3 },
          { arrivalTime: 5, burstTime: 3, priority: 2 }
        ]
      },
      streaming: {
        name: "Video Streaming Edge Node",
        description: "Latency-sensitive requests arrive beside transcoding and cache housekeeping jobs.",
        tasks: [
          { arrivalTime: 0, burstTime: 4, priority: 1 },
          { arrivalTime: 1, burstTime: 6, priority: 2 },
          { arrivalTime: 2, burstTime: 8, priority: 3 },
          { arrivalTime: 3, burstTime: 3, priority: 2 },
          { arrivalTime: 6, burstTime: 2, priority: 1 }
        ]
      },
      exam: {
        name: "Online Exam Portal",
        description: "Submission spikes and autosave traffic create a fairness-heavy scheduling challenge.",
        tasks: [
          { arrivalTime: 0, burstTime: 5, priority: 2 },
          { arrivalTime: 1, burstTime: 4, priority: 2 },
          { arrivalTime: 2, burstTime: 2, priority: 1 },
          { arrivalTime: 4, burstTime: 6, priority: 3 },
          { arrivalTime: 5, burstTime: 1, priority: 1 }
        ]
      },
      factory: {
        name: "Smart Factory Controller",
        description: "Machine control loops, operator dashboards, and batch analytics need reliable coordination.",
        tasks: [
          { arrivalTime: 0, burstTime: 3, priority: 1 },
          { arrivalTime: 1, burstTime: 5, priority: 2 },
          { arrivalTime: 2, burstTime: 4, priority: 1 },
          { arrivalTime: 4, burstTime: 7, priority: 3 },
          { arrivalTime: 6, burstTime: 3, priority: 2 }
        ]
      }
    };

    const algorithmLabelMap = {
      FCFS: "FCFS",
      SJF: "SJF",
      PriorityNP: "Priority NP",
      PriorityP: "Priority P",
      RR: "RR",
      SRTF: "SRTF",
      MLQ: "MLQ",
      CUSTOM: "Custom Hybrid"
    };

    const scenarioStories = {
      hospital: {
        title: 'Emergency Hospital Monitor',
        subtitle: 'Critical alerts, bedside updates, and record syncing compete for response time.',
        mood: ['Critical alerts', 'Patient dashboard', 'Background records'],
        beats: [
          'Emergency alarms must reach the CPU immediately with minimal waiting.',
          'Nurse station interactions need responsive handling without starving other tasks.',
          'Record sync and logs can wait longer, but should still finish reliably.'
        ],
        recommendation: 'Priority P or Custom Hybrid works well here because urgent tasks need immediate preemption.'
      },
      gaming: {
        title: 'Competitive Gaming Session',
        subtitle: 'Frame-critical actions, chat overlays, and background services share CPU time.',
        mood: ['Frame pacing', 'Player input', 'System helpers'],
        beats: [
          'Player input and frame updates need low waiting time to preserve responsiveness.',
          'Voice chat and streaming overlays need fairness to avoid glitches.',
          'Background updaters should stay out of the way unless the system is idle.'
        ],
        recommendation: 'RR or SRTF often feels best here because responsiveness matters more than long-batch throughput.'
      },
      server: {
        title: 'API Server Rush',
        subtitle: 'Incoming requests, auth checks, and cache jobs create a bursty backend load.',
        mood: ['Incoming requests', 'Latency spikes', 'Maintenance jobs'],
        beats: [
          'Short request handlers should not get stuck behind long-running jobs.',
          'High concurrency increases context switching pressure.',
          'Background maintenance needs to finish without damaging request latency.'
        ],
        recommendation: 'SJF, SRTF, or a careful Custom Hybrid usually performs well because many requests are short.'
      },
      factory: {
        title: 'Smart Factory Controller',
        subtitle: 'Control loops, operator dashboards, and analytics jobs need predictable execution.',
        mood: ['Control loop', 'Operator UI', 'Batch analytics'],
        beats: [
          'Machine control tasks need timely CPU access for stable operations.',
          'Dashboards should remain responsive for operators on the floor.',
          'Analytics can run later as long as they do not delay control decisions.'
        ],
        recommendation: 'MLQ or Custom Hybrid fits this well because different task classes need different policies.'
      }
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

    function loadPreset() {
      const presetKey = document.getElementById('presetSelector').value;
      const preset = workloadPresets[presetKey];

      if (!preset) {
        showToast('Please choose a preset workload first.', 'error');
        return;
      }

      tasks = preset.tasks.map((task, index) => ({
        id: index + 1,
        arrivalTime: task.arrivalTime,
        burstTime: task.burstTime,
        priority: task.priority
      }));
      taskIdCounter = tasks.length + 1;
      updateTaskTable();
      document.getElementById('output').innerHTML = `
        <div class="insight-card">
          <h3>${preset.name} Loaded</h3>
          <p>${preset.description}</p>
          <p>This preset is ready for a normal simulation or a full algorithm comparison.</p>
        </div>
      `;
      if (scenarioStories[presetKey]) {
        document.getElementById('storyScenario').value = presetKey;
        playScenarioStory();
      }
      showToast(`${preset.name} preset loaded successfully!`);
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

      updateHeroSignals();
      renderWorkloadFingerprint();
    }

    document.getElementById('algorithm').addEventListener('change', function () {
      const priorityInput = document.getElementById('priority');
      const timeQuantumInput = document.getElementById('timeQuantum');
      const algorithmDescription = document.getElementById('algorithmDescription');

      if (this.value === 'MLQ' || this.value === 'CUSTOM') {
        priorityInput.classList.remove('hidden');
        timeQuantumInput.classList.remove('hidden');
      } else if (this.value === 'PriorityNP' || this.value === 'PriorityP') {
        priorityInput.classList.remove('hidden');
        timeQuantumInput.classList.add('hidden');
      } else if (this.value === 'RR') {
        priorityInput.classList.add('hidden');
        timeQuantumInput.classList.remove('hidden');
      } else {
        priorityInput.classList.add('hidden');
        timeQuantumInput.classList.add('hidden');
      }

      algorithmDescription.innerHTML = algorithmDescriptions[this.value] || 'Select an algorithm to see its description.';
      updateHeroSignals();
    });

    document.getElementById('mode').addEventListener('change', function () {
      updateHeroSignals();
    });

    function clearData() {
      pauseTimeline();
      tasks = [];
      taskIdCounter = 1;
      lastSimulation = null;
      updateTaskTable();
      document.getElementById('output').innerHTML = '';
      document.getElementById('chart').innerHTML = '';
      document.getElementById('ganttChart').innerHTML = '';
      document.getElementById('timeQuantum').value = '';
      document.getElementById('customQuantum').value = '2';
      document.getElementById('avgTurnaroundTime').textContent = '0.00';
      document.getElementById('avgWaitingTime').textContent = '0.00';
      document.getElementById('fairnessScore').textContent = '0';
      document.getElementById('contextSwitches').textContent = '0 switches';
      document.getElementById('totalEnergy').textContent = '0';
      document.getElementById('energyEfficiency').textContent = '0%';
      document.getElementById('energyLevel').style.width = '0%';
      document.getElementById('presetSelector').value = '';
      document.getElementById('shareSummary').textContent = 'No report generated yet.';
      document.getElementById('headToHeadResult').textContent = 'Pick two algorithms to compare their waiting time, fairness, and energy side by side.';
      document.getElementById('naturalLanguageWorkload').value = '';
      document.getElementById('challengeAnswer').textContent = '';
      document.getElementById('timelineStatus').textContent = 'Run a simulation to watch step-by-step playback.';
      document.getElementById('detectorPanel').innerHTML = `
        <div class="panel-heading">
          <div>
            <p class="panel-kicker">Risk Signals</p>
            <h2>Starvation And Fairness</h2>
          </div>
        </div>
        <p class="mini-note">Simulation analysis will flag starvation risk, priority inversion hints, and overall fairness here.</p>
      `;
      document.getElementById('energyLegend').innerHTML = `
        <div class="legend-item">
          <div class="legend-color" style="background-color: rgba(3, 52, 110, 0.92);"></div>
          <span class="priority-label">System Priority</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: rgba(110, 172, 218, 0.9);"></div>
          <span class="priority-label">Interactive Priority</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: rgba(226, 226, 182, 0.92);"></div>
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
      if (tradeoffChart) {
        tradeoffChart.destroy();
        tradeoffChart = null;
      }
      lastTradeoffResults = [];
      updateStateBoard([], -1);
      renderWorkloadFingerprint();
      renderCoachPreview('');
      renderDualTimeline('');
      renderRecommendationAI('');
      renderStoryScene('');
      renderReportScorecard('');
      updateHeroSignals('Idle');
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

      fileInput.onchange = function (event) {
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
      };
    }

    function cloneTasks(taskList) {
      return taskList.map(task => ({ ...task }));
    }

    function getTimeQuantum() {
      const value = parseFloat(document.getElementById('timeQuantum').value);
      return Number.isNaN(value) ? null : value;
    }

    function validateSimulationInputs(algorithm, timeQuantum, taskList = tasks) {
      if (taskList.length === 0) {
        return 'Please add at least one task before simulating.';
      }

      if ((algorithm === 'PriorityNP' || algorithm === 'PriorityP' || algorithm === 'MLQ' || algorithm === 'CUSTOM') &&
        taskList.some(task => task.priority === null || task.priority === undefined)) {
        return 'Please set priorities for all tasks before using this algorithm.';
      }

      if ((algorithm === 'RR' || algorithm === 'MLQ' || algorithm === 'CUSTOM') && (timeQuantum === null || timeQuantum <= 0)) {
        return 'Please enter a valid time quantum for the selected algorithm.';
      }

      return null;
    }

    function createScheduleSlice(task, startTime, duration) {
      return {
        taskId: task.id,
        arrivalTime: task.arrivalTime,
        startTime,
        endTime: startTime + duration,
        burstTime: duration,
        priority: task.priority || 2,
      };
    }

    function shiftSchedule(schedule, offset) {
      return schedule.map(item => ({
        ...item,
        startTime: item.startTime + offset,
        endTime: item.endTime + offset
      }));
    }

    function getScheduleEnd(schedule) {
      return schedule.length ? schedule[schedule.length - 1].endTime : 0;
    }

    function getModeLabel(mode) {
      const labels = {
        standard: 'Standard mode',
        eco: 'Eco mode',
        balanced: 'Balanced mode'
      };
      return labels[mode] || 'Standard mode';
    }

    function getPriorityMixLabel(taskList = tasks) {
      if (!taskList.length) {
        return 'Mixed';
      }

      const counts = taskList.reduce((accumulator, task) => {
        const priority = task.priority || 2;
        accumulator[priority] = (accumulator[priority] || 0) + 1;
        return accumulator;
      }, {});

      const dominantPriority = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])[0];

      return dominantPriority ? `${priorityNames[dominantPriority[0]]} heavy` : 'Mixed';
    }

    function updateHeroSignals(timelineState) {
      const algorithmSelect = document.getElementById('algorithm');
      const modeSelect = document.getElementById('mode');
      const taskCountLabel = document.getElementById('heroTaskCount');
      const modeLabel = document.getElementById('heroModeLabel');
      const algorithmLabel = document.getElementById('activeAlgorithmLabel');
      const priorityMixLabel = document.getElementById('heroPriorityMix');
      const timelineLabel = document.getElementById('heroTimelineState');

      if (taskCountLabel) {
        taskCountLabel.textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;
      }

      if (modeLabel && modeSelect) {
        modeLabel.textContent = getModeLabel(modeSelect.value);
      }

      if (algorithmLabel && algorithmSelect) {
        algorithmLabel.textContent = algorithmLabelMap[algorithmSelect.value] || algorithmSelect.value;
      }

      if (priorityMixLabel) {
        priorityMixLabel.textContent = getPriorityMixLabel();
      }

      if (timelineLabel) {
        if (timelineState) {
          timelineLabel.textContent = timelineState;
        } else if (lastSimulation) {
          timelineLabel.textContent = 'Ready';
        } else {
          timelineLabel.textContent = 'Idle';
        }
      }
    }

    function runScheduler(algorithm, taskList, timeQuantum) {
      const clonedTasks = cloneTasks(taskList);

      switch (algorithm) {
        case 'FCFS':
          return fcfsScheduler(clonedTasks);
        case 'SJF':
          return sjfScheduler(clonedTasks);
        case 'PriorityNP':
          return priorityNPScheduler(clonedTasks);
        case 'PriorityP':
          return priorityPScheduler(clonedTasks.sort((a, b) => a.arrivalTime - b.arrivalTime));
        case 'RR':
          return roundRobinScheduler(clonedTasks.sort((a, b) => a.arrivalTime - b.arrivalTime), timeQuantum);
        case 'SRTF':
          return srtfScheduler(clonedTasks.sort((a, b) => a.arrivalTime - b.arrivalTime));
        case 'MLQ':
          return mlqScheduler(clonedTasks.sort((a, b) => a.arrivalTime - b.arrivalTime), timeQuantum);
        case 'CUSTOM':
          return customHybridScheduler(clonedTasks.sort((a, b) => a.arrivalTime - b.arrivalTime), timeQuantum);
        default:
          throw new Error('Invalid algorithm selected.');
      }
    }

    function applyModeAdjustments(schedule, mode) {
      let modeMultiplier = 1;

      if (mode === 'eco') {
        modeMultiplier = 0.8;
      } else if (mode === 'balanced') {
        modeMultiplier = 0.9;
      }

      let currentTime = 0;
      const adjustedSchedule = schedule.map(task => {
        const adjustedBurst = Math.max(1, Math.ceil(task.burstTime * modeMultiplier));
        const adjustedStart = Math.max(currentTime, task.arrivalTime);
        currentTime = adjustedStart + adjustedBurst;

        return {
          ...task,
          startTime: adjustedStart,
          burstTime: adjustedBurst,
          endTime: currentTime
        };
      });

      return {
        adjustedSchedule,
        energyAdjustment: modeMultiplier
      };
    }

    function fcfsScheduler(tasks) {
      tasks.sort((a, b) => a.arrivalTime - b.arrivalTime);
      const schedule = [];
      let currentTime = 0;

      tasks.forEach(task => {
        currentTime = Math.max(currentTime, task.arrivalTime);
        schedule.push(createScheduleSlice(task, currentTime, task.burstTime));
        currentTime += task.burstTime;
      });

      return schedule;
    }

    function sjfScheduler(tasks) {
      const schedule = [];
      const pendingTasks = [...tasks].sort((a, b) => a.arrivalTime - b.arrivalTime);
      const readyQueue = [];
      let currentTime = pendingTasks.length ? pendingTasks[0].arrivalTime : 0;

      while (pendingTasks.length > 0 || readyQueue.length > 0) {
        while (pendingTasks.length > 0 && pendingTasks[0].arrivalTime <= currentTime) {
          readyQueue.push(pendingTasks.shift());
        }

        if (!readyQueue.length) {
          currentTime = pendingTasks[0].arrivalTime;
          continue;
        }

        readyQueue.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime || a.id - b.id);
        const task = readyQueue.shift();
        schedule.push(createScheduleSlice(task, currentTime, task.burstTime));
        currentTime += task.burstTime;
      }

      return schedule;
    }

    function priorityNPScheduler(tasks) {
      const schedule = [];
      const pendingTasks = [...tasks].sort((a, b) => a.arrivalTime - b.arrivalTime);
      const readyQueue = [];
      let currentTime = pendingTasks.length ? pendingTasks[0].arrivalTime : 0;

      while (pendingTasks.length > 0 || readyQueue.length > 0) {
        while (pendingTasks.length > 0 && pendingTasks[0].arrivalTime <= currentTime) {
          readyQueue.push(pendingTasks.shift());
        }

        if (!readyQueue.length) {
          currentTime = pendingTasks[0].arrivalTime;
          continue;
        }

        readyQueue.sort((a, b) => (a.priority || 2) - (b.priority || 2) || a.arrivalTime - b.arrivalTime || a.id - b.id);
        const task = readyQueue.shift();
        schedule.push(createScheduleSlice(task, currentTime, task.burstTime));
        currentTime += task.burstTime;
      }

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

        queue.sort((a, b) => (a.priority || 2) - (b.priority || 2) || a.arrivalTime - b.arrivalTime || a.id - b.id);
        const task = queue[0];

        schedule.push(createScheduleSlice(task, currentTime, 1));

        task.burstTime -= 1;
        currentTime += 1;

        if (task.burstTime === 0) {
          queue.shift();
        }
      }

      return schedule;
    }

    function roundRobinScheduler(tasks, timeQuantum) {
      const pendingTasks = [...tasks].sort((a, b) => a.arrivalTime - b.arrivalTime);
      const queue = [];
      const schedule = [];
      let currentTime = pendingTasks.length ? pendingTasks[0].arrivalTime : 0;

      while (pendingTasks.length > 0 || queue.length > 0) {
        while (pendingTasks.length > 0 && pendingTasks[0].arrivalTime <= currentTime) {
          queue.push(pendingTasks.shift());
        }

        if (!queue.length) {
          currentTime = pendingTasks[0].arrivalTime;
          continue;
        }

        const task = queue.shift();
        const executionTime = Math.min(timeQuantum, task.burstTime);
        schedule.push(createScheduleSlice(task, currentTime, executionTime));

        task.burstTime -= executionTime;
        currentTime += executionTime;

        while (pendingTasks.length > 0 && pendingTasks[0].arrivalTime <= currentTime) {
          queue.push(pendingTasks.shift());
        }

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

        schedule.push(createScheduleSlice(task, currentTime, 1));

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
      const interactiveSchedule = shiftSchedule(roundRobinScheduler(interactiveQueue, timeQuantum), getScheduleEnd(systemSchedule));
      const backgroundSchedule = shiftSchedule(fcfsScheduler(backgroundQueue), getScheduleEnd(interactiveSchedule));

      return [...systemSchedule, ...interactiveSchedule, ...backgroundSchedule];
    }

    function scheduleByPolicy(taskList, policy, timeQuantum) {
      const cloned = cloneTasks(taskList).sort((a, b) => a.arrivalTime - b.arrivalTime);
      if (policy === 'SJF') {
        return sjfScheduler(cloned);
      }
      if (policy === 'RR') {
        return roundRobinScheduler(cloned, timeQuantum);
      }
      return fcfsScheduler(cloned);
    }

    function customHybridScheduler(tasks, timeQuantum) {
      const systemPolicy = document.getElementById('customSystemPolicy').value;
      const interactivePolicy = document.getElementById('customInteractivePolicy').value;
      const backgroundPolicy = document.getElementById('customBackgroundPolicy').value;
      const agingBoost = parseInt(document.getElementById('agingBoost').value, 10) || 5;

      const agedTasks = tasks.map(task => {
        const agedPriority = task.arrivalTime >= agingBoost && task.priority > 1 ? task.priority - 1 : task.priority;
        return { ...task, priority: agedPriority };
      });

      const systemQueue = agedTasks.filter(task => task.priority === 1);
      const interactiveQueue = agedTasks.filter(task => task.priority === 2);
      const backgroundQueue = agedTasks.filter(task => task.priority === 3);

      const systemSchedule = scheduleByPolicy(systemQueue, systemPolicy, timeQuantum);
      const interactiveSchedule = shiftSchedule(
        scheduleByPolicy(interactiveQueue, interactivePolicy, timeQuantum),
        getScheduleEnd(systemSchedule)
      );
      const backgroundSchedule = shiftSchedule(
        scheduleByPolicy(backgroundQueue, backgroundPolicy, timeQuantum),
        getScheduleEnd(interactiveSchedule)
      );

      return [...systemSchedule, ...interactiveSchedule, ...backgroundSchedule];
    }

    function generateGanttChart(schedule) {
      const ganttChart = document.getElementById('ganttChart');
      ganttChart.innerHTML = '';

      schedule.forEach((task, index) => {
        const ganttBar = document.createElement('div');
        ganttBar.className = 'gantt-bar';
        ganttBar.dataset.index = index;
        ganttBar.style.width = `${Math.max(104, (task.endTime - task.startTime) * 28)}px`;
        ganttBar.style.backgroundColor = priorityColors[task.priority] || '#007bff';
        ganttBar.innerHTML = `
          <span class="gantt-title">Task ${task.taskId}</span>
          <span class="gantt-range">${task.startTime} - ${task.endTime}</span>
        `;
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
      const themePalette = getThemePalette();
      
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
                text: 'Energy Units',
                color: themePalette.textColor
              },
              ticks: {
                color: themePalette.textColor
              },
              grid: {
                color: themePalette.gridColor
              }
            },
            x: {
              title: {
                display: true,
                text: 'Tasks',
                color: themePalette.textColor
              },
              ticks: {
                color: themePalette.textColor
              },
              grid: {
                color: themePalette.gridColor
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Task Energy Consumption Distribution',
              font: {
                size: 16
              },
              color: themePalette.textColor
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
      
    }
    
    function generatePriorityPieChart(energyData) {
      const priorityCtx = document.getElementById('priorityChart').getContext('2d');
      const themePalette = getThemePalette();
      
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
              },
              color: themePalette.textColor
            },
            legend: {
              position: 'right',
              labels: {
                color: themePalette.textColor
              }
            }
          }
        }
      });
    }

    function generateTradeoffChart(results) {
      const tradeoffCtx = document.getElementById('tradeoffChart').getContext('2d');
      const themePalette = getThemePalette();
      lastTradeoffResults = results;

      if (tradeoffChart) {
        tradeoffChart.destroy();
      }

      tradeoffChart = new Chart(tradeoffCtx, {
        type: 'bubble',
        data: {
          datasets: results.map((result, index) => ({
            label: algorithmLabelMap[result.algorithm],
            data: [{
              x: Number(result.metrics.averageWaitingTime.toFixed(2)),
              y: result.energyData.totalEnergy,
              r: Math.max(8, Math.round(result.metrics.fairnessScore / 8))
            }],
            backgroundColor: themePalette.bubbleColors[index % themePalette.bubbleColors.length]
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Average Waiting Time',
                color: themePalette.textColor
              },
              ticks: {
                color: themePalette.textColor
              },
              grid: {
                color: themePalette.gridColor
              }
            },
            y: {
              title: {
                display: true,
                text: 'Energy Consumption',
                color: themePalette.textColor
              },
              ticks: {
                color: themePalette.textColor
              },
              grid: {
                color: themePalette.gridColor
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Tradeoff Map: lower-left is ideal',
              color: themePalette.textColor
            },
            legend: {
              labels: {
                color: themePalette.textColor
              }
            }
          }
        }
      });
    }

    function calculateMetrics(schedule) {
      let totalTurnaroundTime = 0;
      let totalWaitingTime = 0;
      const completionMap = {};
      const arrivalMap = {};
      const totalBurstMap = {};

      schedule.forEach(task => {
        completionMap[task.taskId] = Math.max(completionMap[task.taskId] || 0, task.endTime);
        arrivalMap[task.taskId] = task.arrivalTime;
        totalBurstMap[task.taskId] = (totalBurstMap[task.taskId] || 0) + task.burstTime;
      });

      const taskIds = Object.keys(completionMap);
      taskIds.forEach(taskId => {
        const turnaroundTime = completionMap[taskId] - arrivalMap[taskId];
        const waitingTime = turnaroundTime - totalBurstMap[taskId];
        totalTurnaroundTime += turnaroundTime;
        totalWaitingTime += waitingTime;
      });

      const averageTurnaroundTime = taskIds.length ? totalTurnaroundTime / taskIds.length : 0;
      const averageWaitingTime = taskIds.length ? totalWaitingTime / taskIds.length : 0;
      const contextSwitches = Math.max(0, schedule.length - 1);
      const fairnessScore = Math.max(0, Math.round(100 - (averageWaitingTime * 6) - (contextSwitches * 2)));

      return {
        averageTurnaroundTime,
        averageWaitingTime,
        contextSwitches,
        fairnessScore,
        completionMap,
        arrivalMap,
        totalBurstMap
      };
    }

    function scoreAlgorithm(metrics, energyData) {
      return (metrics.averageWaitingTime * 0.45) +
        (metrics.averageTurnaroundTime * 0.3) +
        (energyData.totalEnergy * 0.15) +
        (metrics.contextSwitches * 0.1);
    }

    function formatModeLabel(mode) {
      return mode.charAt(0).toUpperCase() + mode.slice(1);
    }

    function getPriorityDistribution(taskList = tasks) {
      const counts = { 1: 0, 2: 0, 3: 0 };
      taskList.forEach(task => {
        counts[task.priority || 2] += 1;
      });
      return counts;
    }

    function describeWorkload(taskList = tasks) {
      if (!taskList.length) {
        return {
          profile: 'No workload loaded',
          burstiness: 'None',
          intensity: 'Idle',
          dominantPriority: 'Mixed',
          arrivalSpan: 0,
          averageBurst: 0
        };
      }

      const arrivals = taskList.map(task => task.arrivalTime);
      const bursts = taskList.map(task => task.burstTime);
      const distribution = getPriorityDistribution(taskList);
      const averageBurst = bursts.reduce((sum, burst) => sum + burst, 0) / bursts.length;
      const arrivalSpan = Math.max(...arrivals) - Math.min(...arrivals);
      const burstSpread = Math.max(...bursts) - Math.min(...bursts);
      const dominantPriority = Object.entries(distribution)
        .sort((a, b) => b[1] - a[1])[0][0];

      let profile = 'Balanced desktop';
      if (burstSpread >= 5 || averageBurst >= 5) {
        profile = 'Bursty mixed load';
      }
      if (distribution[1] >= distribution[2] && distribution[1] >= distribution[3]) {
        profile = 'System-critical queue';
      } else if (distribution[3] > distribution[1] && averageBurst <= 3) {
        profile = 'Battery-friendly background load';
      }

      return {
        profile,
        burstiness: burstSpread >= 4 ? 'High variance' : burstSpread >= 2 ? 'Moderate variance' : 'Steady',
        intensity: averageBurst >= 5 ? 'Heavy CPU demand' : averageBurst >= 3 ? 'Moderate demand' : 'Light demand',
        dominantPriority: priorityNames[dominantPriority],
        arrivalSpan,
        averageBurst
      };
    }

    function renderWorkloadFingerprint() {
      const target = document.getElementById('workloadFingerprint');
      if (!target) return;

      if (!tasks.length) {
        target.innerHTML = '<p class="mini-note">Add or generate tasks to build a workload fingerprint.</p>';
        return;
      }

      const fingerprint = describeWorkload(tasks);
      target.innerHTML = `
        <div class="fingerprint-card">
          <h3>${fingerprint.profile}</h3>
          <p class="mini-note">This workload summary updates automatically as your task list changes.</p>
          <div class="fingerprint-grid">
            <div class="fingerprint-metric"><span>Burst Pattern</span><strong>${fingerprint.burstiness}</strong></div>
            <div class="fingerprint-metric"><span>CPU Demand</span><strong>${fingerprint.intensity}</strong></div>
            <div class="fingerprint-metric"><span>Priority Focus</span><strong>${fingerprint.dominantPriority}</strong></div>
            <div class="fingerprint-metric"><span>Arrival Span</span><strong>${fingerprint.arrivalSpan} units</strong></div>
          </div>
        </div>
      `;
    }

    function renderCoachPreview(html) {
      const target = document.getElementById('coachPreview');
      if (!target) return;
      target.innerHTML = html || '<p class="mini-note">Run a simulation to get an explanation of why the scheduler behaved the way it did.</p>';
    }

    function createCoachCard(algorithm, metrics, energyData, taskList = tasks) {
      const fingerprint = describeWorkload(taskList);
      let tip = `${algorithmLabelMap[algorithm]} is balancing this workload without major surprises.`;

      if (metrics.averageWaitingTime <= 2) {
        tip = `${algorithmLabelMap[algorithm]} is keeping queue delays low, so it fits response-sensitive workloads well.`;
      } else if (metrics.contextSwitches >= taskList.length) {
        tip = `${algorithmLabelMap[algorithm]} is switching often, which can improve responsiveness but adds overhead.`;
      } else if (energyData.energyEfficiency >= 70) {
        tip = `${algorithmLabelMap[algorithm]} is leaning toward energy efficiency, which fits background-heavy or eco-focused workloads.`;
      }

      return `
        <div class="coach-card">
          <h3>Guided Simulation Coach</h3>
          <p><strong>Workload read:</strong> ${fingerprint.profile} with ${fingerprint.burstiness.toLowerCase()} and ${fingerprint.dominantPriority.toLowerCase()} demand.</p>
          <p><strong>Why it behaved this way:</strong> ${tip}</p>
          <p><strong>What to try next:</strong> Compare this run with ${metrics.averageWaitingTime > 3 ? 'SJF or SRTF for lower waiting time' : 'Round Robin or Custom Hybrid for stronger fairness visibility'}.</p>
        </div>
      `;
    }

    function runAlgorithmScenario(algorithm, mode, timeQuantum) {
      const baseSchedule = runScheduler(algorithm, tasks, timeQuantum);
      const { adjustedSchedule, energyAdjustment } = applyModeAdjustments(baseSchedule, mode);
      const metrics = calculateMetrics(adjustedSchedule);
      const energyData = calculateEnergyConsumption(adjustedSchedule);
      energyData.totalEnergy = Math.round(energyData.totalEnergy * energyAdjustment);
      energyData.energyEfficiency = Math.min(100, Math.round(energyData.energyEfficiency / energyAdjustment));

      return {
        algorithm,
        schedule: adjustedSchedule,
        metrics,
        energyData
      };
    }

    function renderHeadToHeadResult(html) {
      const target = document.getElementById('headToHeadResult');
      if (!target) return;
      target.innerHTML = html;
    }

    function renderDualTimeline(html) {
      const target = document.getElementById('dualTimelineView');
      if (!target) return;
      target.innerHTML = html || 'Dual timeline view will appear here after you run the head-to-head comparison.';
    }

    function createMiniGanttHTML(schedule) {
      if (!schedule.length) {
        return '<p class="mini-note">No timeline available.</p>';
      }

      return `
        <div class="mini-gantt">
          ${schedule.map(task => `
            <div class="mini-gantt-bar" style="background-color:${priorityColors[task.priority] || '#007bff'}; min-width:${Math.max(74, task.burstTime * 22)}px">
              T${task.taskId}<br>${task.startTime}-${task.endTime}
            </div>
          `).join('')}
        </div>
      `;
    }

    function renderRecommendationAI(html) {
      const target = document.getElementById('nlRecommendation');
      if (!target) return;
      target.innerHTML = html || '<p class="mini-note">Describe the type of tasks, priorities, and whether you care more about responsiveness, fairness, or energy.</p>';
    }

    function analyzeWorkloadIntent() {
      const input = (document.getElementById('naturalLanguageWorkload').value || '').trim().toLowerCase();
      if (!input) {
        showToast('Describe the workload first so the recommendation AI has context.', 'error');
        return;
      }

      const profiles = {
        FCFS: {
          score: 1,
          reasons: [],
          patterns: [
            { regex: /(simple|basic|sequential|one by one|in order|arrival order|first come)/, weight: 3, tag: 'simple ordered execution' },
            { regex: /(batch|offline|long jobs|throughput over response)/, weight: 2, tag: 'batch-style flow' }
          ]
        },
        SJF: {
          score: 0,
          reasons: [],
          patterns: [
            { regex: /(short tasks|many short|small jobs|short processes|quick jobs)/, weight: 4, tag: 'short-job heavy' },
            { regex: /(average waiting|minimize waiting|reduce waiting)/, weight: 3, tag: 'waiting-time optimization' }
          ]
        },
        SRTF: {
          score: 0,
          reasons: [],
          patterns: [
            { regex: /(bursty|api|server|request|dynamic arrivals|many short)/, weight: 4, tag: 'bursty request load' },
            { regex: /(fast turnaround|minimum waiting|shortest remaining|preempt short)/, weight: 4, tag: 'aggressive response optimization' }
          ]
        },
        RR: {
          score: 0,
          reasons: [],
          patterns: [
            { regex: /(interactive|responsive|user|gaming|time sharing|fair share)/, weight: 4, tag: 'interactive responsiveness' },
            { regex: /(low latency|fast response|smooth|equal cpu|everyone gets time)/, weight: 3, tag: 'fair user experience' }
          ]
        },
        PriorityP: {
          score: 0,
          reasons: [],
          patterns: [
            { regex: /(urgent|critical|emergency|real time|must run first|high priority|preempt)/, weight: 5, tag: 'critical priority handling' },
            { regex: /(alerts|monitoring|hospital|safety|deadline)/, weight: 4, tag: 'time-critical service' }
          ]
        },
        PriorityNP: {
          score: 0,
          reasons: [],
          patterns: [
            { regex: /(priority based|important jobs first|ordered by priority)/, weight: 3, tag: 'priority-ordered workload' },
            { regex: /(less switching|stable runs|run to completion)/, weight: 2, tag: 'reduced preemption' }
          ]
        },
        MLQ: {
          score: 0,
          reasons: [],
          patterns: [
            { regex: /(background|battery|energy|eco|different queues|foreground and background)/, weight: 4, tag: 'queue separation and energy awareness' },
            { regex: /(system tasks and background|multiple classes|mixed priority classes)/, weight: 3, tag: 'multi-class workload' }
          ]
        },
        CUSTOM: {
          score: 0,
          reasons: [],
          patterns: [
            { regex: /(hybrid|custom|mixed|varied|different classes|combination)/, weight: 5, tag: 'custom mixed-policy need' },
            { regex: /(tune|adaptive|specific workload|fine control)/, weight: 3, tag: 'adaptive tuning' }
          ]
        }
      };

      const explicitAlgorithmMentions = [
        { regex: /\bround robin\b|\brr\b/, algorithm: 'RR', tag: 'explicit round robin request' },
        { regex: /\bfcfs\b|\bfirst come first served\b/, algorithm: 'FCFS', tag: 'explicit fcfs request' },
        { regex: /\bsjf\b|\bshortest job first\b/, algorithm: 'SJF', tag: 'explicit sjf request' },
        { regex: /\bsrtf\b|\bshortest remaining time first\b/, algorithm: 'SRTF', tag: 'explicit srtf request' },
        { regex: /\bmlq\b|\bmultilevel queue\b/, algorithm: 'MLQ', tag: 'explicit mlq request' },
        { regex: /\bcustom hybrid\b|\bhybrid scheduler\b|\bcustom scheduler\b/, algorithm: 'CUSTOM', tag: 'explicit custom scheduler request' },
        { regex: /\bpriority preemptive\b|\bpreemptive priority\b/, algorithm: 'PriorityP', tag: 'explicit preemptive priority request' },
        { regex: /\bpriority non preemptive\b|\bnon preemptive priority\b/, algorithm: 'PriorityNP', tag: 'explicit non-preemptive priority request' }
      ];

      explicitAlgorithmMentions.forEach(({ regex, algorithm, tag }) => {
        if (regex.test(input)) {
          profiles[algorithm].score += 10;
          profiles[algorithm].reasons.push(tag);
        }
      });

      Object.entries(profiles).forEach(([algorithm, profile]) => {
        profile.patterns.forEach(pattern => {
          if (pattern.regex.test(input)) {
            profile.score += pattern.weight;
            profile.reasons.push(pattern.tag);
          }
        });
      });

      if (/(fairness|fair|avoid starvation)/.test(input)) {
        profiles.RR.score += 2;
        profiles.CUSTOM.score += 2;
        profiles.RR.reasons.push('fairness focus');
      }

      if (/(energy saving|save power|low power)/.test(input)) {
        profiles.MLQ.score += 3;
        profiles.CUSTOM.score += 1;
        profiles.MLQ.reasons.push('power-sensitive behavior');
      }

      const ranked = Object.entries(profiles)
        .sort((a, b) => b[1].score - a[1].score || a[0].localeCompare(b[0]));

      const [suggested, topProfile] = ranked[0];
      const secondary = ranked[1][0];
      const priorities = [...new Set(topProfile.reasons)];

      let reason = 'The description sounds broad, so FCFS remains the baseline starting point.';
      if (suggested === 'PriorityP') {
        reason = 'The workload sounds urgent and interruption-sensitive, so preemptive priority scheduling is the strongest fit.';
      } else if (suggested === 'RR') {
        reason = 'The workload emphasizes responsiveness and fairness, which makes Round Robin a strong candidate.';
      } else if (suggested === 'SRTF') {
        reason = 'The workload sounds short-job and burst heavy, so SRTF should reduce average waiting time well.';
      } else if (suggested === 'SJF') {
        reason = 'The workload is dominated by short tasks, so SJF is a strong low-waiting-time option.';
      } else if (suggested === 'MLQ') {
        reason = 'The workload contains multiple task classes or energy-sensitive behavior, which fits multilevel queue scheduling.';
      } else if (suggested === 'CUSTOM') {
        reason = 'The workload looks mixed and specialized, so a custom hybrid scheduler gives the most control.';
      } else if (suggested === 'PriorityNP') {
        reason = 'The workload clearly wants priority ordering, but not necessarily constant preemption.';
      }

      document.getElementById('algorithm').value = suggested;
      document.getElementById('algorithm').dispatchEvent(new Event('change'));

      renderRecommendationAI(`
        <div class="nl-card">
          <h3>Suggested Scheduler: ${algorithmLabelMap[suggested]}</h3>
          <p>${reason}</p>
          <p><strong>Detected goals:</strong> ${priorities.length ? priorities.join(', ') : 'balanced baseline'}</p>
          <p><strong>Also try:</strong> ${algorithmLabelMap[secondary]} for a second opinion.</p>
          <p><strong>AI action:</strong> The main scheduler selector has been updated to ${algorithmLabelMap[suggested]}.</p>
        </div>
      `);
      showToast('Plain-English recommendation is ready.');
    }

    function renderStoryScene(html) {
      const target = document.getElementById('storyScene');
      if (!target) return;
      target.innerHTML = html || '<p class="mini-note">Choose a scenario to see its system context, workload story, and recommended scheduling priorities.</p>';
    }

    function playScenarioStory() {
      const scenarioKey = document.getElementById('storyScenario').value;
      const story = scenarioStories[scenarioKey];
      if (!story) {
        renderStoryScene('<p class="mini-note">Choose a scenario to see its system context.</p>');
        return;
      }

      renderStoryScene(`
        <div class="story-stage">
          <h3>${story.title}</h3>
          <p>${story.subtitle}</p>
          <div>
            ${story.mood.map(item => `<span class="story-chip">${item}</span>`).join('')}
          </div>
        </div>
        <div class="story-card">
          <div class="story-grid">
            ${story.beats.map(beat => `<div class="story-beat">${beat}</div>`).join('')}
          </div>
          <p><strong>Recommended direction:</strong> ${story.recommendation}</p>
        </div>
      `);
    }

    function renderReportScorecard(html) {
      const target = document.getElementById('reportScorecard');
      if (!target) return;
      target.innerHTML = html || '<p class="mini-note">Run a simulation or comparison to generate presentation-ready conclusions and observations.</p>';
    }

    function createReportScorecard(title, algorithm, mode, metrics, energyData, schedule) {
      const longestEnd = schedule.length ? Math.max(...schedule.map(task => task.endTime)) : 0;
      const conclusion = metrics.averageWaitingTime <= 2
        ? 'The workload is handled with strong responsiveness.'
        : metrics.fairnessScore >= 75
          ? 'The workload is handled with a good fairness balance.'
          : 'The workload is serviceable, but optimization opportunities remain.';

      const observations = [
        `Average waiting time settled at ${metrics.averageWaitingTime.toFixed(2)} units.`,
        `Total schedule span reached ${longestEnd} time units with ${metrics.contextSwitches} context switches.`,
        `Energy consumption was ${energyData.totalEnergy} units with efficiency at ${energyData.energyEfficiency}%.`
      ];

      const nextStep = metrics.averageWaitingTime > 3
        ? 'Compare against SJF, SRTF, or a Custom Hybrid to reduce queue delay.'
        : energyData.energyEfficiency < 50
          ? 'Try Eco mode or MLQ for a more energy-aware result.'
          : 'Use the head-to-head lab to validate this choice against one alternative scheduler.';

      return `
        <div class="scorecard-card">
          <h3>${title}</h3>
          <p><strong>Selected scheduler:</strong> ${algorithmLabelMap[algorithm]} in ${formatModeLabel(mode)} mode</p>
          <p><strong>Conclusion:</strong> ${conclusion}</p>
          <div class="scorecard-list">
            ${observations.map(item => `<div class="score-item">${item}</div>`).join('')}
          </div>
          <p><strong>Project observation:</strong> ${metrics.fairnessScore >= 70 ? 'The scheduler maintains a healthy balance between performance and fairness.' : 'The scheduler favors some tasks more heavily, which is visible in the fairness score.'}</p>
          <p><strong>Recommended next step:</strong> ${nextStep}</p>
        </div>
      `;
    }

    function runHeadToHead() {
      const algorithmA = document.getElementById('duelAlgorithmA').value;
      const algorithmB = document.getElementById('duelAlgorithmB').value;
      const mode = document.getElementById('mode').value;
      const timeQuantum = getTimeQuantum() || parseFloat(document.getElementById('customQuantum').value) || 2;

      if (!tasks.length) {
        showToast('Add or generate tasks before running a head-to-head comparison.', 'error');
        return;
      }

      if (algorithmA === algorithmB) {
        showToast('Choose two different algorithms for the head-to-head view.', 'error');
        return;
      }

      const validationA = validateSimulationInputs(algorithmA, timeQuantum);
      const validationB = validateSimulationInputs(algorithmB, timeQuantum);
      if (validationA || validationB) {
        showToast(validationA || validationB, 'error');
        return;
      }

      const resultA = runAlgorithmScenario(algorithmA, mode, timeQuantum);
      const resultB = runAlgorithmScenario(algorithmB, mode, timeQuantum);
      const waitingWinner = resultA.metrics.averageWaitingTime <= resultB.metrics.averageWaitingTime ? resultA : resultB;
      const fairnessWinner = resultA.metrics.fairnessScore >= resultB.metrics.fairnessScore ? resultA : resultB;
      const energyWinner = resultA.energyData.totalEnergy <= resultB.energyData.totalEnergy ? resultA : resultB;

      renderHeadToHeadResult(`
        <div class="duel-card">
          <h3>${algorithmLabelMap[resultA.algorithm]} vs ${algorithmLabelMap[resultB.algorithm]}</h3>
          <p class="duel-vs">${formatModeLabel(mode)} mode comparison</p>
          <div class="duel-summary">
            <div class="duel-metric"><span>${algorithmLabelMap[resultA.algorithm]} waiting</span><strong>${resultA.metrics.averageWaitingTime.toFixed(2)}</strong></div>
            <div class="duel-metric"><span>${algorithmLabelMap[resultB.algorithm]} waiting</span><strong>${resultB.metrics.averageWaitingTime.toFixed(2)}</strong></div>
            <div class="duel-metric"><span>${algorithmLabelMap[resultA.algorithm]} fairness</span><strong>${resultA.metrics.fairnessScore}/100</strong></div>
            <div class="duel-metric"><span>${algorithmLabelMap[resultB.algorithm]} fairness</span><strong>${resultB.metrics.fairnessScore}/100</strong></div>
          </div>
          <p><strong>Fastest response:</strong> ${algorithmLabelMap[waitingWinner.algorithm]}</p>
          <p><strong>Best fairness:</strong> ${algorithmLabelMap[fairnessWinner.algorithm]}</p>
          <p><strong>Lowest energy:</strong> ${algorithmLabelMap[energyWinner.algorithm]}</p>
        </div>
      `);
      renderDualTimeline(`
        <div class="timeline-duel-card">
          <h3>Dual Timeline View</h3>
          <div class="mini-gantt-grid">
            <div>
              <p class="duel-vs">${algorithmLabelMap[resultA.algorithm]}</p>
              ${createMiniGanttHTML(resultA.schedule)}
            </div>
            <div>
              <p class="duel-vs">${algorithmLabelMap[resultB.algorithm]}</p>
              ${createMiniGanttHTML(resultB.schedule)}
            </div>
          </div>
        </div>
      `);
      showToast('Head-to-head comparison is ready.');
    }

    function createRecommendation(algorithm, metrics, energyData, mode) {
      const algorithmName = algorithmLabelMap[algorithm] || algorithm;
      let rationale = 'This algorithm gives the strongest balance across the current workload.';

      if (metrics.averageWaitingTime <= 2) {
        rationale = 'It keeps waiting time very low, which is ideal for responsive workloads.';
      } else if (energyData.energyEfficiency >= 70) {
        rationale = 'It stands out on energy efficiency, which fits battery-sensitive or eco-focused scenarios.';
      } else if (metrics.fairnessScore >= 80) {
        rationale = 'It distributes CPU time more fairly across tasks than the other options.';
      }

      return `
        <div class="insight-card">
          <h3>Smart Recommendation</h3>
          <p><strong>Best match:</strong> ${algorithmName} in ${mode} mode</p>
          <p>${rationale}</p>
          <p><strong>Fairness:</strong> ${metrics.fairnessScore}/100 | <strong>Context Switches:</strong> ${metrics.contextSwitches}</p>
        </div>
      `;
    }

    function createWhatIfInsights(best, results) {
      const sourceResults = results.length ? results : [best];
      const fastest = [...sourceResults].sort((a, b) => a.metrics.averageWaitingTime - b.metrics.averageWaitingTime)[0];
      const greenest = [...sourceResults].sort((a, b) => a.energyData.totalEnergy - b.energyData.totalEnergy)[0];
      const fairnessLeader = [...sourceResults].sort((a, b) => b.metrics.fairnessScore - a.metrics.fairnessScore)[0];

      return `
        <div class="insight-card">
          <h3>What-If Recommendation Engine</h3>
          <p>If you switch to <strong>${algorithmLabelMap[fastest.algorithm]}</strong>, waiting time can drop to ${fastest.metrics.averageWaitingTime.toFixed(2)} units.</p>
          <p>If energy matters most, <strong>${algorithmLabelMap[greenest.algorithm]}</strong> uses only ${greenest.energyData.totalEnergy} units.</p>
          <p>For fairness-focused workloads, <strong>${algorithmLabelMap[fairnessLeader.algorithm]}</strong> leads at ${fairnessLeader.metrics.fairnessScore}/100.</p>
          <p><strong>Overall balanced choice:</strong> ${algorithmLabelMap[best.algorithm]}.</p>
        </div>
      `;
    }

    function updateMetrics(metrics, energyData) {
      document.getElementById('avgTurnaroundTime').textContent = metrics.averageTurnaroundTime.toFixed(2);
      document.getElementById('avgWaitingTime').textContent = metrics.averageWaitingTime.toFixed(2);
      document.getElementById('fairnessScore').textContent = metrics.fairnessScore;
      document.getElementById('contextSwitches').textContent = `${metrics.contextSwitches} switches`;
      document.getElementById('totalEnergy').textContent = energyData.totalEnergy;
      document.getElementById('energyEfficiency').textContent = `${energyData.energyEfficiency}%`;

      const energyLevel = document.getElementById('energyLevel');
      const energyPercentage = Math.min(100, Math.round(energyData.totalEnergy / 50 * 100));
      energyLevel.style.width = `${energyPercentage}%`;
      energyLevel.style.background = energyData.energyEfficiency > 70
        ? 'linear-gradient(to right, #4CAF50, #8BC34A)'
        : energyData.energyEfficiency > 40
          ? 'linear-gradient(to right, #FFC107, #FF9800)'
          : 'linear-gradient(to right, #F44336, #E91E63)';
      updateHeroSignals(lastSimulation ? 'Ready' : 'Idle');
    }

    function updateStateBoard(schedule, activeIndex = -1) {
      const stateBoard = document.getElementById('stateBoard');
      const columns = ['New', 'Ready', 'Running', 'Waiting', 'Terminated'];
      const currentTime = activeIndex >= 0 && schedule[activeIndex] ? schedule[activeIndex].startTime : -1;
      const grouped = { New: [], Ready: [], Running: [], Waiting: [], Terminated: [] };
      const uniqueTasks = {};

      schedule.forEach((item, index) => {
        if (!uniqueTasks[item.taskId]) {
          uniqueTasks[item.taskId] = { arrivalTime: item.arrivalTime, endTime: item.endTime, seen: false };
        }
        uniqueTasks[item.taskId].endTime = Math.max(uniqueTasks[item.taskId].endTime, item.endTime);
        uniqueTasks[item.taskId].seen = uniqueTasks[item.taskId].seen || index < activeIndex;
      });

      Object.entries(uniqueTasks).forEach(([taskId, task]) => {
        if (activeIndex < 0) {
          grouped.New.push(`Task ${taskId}`);
        } else if (currentTime < task.arrivalTime) {
          grouped.New.push(`Task ${taskId}`);
        } else if (schedule[activeIndex] && Number(taskId) === schedule[activeIndex].taskId) {
          grouped.Running.push(`Task ${taskId}`);
        } else if (currentTime >= task.endTime) {
          grouped.Terminated.push(`Task ${taskId}`);
        } else if (task.seen) {
          grouped.Waiting.push(`Task ${taskId}`);
        } else {
          grouped.Ready.push(`Task ${taskId}`);
        }
      });

      stateBoard.innerHTML = columns.map(column => `
        <div class="state-column">
          <h4>${column}</h4>
          ${grouped[column].length ? grouped[column].map(item => `<span class="state-chip">${item}</span>`).join('') : '<span class="mini-note">No tasks</span>'}
        </div>
      `).join('');
    }

    function detectSchedulingRisks(schedule, metrics) {
      const detectorPanel = document.getElementById('detectorPanel');
      const issues = [];
      const waitingTimes = {};

      Object.keys(metrics.completionMap).forEach(taskId => {
        const turnaroundTime = metrics.completionMap[taskId] - metrics.arrivalMap[taskId];
        waitingTimes[taskId] = turnaroundTime - metrics.totalBurstMap[taskId];
      });

      const values = Object.values(waitingTimes);
      const maxWaiting = values.length ? Math.max(...values) : 0;
      if (maxWaiting >= 6) {
        const longestTask = Object.keys(waitingTimes).find(taskId => waitingTimes[taskId] === maxWaiting);
        issues.push(`Starvation risk detected: Task ${longestTask} waited ${maxWaiting} units before completion.`);
      }
      if (metrics.fairnessScore < 55) {
        issues.push(`Fairness is low at ${metrics.fairnessScore}/100, so some tasks may be favored too heavily.`);
      }
      const inversionCandidate = schedule.find(item => item.priority === 3) && schedule.find(item => item.priority === 1 && item.startTime > 0);
      if (inversionCandidate) {
        issues.push('Possible priority inversion pattern: a lower-priority task runs while higher-priority work still exists later in the timeline.');
      }

      detectorPanel.innerHTML = `
        <div class="panel-heading">
          <div>
            <p class="panel-kicker">Risk Signals</p>
            <h2>Starvation And Fairness</h2>
          </div>
        </div>
        ${issues.length
          ? issues.map(issue => `<div class="detector-item">${issue}</div>`).join('')
          : '<div class="detector-item safe">No major starvation or fairness risks were detected for this workload.</div>'}
      `;
    }

    function setLastSimulation(payload) {
      lastSimulation = payload;
      updateStateBoard(payload.schedule, -1);
      resetTimeline();
      document.getElementById('shareSummary').textContent = `${payload.title}: ${algorithmLabelMap[payload.algorithm]} in ${payload.mode} mode, waiting ${payload.metrics.averageWaitingTime.toFixed(2)}, energy ${payload.energyData.totalEnergy}.`;
      updateHeroSignals('Ready');
    }

    function playTimeline() {
      if (!lastSimulation || !lastSimulation.schedule.length) {
        showToast('Run a simulation first to use playback.', 'error');
        return;
      }

      pauseTimeline();
      const delay = parseInt(document.getElementById('timelineSpeed').value, 10);
      playbackTimer = setInterval(() => {
        const schedule = lastSimulation.schedule;
        if (playbackIndex >= schedule.length) {
          pauseTimeline();
          document.getElementById('timelineStatus').innerHTML = '<strong>Playback complete.</strong> All tasks reached the terminated state.';
          updateHeroSignals('Complete');
          return;
        }

        const current = schedule[playbackIndex];
        document.querySelectorAll('.gantt-bar').forEach((bar, index) => {
          bar.classList.toggle('active', index === playbackIndex);
        });
        document.getElementById('timelineStatus').innerHTML = `<strong>Now running:</strong> Task ${current.taskId} from ${current.startTime} to ${current.endTime} units.`;
        updateStateBoard(schedule, playbackIndex);
        updateHeroSignals(`Task ${current.taskId}`);
        playbackIndex += 1;
      }, delay);
    }

    function pauseTimeline() {
      if (playbackTimer) {
        clearInterval(playbackTimer);
        playbackTimer = null;
      }
      updateHeroSignals(lastSimulation ? 'Paused' : 'Idle');
    }

    function resetTimeline() {
      pauseTimeline();
      playbackIndex = 0;
      document.querySelectorAll('.gantt-bar').forEach(bar => bar.classList.remove('active'));
      document.getElementById('timelineStatus').textContent = lastSimulation
        ? 'Playback reset. Press Play Timeline to walk through the schedule.'
        : 'Run a simulation to watch step-by-step playback.';
      if (lastSimulation) {
        updateStateBoard(lastSimulation.schedule, -1);
      }
      updateHeroSignals(lastSimulation ? 'Ready' : 'Idle');
    }

    function saveSession() {
      const payload = {
        tasks,
        timestamp: new Date().toISOString(),
        lastSimulation
      };
      localStorage.setItem('cpuSchedulingSession', JSON.stringify(payload));
      updateSavedSessionInfo();
      showToast('Session saved to your browser.');
    }

    function loadSavedSession() {
      const saved = localStorage.getItem('cpuSchedulingSession');
      if (!saved) {
        showToast('No saved session found.', 'error');
        return;
      }

      const parsed = JSON.parse(saved);
      tasks = parsed.tasks || [];
      taskIdCounter = tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
      updateTaskTable();

      if (parsed.lastSimulation) {
        generateGanttChart(parsed.lastSimulation.schedule);
        generateEnergyChart(parsed.lastSimulation.schedule, parsed.lastSimulation.energyData);
        generatePriorityPieChart(parsed.lastSimulation.energyData);
        generateTradeoffChart([{ algorithm: parsed.lastSimulation.algorithm, metrics: parsed.lastSimulation.metrics, energyData: parsed.lastSimulation.energyData }]);
        updateMetrics(parsed.lastSimulation.metrics, parsed.lastSimulation.energyData);
        detectSchedulingRisks(parsed.lastSimulation.schedule, parsed.lastSimulation.metrics);
        renderCoachPreview(createCoachCard(parsed.lastSimulation.algorithm, parsed.lastSimulation.metrics, parsed.lastSimulation.energyData));
        renderReportScorecard(createReportScorecard(parsed.lastSimulation.title, parsed.lastSimulation.algorithm, parsed.lastSimulation.mode, parsed.lastSimulation.metrics, parsed.lastSimulation.energyData, parsed.lastSimulation.schedule));
        setLastSimulation(parsed.lastSimulation);
      }

      updateSavedSessionInfo();
      renderWorkloadFingerprint();
      showToast('Saved session loaded successfully!');
    }

    function updateSavedSessionInfo() {
      const saved = localStorage.getItem('cpuSchedulingSession');
      const label = document.getElementById('savedSessionsInfo');
      if (!saved) {
        label.textContent = 'No saved sessions yet.';
        return;
      }

      const parsed = JSON.parse(saved);
      label.textContent = `Saved session from ${new Date(parsed.timestamp).toLocaleString()} with ${parsed.tasks.length} tasks.`;
    }

    function exportSessionReport() {
      if (!lastSimulation) {
        showToast('Run a simulation first to export a report.', 'error');
        return;
      }

      const report = {
        exportedAt: new Date().toISOString(),
        tasks,
        simulation: lastSimulation
      };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'cpu-scheduling-report.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Full report exported successfully!');
    }

    function getCanvasImage(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return '';
      try {
        return canvas.toDataURL('image/png');
      } catch (error) {
        return '';
      }
    }

    function buildTaskTableHTML(taskList) {
      return `
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <thead>
            <tr>
              <th style="padding:10px;border:1px solid #cbd5df;background:#eef4f8;">Task ID</th>
              <th style="padding:10px;border:1px solid #cbd5df;background:#eef4f8;">Arrival</th>
              <th style="padding:10px;border:1px solid #cbd5df;background:#eef4f8;">Burst</th>
              <th style="padding:10px;border:1px solid #cbd5df;background:#eef4f8;">Priority</th>
            </tr>
          </thead>
          <tbody>
            ${taskList.map(task => `
              <tr>
                <td style="padding:10px;border:1px solid #cbd5df;">${task.id}</td>
                <td style="padding:10px;border:1px solid #cbd5df;">${task.arrivalTime}</td>
                <td style="padding:10px;border:1px solid #cbd5df;">${task.burstTime}</td>
                <td style="padding:10px;border:1px solid #cbd5df;">${task.priority ? priorityNames[task.priority] : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    function buildScheduleHTML(schedule) {
      return schedule.map(task => `
        <div style="padding:14px 16px;border:1px solid #d9e2ea;border-radius:16px;background:#ffffff;margin-top:10px;">
          <strong>Task ${task.taskId}</strong>
          <div>Start: ${task.startTime} | End: ${task.endTime}</div>
          <div>Burst: ${task.burstTime} | Priority: ${priorityNames[task.priority] || 'N/A'}</div>
        </div>
      `).join('');
    }

    function exportSolutionPackage() {
      if (!lastSimulation) {
        showToast('Run a simulation first to export the full solution.', 'error');
        return;
      }

      const outputHTML = document.getElementById('output').innerHTML;
      const ganttHTML = document.getElementById('ganttChart').innerHTML;
      const detectorHTML = document.getElementById('detectorPanel').innerHTML;
      const energyImage = getCanvasImage('energyChart');
      const priorityImage = getCanvasImage('priorityChart');
      const tradeoffImage = getCanvasImage('tradeoffChart');
      const exportedAt = new Date().toLocaleString();

      const reportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CPU Scheduling Solution Report</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 28px; color: #021526; background: #f6f8fa; }
    h1, h2, h3 { color: #03346e; }
    .hero, .section { background: #fff; border: 1px solid #d7e1ea; border-radius: 18px; padding: 22px; margin-bottom: 18px; }
    .hero { background: linear-gradient(135deg, rgba(110,172,218,0.18), rgba(226,226,182,0.35)); }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
    .stat { background: #fff; border: 1px solid #d7e1ea; border-radius: 14px; padding: 14px; }
    .gantt { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
    .gantt .gantt-bar { padding: 10px 14px; border-radius: 999px; color: #fff; font-weight: 700; }
    img { max-width: 100%; border-radius: 14px; border: 1px solid #d7e1ea; background: #fff; }
  </style>
</head>
<body>
  <section class="hero">
    <h1>CPU Scheduling Solution Report</h1>
    <p><strong>Exported:</strong> ${exportedAt}</p>
    <p><strong>Algorithm:</strong> ${algorithmLabelMap[lastSimulation.algorithm]} | <strong>Mode:</strong> ${lastSimulation.mode}</p>
    <div class="stats">
      <div class="stat"><strong>Avg Waiting</strong><div>${lastSimulation.metrics.averageWaitingTime.toFixed(2)}</div></div>
      <div class="stat"><strong>Avg Turnaround</strong><div>${lastSimulation.metrics.averageTurnaroundTime.toFixed(2)}</div></div>
      <div class="stat"><strong>Energy</strong><div>${lastSimulation.energyData.totalEnergy}</div></div>
      <div class="stat"><strong>Fairness</strong><div>${lastSimulation.metrics.fairnessScore}/100</div></div>
    </div>
  </section>
  <section class="section">
    <h2>Task Details</h2>
    ${buildTaskTableHTML(tasks)}
  </section>
  <section class="section">
    <h2>Generated Solution</h2>
    ${outputHTML}
  </section>
  <section class="section">
    <h2>Schedule Breakdown</h2>
    ${buildScheduleHTML(lastSimulation.schedule)}
  </section>
  <section class="section">
    <h2>Gantt Chart</h2>
    <div class="gantt">${ganttHTML}</div>
  </section>
  <section class="section">
    <h2>Fairness And Risk Notes</h2>
    ${detectorHTML}
  </section>
  <section class="section">
    <h2>Charts</h2>
    ${energyImage ? `<h3>Energy Per Task</h3><img src="${energyImage}" alt="Energy chart">` : ''}
    ${priorityImage ? `<h3>Energy By Priority</h3><img src="${priorityImage}" alt="Priority chart">` : ''}
    ${tradeoffImage ? `<h3>Performance vs Energy</h3><img src="${tradeoffImage}" alt="Tradeoff chart">` : ''}
  </section>
</body>
</html>`;

      const blob = new Blob([reportHTML], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'cpu-scheduling-solution-report.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Full solution report exported successfully!');
    }

    function copyShareSummary() {
      if (!lastSimulation) {
        showToast('Run a simulation first to copy a summary.', 'error');
        return;
      }

      const summary = `${lastSimulation.title}: ${algorithmLabelMap[lastSimulation.algorithm]} in ${lastSimulation.mode} mode. Waiting ${lastSimulation.metrics.averageWaitingTime.toFixed(2)}, turnaround ${lastSimulation.metrics.averageTurnaroundTime.toFixed(2)}, energy ${lastSimulation.energyData.totalEnergy}, fairness ${lastSimulation.metrics.fairnessScore}/100.`;
      document.getElementById('shareSummary').textContent = summary;

      navigator.clipboard.writeText(summary).then(() => {
        showToast('Summary copied to clipboard!');
      }).catch(() => {
        showToast('Summary ready below. Clipboard permission was unavailable.', 'error');
      });
    }

    function generateRealtimeWorkload() {
      const scenario = document.getElementById('generatorScenario').value;
      const count = parseInt(document.getElementById('generatorCount').value, 10) || 5;
      const spacing = parseInt(document.getElementById('generatorSpacing').value, 10) || 1;
      const scenarioProfiles = {
        balanced: { priorities: [2, 3, 1, 2], bursts: [2, 3, 4, 5] },
        bursty: { priorities: [1, 2, 1, 3], bursts: [5, 6, 2, 7] },
        battery: { priorities: [3, 2, 3, 1], bursts: [1, 2, 3, 4] }
      };
      const profile = scenarioProfiles[scenario];
      const startArrival = tasks.length ? Math.max(...tasks.map(task => task.arrivalTime)) + spacing : 0;

      for (let i = 0; i < count; i += 1) {
        tasks.push({
          id: taskIdCounter++,
          arrivalTime: startArrival + (i * spacing),
          burstTime: profile.bursts[i % profile.bursts.length] + Math.floor(Math.random() * 2),
          priority: profile.priorities[i % profile.priorities.length]
        });
      }

      updateTaskTable();
      showToast('Live workload generated and appended to the task list!');
    }

    function generateChallenge() {
      const sampleSet = tasks.length
        ? cloneTasks(tasks).slice(0, 4)
        : workloadPresets.student.tasks.map((task, index) => ({ id: index + 1, ...task }));
      const contenders = ['FCFS', 'SJF', 'RR'];
      const timeQuantum = getTimeQuantum() || 2;
      const scored = contenders.map(algorithm => {
        const schedule = runScheduler(algorithm, sampleSet, timeQuantum);
        const metrics = calculateMetrics(schedule);
        return { algorithm, waiting: metrics.averageWaitingTime };
      }).sort((a, b) => a.waiting - b.waiting);

      challengeState = {
        prompt: `For this mini workload, which algorithm keeps waiting time lowest: ${contenders.join(', ')}?`,
        answer: `${algorithmLabelMap[scored[0].algorithm]} performs best for the current challenge set with average waiting time ${scored[0].waiting.toFixed(2)}.`
      };

      document.getElementById('challengePrompt').textContent = challengeState.prompt;
      document.getElementById('challengeAnswer').textContent = '';
    }

    function revealChallengeAnswer() {
      if (!challengeState) {
        generateChallenge();
      }
      document.getElementById('challengeAnswer').textContent = challengeState.answer;
    }

    function applyTheme(theme) {
      const nextTheme = theme === 'dark' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', nextTheme);
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.textContent = nextTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
      }
      localStorage.setItem('cpuSchedulingTheme', nextTheme);

      if (lastSimulation) {
        generateGanttChart(lastSimulation.schedule);
        generateEnergyChart(lastSimulation.schedule, lastSimulation.energyData);
        generatePriorityPieChart(lastSimulation.energyData);
        if (lastTradeoffResults.length) {
          generateTradeoffChart(lastTradeoffResults);
        }
      }
    }

    function toggleTheme() {
      const currentTheme = document.body.getAttribute('data-theme') || 'light';
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }

    function initializeTheme() {
      const savedTheme = localStorage.getItem('cpuSchedulingTheme') || 'light';
      applyTheme(savedTheme);
    }

    function compareAlgorithms() {
      const mode = document.getElementById('mode').value;
      const timeQuantum = getTimeQuantum() || parseFloat(document.getElementById('customQuantum').value) || 2;
      const algorithms = ['FCFS', 'SJF', 'PriorityNP', 'PriorityP', 'RR', 'SRTF', 'MLQ', 'CUSTOM'];
      const results = [];

      if (tasks.length === 0) {
        showToast('Please add or load tasks before comparing algorithms.', 'error');
        return;
      }

      for (const algorithm of algorithms) {
        const validationError = validateSimulationInputs(algorithm, timeQuantum);
        if (validationError) {
          showToast(`${algorithmLabelMap[algorithm]} skipped: ${validationError}`, 'error');
          return;
        }

        const baseSchedule = runScheduler(algorithm, tasks, timeQuantum);
        const { adjustedSchedule, energyAdjustment } = applyModeAdjustments(baseSchedule, mode);
        const metrics = calculateMetrics(adjustedSchedule);
        const energyData = calculateEnergyConsumption(adjustedSchedule);
        energyData.totalEnergy = Math.round(energyData.totalEnergy * energyAdjustment);
        energyData.energyEfficiency = Math.min(100, Math.round(energyData.energyEfficiency / energyAdjustment));

        results.push({
          algorithm,
          metrics,
          energyData,
          score: scoreAlgorithm(metrics, energyData)
        });
      }

      results.sort((a, b) => a.score - b.score);
      const best = results[0];
      const output = document.getElementById('output');
      output.innerHTML = `
        ${createRecommendation(best.algorithm, best.metrics, best.energyData, mode)}
        ${createWhatIfInsights(best, results)}
        ${createCoachCard(best.algorithm, best.metrics, best.energyData)}
        <h3>Algorithm Comparison Lab</h3>
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Avg Waiting</th>
              <th>Avg Turnaround</th>
              <th>Energy</th>
              <th>Efficiency</th>
              <th>Fairness</th>
              <th>Switches</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(result => `
              <tr class="${result.algorithm === best.algorithm ? 'best-row' : ''}">
                <td>${algorithmLabelMap[result.algorithm]}</td>
                <td>${result.metrics.averageWaitingTime.toFixed(2)}</td>
                <td>${result.metrics.averageTurnaroundTime.toFixed(2)}</td>
                <td>${result.energyData.totalEnergy}</td>
                <td>${result.energyData.energyEfficiency}%</td>
                <td>${result.metrics.fairnessScore}/100</td>
                <td>${result.metrics.contextSwitches}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p class="mini-note">The highlighted row is the best overall fit for this workload based on waiting time, turnaround, energy usage, and fairness.</p>
      `;

      const bestSchedule = runScheduler(best.algorithm, tasks, timeQuantum);
      const adjustedBestSchedule = applyModeAdjustments(bestSchedule, mode).adjustedSchedule;
      generateGanttChart(adjustedBestSchedule);
      generateEnergyChart(adjustedBestSchedule, best.energyData);
      generatePriorityPieChart(best.energyData);
      generateTradeoffChart(results);
      updateMetrics(best.metrics, best.energyData);
      detectSchedulingRisks(adjustedBestSchedule, best.metrics);
      renderCoachPreview(createCoachCard(best.algorithm, best.metrics, best.energyData));
      renderReportScorecard(createReportScorecard('Comparison Scorecard', best.algorithm, mode, best.metrics, best.energyData, adjustedBestSchedule));
      setLastSimulation({
        title: 'Comparison Winner',
        algorithm: best.algorithm,
        mode,
        schedule: adjustedBestSchedule,
        metrics: best.metrics,
        energyData: best.energyData
      });

      showToast('Algorithm comparison completed successfully!');
    }

    function simulate() {
      const algorithm = document.getElementById('algorithm').value;
      const mode = document.getElementById('mode').value;
      const timeQuantum = getTimeQuantum() || parseFloat(document.getElementById('customQuantum').value) || 2;
      const validationError = validateSimulationInputs(algorithm, timeQuantum);

      if (validationError) {
        showToast(validationError, 'error');
        return;
      }

      let schedule = runScheduler(algorithm, tasks, timeQuantum);
      const modeAdjustedResult = applyModeAdjustments(schedule, mode);
      schedule = modeAdjustedResult.adjustedSchedule;
      const energyAdjustment = modeAdjustedResult.energyAdjustment;

      const metrics = calculateMetrics(schedule);
      const energyData = calculateEnergyConsumption(schedule);
      
      // Apply mode adjustment to energy
      energyData.totalEnergy = Math.round(energyData.totalEnergy * energyAdjustment);
      energyData.energyEfficiency = Math.min(100, Math.round(energyData.energyEfficiency / energyAdjustment));

      updateMetrics(metrics, energyData);

      const output = document.getElementById('output');
      output.innerHTML = `
        ${createRecommendation(algorithm, metrics, energyData, mode)}
        ${createWhatIfInsights({ algorithm, metrics, energyData }, [{ algorithm, metrics, energyData }])}
        ${createCoachCard(algorithm, metrics, energyData)}
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
      generateTradeoffChart([{ algorithm, metrics, energyData }]);
      detectSchedulingRisks(schedule, metrics);
      renderCoachPreview(createCoachCard(algorithm, metrics, energyData));
      renderReportScorecard(createReportScorecard('Simulation Scorecard', algorithm, mode, metrics, energyData, schedule));
      setLastSimulation({
        title: 'Simulation Report',
        algorithm,
        mode,
        schedule,
        metrics,
        energyData
      });
 
      showToast('Simulation completed successfully!');
    }

    initializeTheme();
    updateSavedSessionInfo();
    updateStateBoard([], -1);
    document.getElementById('algorithmDescription').innerHTML = algorithmDescriptions[document.getElementById('algorithm').value];
    renderWorkloadFingerprint();
    renderDualTimeline('');
    renderRecommendationAI('');
    renderReportScorecard('');
    playScenarioStory();
    updateHeroSignals('Idle');
    generateChallenge();
