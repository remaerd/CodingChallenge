/**
 * Editor Module - Manages the code editor and preview functionality
 */

const Editor = (() => {
    let editor = null;
    let debounceTimer = null;

    const init = () => {
        // Initialize CodeMirror editor
        editor = CodeMirror(document.getElementById('code-editor'), {
            lineNumbers: true,
            theme: 'dracula',
            mode: 'javascript',
            indentUnit: 2,
            indentWithTabs: false,
            lineWrapping: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            styleActiveLine: true,
            highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true }
        });

        // Listen for changes
        editor.on('change', handleEditorChange);
    };

    const handleEditorChange = () => {
        // Update character count
        const charCount = editor.getValue().length;
        document.getElementById('char-count').textContent = `${charCount} characters`;
    };

    const updatePreview = () => {
        const code = editor.getValue();
        const iframe = document.getElementById('preview-frame');
        
        // Create HTML content with the user's code
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    .result { color: #333; }
                    .error { color: #d32f2f; font-weight: bold; }
                    .success { color: #388e3c; font-weight: bold; }
                </style>
            </head>
            <body>
                <script>
                    try {
                        ${code}
                    } catch (error) {
                        document.body.innerHTML += '<p class="error">Error: ' + error.message + '</p>';
                    }
                </script>
            </body>
            </html>
        `;

        iframe.srcDoc = htmlContent;
    };

    const getCode = () => {
        return editor ? editor.getValue() : '';
    };

    const setCode = (code) => {
        if (editor) {
            editor.setValue(code);
        }
    };

    const clearCode = () => {
        if (editor) {
            editor.setValue('');
        }
    };

    const focus = () => {
        if (editor) {
            editor.focus();
        }
    };

    return {
        init,
        getCode,
        setCode,
        clearCode,
        focus
    };
})();
