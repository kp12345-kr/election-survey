document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            try {
                const formData = new FormData(form);
                const surveyResults = Object.fromEntries(formData.entries());

                await saveSurveyResults(surveyResults);

                window.location.href = '/results.html';
            } catch (error) {
                console.error('Error submitting survey:', error);
                alert('Failed to submit survey. Please try again later.');
            }
        });
    }

    if (window.location.pathname === '/results.html') {
        loadSurveyResults();
        setInterval(loadSurveyResults, 5000);
    }
});

async function loadSurveyResults() {
    try {
        const response = await fetch('/survey-results');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const surveyResults = await response.json();
        console.log('Survey results loaded:', surveyResults); // Debugging statement
        updateChart(surveyResults);
    } catch (error) {
        console.error('Error loading survey results:', error);
        alert('Failed to load survey results. Please try again later.');
    }
}

async function saveSurveyResults(results) {
    console.log('Submitting survey results:', results);
    try {
        const response = await fetch('/submit-survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(results),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to save survey results: ${response.status} ${response.statusText} - ${errorText}`);
        }
        console.log('Survey results saved:', results);
    } catch (error) {
        console.error('Error saving survey results:', error);
        alert(`Failed to submit survey. Please try again later. Error: ${error.message}`);
    }
}

function renderChart(results) {
    const questions = [
        { label: 'How likely are you to vote in the 2024 general election?', field: 'question1', options: ["Very likely", "Somewhat likely", "Unlikely", "Will not vote", "None of the above"] },
        { label: 'How satisfied are you with the parties policies?', field: 'question2', options: ["Very satisfied", "Satisfied", "Little satisfied", "Not at all satisfied"] },
        { label: 'How did you vote at the last General Election in 2019?', field: 'question3', options: ["Liberal Democratic Party", "Green Party", "Reform Party", "Conservative Party", "Independent", "Labour Party", "Did not vote", "Prefer not to say"] },
        { label: 'How do you intend to vote in the General Election 2024?', field: 'question4', options: ["Independent Conservative (Save M&S Leicester)", "Liberal Democratic Party", "Green Party", "Reform Party", "Conservative Party", "Labour Party", "Did not vote", "Prefer not to say"] },
        { label: 'Are you likely to change your mind and vote for?', field: 'question5', options: ["Independent Conservative Candidate (Save M&S Leicester)", "Liberal Democratic Party", "Green Party", "Reform Party", "Conservative Party", "Labour Party", "Did not vote", "Prefer not to say"] },
        { label: 'How do you rate the state of the UK?', field: 'question6', options: ["Very good", "Good", "Needs improvement", "Bad", "Impossible of improvement without fundamental changes"] },
        { label: 'Is such selection of candidate good for democracy?', field: 'question7', options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree"] },
        { label: 'Do you believe the outcome of the election will?', field: 'question8', options: ["Will be a great improvement", "Will not be an improvement", "Will be worse", "Don't know"] },
        { label: 'Do you believe the answer to deal with illegal boat crossings?', field: 'question9', options: ["Deposit them back on to Europe's shores which the UK is entitled to do", "Repeal Human Rights Act incorporating European Convention on Human Rights into UK law", "Both of the above", "None of the above"] },
        { label: 'What reforms do you prefer?', field: 'question10', options: ["President directly elected to serve a full term and Reinstate Treason Act repealed when joining EEC to punish loyalty to any foreign power", "Replace House of Lords with elected Senate", "Both of the above", "None of the above"] }
    ];

    const labels = questions.map(question => question.label);

    const aggregatedData = questions.map((question) => {
        return question.options.map(option => results.filter(result => result[question.field] === option).length);
    });

    const data = {
        labels: labels,
        datasets: questions.map((question, index) => ({
            label: question.label,
            data: aggregatedData[index],
            backgroundColor: `rgba(${index * 30}, ${index * 60}, ${index * 90}, 0.2)`,
            borderColor: `rgba(${index * 30}, ${index * 60}, ${index * 90}, 1)`,
            borderWidth: 1
        }))
    };

    const ctx = document.getElementById('resultsChart').getContext('2d');
    if (window.myChart) {
        window.myChart.data = data;
        window.myChart.update();
    } else {
        window.myChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function updateChart(results) {
    renderChart(results);
}


