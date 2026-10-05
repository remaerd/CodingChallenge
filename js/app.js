/**
 * Main Application - Orchestrates the entire challenge system
 */

const App = (() => {
    let challenges = {};
    let currentChallenge = null;
    let challengeOrder = [];

    const init = async () => {
        // Initialize editor
        Editor.init();

        // Load challenges
        await loadChallenges();

        // Setup event listeners
        setupEventListeners();

        // Focus on editor
        Editor.focus();
    };

    const loadChallenges = async () => {
        try {
            // Try to load manifest.json first (for explicit challenge ordering)
            let challengeIds = [];
            try {
                const response = await fetch('challenges/manifest.json');
                const manifest = await response.json();
                challengeIds = manifest.challenges;
            } catch (manifestError) {
                // If manifest doesn't exist, use a known list of challenges
                // This allows the system to work without manifest.json
                console.warn('manifest.json not found, using default challenge list');
                challengeIds = [
                    'oop-abstraction',
                    'oop-inheritance',
                    'oop-encapsulation',
                    'oop-polymorphism'
                ];
            }

            challengeOrder = challengeIds;

            // Load each challenge
            let successCount = 0;
            for (const challengeId of challengeIds) {
                try {
                    const challengeResponse = await fetch(`challenges/${challengeId}.json`);
                    if (!challengeResponse.ok) {
                        throw new Error(`HTTP ${challengeResponse.status}`);
                    }
                    const challenge = await challengeResponse.json();
                    challenges[challengeId] = challenge;
                    successCount++;
                } catch (error) {
                    console.error(`Failed to load challenge "${challengeId}":`, error.message);
                }
            }

            // Populate the dropdown
            if (successCount > 0) {
                populateChallengeDropdown();
            } else {
                showMessage('No challenges could be loaded. Check the challenges folder and file format.', 'error');
            }
        } catch (error) {
            console.error('Error in loadChallenges:', error);
            showMessage('Error loading challenges. Check browser console for details.', 'error');
        }
    };

    const populateChallengeDropdown = () => {
        const select = document.getElementById('challenge-select');
        const countDisplay = document.getElementById('challenge-count');
        
        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Get challenge IDs in manifest order (falling back to sorted keys if order not set)
        const challengeIds = challengeOrder.length > 0
            ? challengeOrder.filter(id => challenges[id])
            : Object.keys(challenges).sort();
        
        if (challengeIds.length === 0) {
            select.innerHTML = '<option value="">-- No challenges available --</option>';
            countDisplay.textContent = '';
            return;
        }
        
        // Add challenges to dropdown
        challengeIds.forEach(challengeId => {
            const challenge = challenges[challengeId];
            const option = document.createElement('option');
            option.value = challengeId;
            
            // Show title and difficulty
            const title = challenge.title || challengeId;
            const difficulty = challenge.difficulty ? ` (${challenge.difficulty})` : '';
            option.textContent = `${title}${difficulty}`;
            
            select.appendChild(option);
        });
        
        // Update challenge count display
        countDisplay.textContent = `${challengeIds.length} challenge${challengeIds.length !== 1 ? 's' : ''} available`;
        
        // Log loaded challenges
        console.log(`✓ Loaded ${challengeIds.length} challenge(s):`, challengeIds.join(', '));
    };

    const setupEventListeners = () => {
        // Challenge selection
        document.getElementById('challenge-select').addEventListener('change', (e) => {
            const challengeId = e.target.value;
            if (challengeId) {
                loadChallenge(challengeId);
            }
        });

        // Run button
        document.getElementById('run-btn').addEventListener('click', runTests);

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', resetChallenge);
    };

    const loadChallenge = (challengeId) => {
        currentChallenge = challenges[challengeId];
        
        if (!currentChallenge) {
            showMessage('Challenge not found. Please try again.', 'error');
            return;
        }
        
        // Validate challenge structure
        if (!currentChallenge.title || !currentChallenge.description) {
            showMessage('Challenge is missing required fields (title/description).', 'error');
            return;
        }

        // Update challenge description
        updateChallengeDescription();

        // Load starter code
        Editor.setCode(currentChallenge.starterCode || '');

        // Clear feedback
        clearFeedback();
    };

    const updateChallengeDescription = () => {
        const descDiv = document.getElementById('challenge-desc');
        descDiv.innerHTML = `
            <div class="challenge-info">
                <h3>${currentChallenge.title}</h3>
                <p class="difficulty">Difficulty: <span class="difficulty-${currentChallenge.difficulty.toLowerCase()}">${currentChallenge.difficulty}</span></p>
                <p>${currentChallenge.description}</p>
                <div class="requirements">
                    <h4>Requirements:</h4>
                    <ul>
                        ${currentChallenge.requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                ${currentChallenge.hints ? `
                    <details>
                        <summary>💡 Hints</summary>
                        <ul>
                            ${currentChallenge.hints.map(hint => `<li>${hint}</li>`).join('')}
                        </ul>
                    </details>
                ` : ''}
            </div>
        `;
    };

    const resetChallenge = () => {
        if (currentChallenge) {
            Editor.setCode(currentChallenge.starterCode || '');
            clearFeedback();
            Editor.focus();
        }
    };

    const runTests = () => {
        if (!currentChallenge) {
            return;
        }

        const code = Editor.getCode();

        // Check syntax first
        const syntaxCheck = ChallengeSystem.validateSyntax(code);
        if (!syntaxCheck.valid) {
            showFeedback([{
                name: 'Syntax Error',
                success: false,
                message: syntaxCheck.error
            }], 0, 1);
            return;
        }

        // Run tests
        const results = ChallengeSystem.runTests(code, currentChallenge);
        showFeedback(results.results, results.passed, results.total);
    };

    const showFeedback = (results, passed, total) => {
        const feedbackDiv = document.getElementById('feedback');
        
        if (results.length === 0) {
            feedbackDiv.innerHTML = '<p class="info">No tests available for this challenge</p>';
            return;
        }

        const allPassed = passed === total;
        const statusClass = allPassed ? 'success' : 'partial';
        
        feedbackDiv.innerHTML = `
            <div class="feedback-status ${statusClass}">
                <strong>${passed}/${total} tests passed</strong>
            </div>
            ${results.map((result, index) => `
                <div class="test-result ${result.success ? 'success' : 'failure'}">
                    <span class="test-icon">${result.success ? '✓' : '✗'}</span>
                    <span class="test-name">${result.name}</span>
                    <p class="test-message">${result.message}</p>
                </div>
            `).join('')}
            ${allPassed ? '<div class="celebration">🎉 Challenge completed!</div>' : ''}
        `;
    };

    const clearFeedback = () => {
        const feedbackDiv = document.getElementById('feedback');
        feedbackDiv.innerHTML = '<p class="info">Write code and tests will run automatically</p>';
    };

    const showMessage = (message, type = 'info') => {
        const feedbackDiv = document.getElementById('feedback');
        feedbackDiv.innerHTML = `<p class="${type}">${message}</p>`;
    };

    // Expose test runner to be called from editor
    window.runTests = runTests;

    // Auto-run tests when code editor changes
    // Override the debounce timer in Editor to also run tests
    const setupAutoTests = () => {
        const originalUpdatePreview = Editor.updatePreview;
        Editor.updatePreview = function() {
            originalUpdatePreview.call(this);
            if (currentChallenge) {
                runTests();
            }
        };
    };

    // Setup auto-tests after init
    setupAutoTests();

    // Initialize app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        runTests,
        loadChallenge
    };
})();
