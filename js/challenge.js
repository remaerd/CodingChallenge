/**
 * Challenge System - Manages challenge validation and testing
 */

const ChallengeSystem = (() => {
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

    const runTests = async (code, challenge) => {
        if (!challenge || !challenge.tests) {
            return {
                passed: 0,
                total: 0,
                results: [],
                message: 'No tests available'
            };
        }

        const results = [];
        let passed = 0;

        for (const test of challenge.tests) {
            let timerId = null;
            try {
                // Execute user code and test in the same scope
                // The test function definition is in the test.test string
                const combinedCode = code + `\nconst __testFn = ${test.test};\nreturn await __testFn();`;
                const testExecutor = new AsyncFunction(combinedCode);

                const timeoutPromise = new Promise((_, reject) => {
                    timerId = setTimeout(() => reject(new Error('Test timed out after 8 seconds')), 8000);
                });

                const result = await Promise.race([testExecutor(), timeoutPromise]);
                if (timerId) clearTimeout(timerId);
                
                if (result && result.success) {
                    passed++;
                    results.push({
                        name: test.name,
                        success: true,
                        message: test.successMessage || 'Test passed ✓'
                    });
                } else {
                    results.push({
                        name: test.name,
                        success: false,
                        message: (result && result.message) || 'Test failed ✗'
                    });
                }
            } catch (error) {
                if (timerId) clearTimeout(timerId);
                results.push({
                    name: test.name,
                    success: false,
                    message: `Error: ${error.message}`
                });
            }
        }

        return {
            passed,
            total: challenge.tests.length,
            results,
            message: `${passed}/${challenge.tests.length} tests passed`
        };
    };

    const validateSyntax = (code) => {
        try {
            // Try to compile the code
            new AsyncFunction(code);
            return { valid: true, error: null };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    };

    return {
        runTests,
        validateSyntax
    };
})();
