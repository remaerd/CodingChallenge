/**
 * Challenge System - Manages challenge validation and testing
 */

const ChallengeSystem = (() => {
    const runTests = (code, challenge) => {
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

        challenge.tests.forEach((test, index) => {
            try {
                // Execute user code and test in the same scope
                // The test function definition is in the test.test string
                const combinedCode = code + `\nconst __testFn = ${test.test};\n__testFn();`;
                const testExecutor = new Function(combinedCode + `\nreturn __testFn();`);
                const result = testExecutor();
                
                if (result.success) {
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
                        message: result.message || 'Test failed ✗'
                    });
                }
            } catch (error) {
                results.push({
                    name: test.name,
                    success: false,
                    message: `Error: ${error.message}`
                });
            }
        });

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
            new Function(code);
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
