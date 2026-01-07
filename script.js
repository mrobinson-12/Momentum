async function sendRequest() {
    
    const subject = document.getElementById('subject-input').value;
    const assessmentKey = `lastTask:${subject}`;
    const dueDate = document.getElementById('due-date-input').value;
    const apiKey = document.getElementById('openai-api-key').value;
    const responseArea = document.getElementById('responseArea');

    responseArea.textContent = 'Sending request...';

    const prompt = `
You are a task-planning assistant.

MODEL BODY:
You break large goals into very small, concrete tasks that can be completed in a single day (30–60 minutes).

TASK:
${subject}

DUE DATE:
${dueDate}

LAST TASK COMPLETED:
${localStorage.getItem(assessmentKey) || 'None'}

INSTRUCTIONS:
Respond ONLY with valid JSON.
Return ONE small task that contributes meaningfully to the task.
Do not include explanations or extra text.
Do not repeat the last task or restate it.

JSON FORMAT:
{
  "task": "string",
  "estimated_time_minutes": number,
  "why_this_matters": "string"
}
`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.4
            }),
        });

        const data = await response.json();

        // Extract just the model's message content
        const content = data.choices?.[0]?.message?.content ?? 'No response';
        responseArea.textContent = content;
        const responseJson = JSON.parse(content);
        const task = responseJson.task;
        const estimatedTime = responseJson.estimated_time_minutes;
        const whyThisMatters = responseJson.why_this_matters;

        responseArea.textContent = `Task: ${task}\nEstimated Time: ${estimatedTime} minutes\nWhy This Matters: ${whyThisMatters}`;
        localStorage.setItem(assessmentKey, task);


    } catch (error) {
        responseArea.textContent = 'Error: ' + error.message;
    }
}
