// Email Templates Management Module
const emailTemplatesModule = (() => {
    // DOM Elements Cache (scoped within renderTemplateEditor)
    let elements = {};    // Current template data (remains module-level)
    let currentTemplate = {
        subject: 'Reset Your Portfolio Password',
        headerColor: '#111111',
        buttonColor: 'linear-gradient(135deg, #d4af37 0%, #f2d068 100%)',
        logoUrl: '/assets/images/oussama.png', // Default logo path updated
        customMessage: 'We received a password reset request for your portfolio dashboard account. To set a new password, simply click the button below:'
    };

    // Function to generate the HTML for the editor
    const renderTemplateEditorHTML = () => {
        // Use currentTemplate defaults for initial render if needed, but loadTemplateSettings will overwrite
        return `
            <div class="email-template-wrapper">
                <div class="template-form">
                     <h4>Reset Password Email Template</h4>
                     <p class="description">Customize the appearance and content of the email sent to users when they request a password reset.</p>

                    <div class="form-group">
                        <label for="email-subject">Email Subject</label>
                        <input type="text" id="email-subject" class="form-control" placeholder="e.g., Reset Your Portfolio Password">
                    </div>

                    <div class="form-group">
                        <label for="email-custom-message">Custom Message Body</label>
                        <textarea id="email-custom-message" class="form-control" rows="4" placeholder="Enter the main text content of the email..."></textarea>
                    </div>

                    <div class="form-group">
                        <label>Design Customization</label>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                            <div class="color-picker-wrapper">
                                <label for="email-header-color" style="margin-bottom: 0;">Header BG</label>
                                <input type="color" id="email-header-color" class="color-picker" title="Header Background Color">
                            </div>
                            <div class="color-picker-wrapper">
                                <label for="email-button-color" style="margin-bottom: 0;">Button Base</label>
                                <input type="color" id="email-button-color" class="color-picker" title="Button Base Color">
                            </div>
                        </div>
                         <div class="checkbox-wrapper">
                            <input type="checkbox" id="use-gradient">
                            <label for="use-gradient">Use Gold Gradient for Button</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email-logo-upload">Email Logo</label>
                        <div class="logo-upload-container">
                            <div class="current-logo">
                                <img id="logo-preview" src="${currentTemplate.logoUrl || '/assets/images/oussama.png'}" alt="Email Logo Preview">
                            </div>
                            <div class="upload-controls">
                                <label for="email-logo-upload" class="upload-btn">
                                    <i class="fas fa-upload"></i>
                                    <span>Upload Logo</span>
                                </label>
                                <input type="file" id="email-logo-upload" accept="image/*" hidden>
                                <small>Max 1MB (JPG, PNG). Recommended: 80x80px.</small>
                            </div>
                        </div>
                        <label for="email-logo-url">Or enter logo URL</label>
                        <input type="text" id="email-logo-url" class="form-control" placeholder="https://example.com/logo.png">
                    </div>


                    <div class="template-actions">
                        <button id="reset-template" class="btn btn-outline"><i class="fas fa-undo"></i> Reset to Default</button>
                        <button id="save-template" class="btn btn-primary"><i class="fas fa-save"></i> Save Template</button>
                    </div>
                </div>

                <div class="template-preview">
                    <h4>Live Preview</h4>
                    <div class="preview-container">
                        <iframe id="preview-frame" title="Email Preview" sandbox="allow-same-origin"></iframe> {/* Added sandbox attribute */}
                    </div>
                </div>
            </div>
        `;
    };

    // Main function called by profile.js to render the editor into a container
    const renderTemplateEditor = async (containerElement) => {
        if (!containerElement) {
            console.error("Email template editor container not provided.");
            return;
        }

        // Render the HTML structure
        containerElement.innerHTML = renderTemplateEditorHTML();        // Cache DOM elements within the container
        elements = {
            subjectInput: containerElement.querySelector('#email-subject'),
            headerColorPicker: containerElement.querySelector('#email-header-color'),
            buttonColorPicker: containerElement.querySelector('#email-button-color'),
            useGradientCheckbox: containerElement.querySelector('#use-gradient'),
            logoUrlInput: containerElement.querySelector('#email-logo-url'),
            logoUploadInput: containerElement.querySelector('#email-logo-upload'),
            logoPreview: containerElement.querySelector('#logo-preview'),
            customMessageTextarea: containerElement.querySelector('#email-custom-message'),
            resetButton: containerElement.querySelector('#reset-template'),
            saveButton: containerElement.querySelector('#save-template'),
            previewFrame: containerElement.querySelector('#preview-frame')
        };

        // Load data, setup listeners, and update preview
        await loadTemplateSettings(); // Populates form fields
        setupEventListeners(); // Attaches listeners to cached elements
        updatePreview(); // Renders initial preview
    };

    // Load template settings from the server
    const loadTemplateSettings = async () => {
        try {
            // Use utils.fetchWithAuth if available, otherwise fallback to basic fetch
            const fetchFn = typeof utils !== 'undefined' && utils.fetchWithAuth ? utils.fetchWithAuth : fetch;
            const options = typeof utils !== 'undefined' && utils.fetchWithAuth ? {} : {
                 headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };

            const data = await fetchFn('/api/email-templates/password-reset', options);

            // If using basic fetch, check response.ok and parse JSON
            if (typeof utils === 'undefined' || !utils.fetchWithAuth) {
                 if (!data.ok) {
                    throw new Error('Failed to load template settings');
                 }
                 currentTemplate = await data.json();
            } else {
                currentTemplate = data; // fetchWithAuth already parsed JSON
            }

            // Update form fields using cached elements
            if (elements.subjectInput) elements.subjectInput.value = currentTemplate.subject || '';
            if (elements.customMessageTextarea) elements.customMessageTextarea.value = currentTemplate.customMessage || '';
            if (elements.logoUrlInput) elements.logoUrlInput.value = currentTemplate.logoUrl || '';

            // Handle color fields
            if (elements.headerColorPicker && currentTemplate.headerColor) {
                elements.headerColorPicker.value = currentTemplate.headerColor;
            }

            // Handle button color (could be gradient or solid)
            if (elements.buttonColorPicker && elements.useGradientCheckbox && currentTemplate.buttonColor) {
                if (currentTemplate.buttonColor.includes('linear-gradient')) {
                    elements.useGradientCheckbox.checked = true;
                    const colorMatch = currentTemplate.buttonColor.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/);
                    if (colorMatch) {
                        elements.buttonColorPicker.value = colorMatch[0];
                    }
                } else {
                    elements.useGradientCheckbox.checked = false;
                    elements.buttonColorPicker.value = currentTemplate.buttonColor;
                }
            }

        } catch (error) {
            console.error('Error loading email template settings:', error);
            // Use utils.showMessage if available
            if (typeof utils !== 'undefined' && utils.showMessage) {
                utils.showMessage('Failed to load email template settings', 'error');
            } else {
                alert('Failed to load email template settings');
            }
        }
    };

    // Save template settings to the server
    const saveTemplateSettings = async () => {
        try {
            // Get values from cached elements
            const subject = elements.subjectInput.value;
            const customMessage = elements.customMessageTextarea.value;
            const logoUrl = elements.logoUrlInput.value;
            const headerColor = elements.headerColorPicker.value;

            let buttonColor;
            if (elements.useGradientCheckbox.checked) {
                const baseColor = elements.buttonColorPicker.value;
                const lighterColor = generateLighterShade(baseColor);
                buttonColor = `linear-gradient(135deg, ${baseColor} 0%, ${lighterColor} 100%)`;
            } else {
                buttonColor = elements.buttonColorPicker.value;
            }

            const updatedTemplate = {
                subject,
                headerColor,
                buttonColor,
                logoUrl,
                customMessage
            };

            // Use utils.fetchWithAuth if available
            const fetchFn = typeof utils !== 'undefined' && utils.fetchWithAuth ? utils.fetchWithAuth : fetch;
            const options = {
                method: 'PUT',
                body: updatedTemplate // fetchWithAuth handles stringify
            };
             if (typeof utils === 'undefined' || !utils.fetchWithAuth) {
                 options.headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                 };
                 options.body = JSON.stringify(updatedTemplate);
             }

            const response = await fetchFn('/api/email-templates/password-reset', options);

            // If using basic fetch, check response.ok
            if (typeof utils === 'undefined' || !utils.fetchWithAuth) {
                 if (!response.ok) {
                    throw new Error('Failed to save template settings');
                 }
            }
            // If using fetchWithAuth, it throws on non-ok status automatically

            currentTemplate = updatedTemplate; // Update local state on success

            if (typeof utils !== 'undefined' && utils.showMessage) {
                utils.showMessage('Email template settings saved successfully', 'success');
            } else {
                alert('Email template settings saved successfully');
            }

        } catch (error) {
            console.error('Error saving email template settings:', error);
             if (typeof utils !== 'undefined' && utils.showMessage) {
                utils.showMessage(`Failed to save email template settings: ${error.message}`, 'error');
            } else {
                alert(`Failed to save email template settings: ${error.message}`);
            }
        }
    };

    // Generate a lighter shade of a color for gradients
    const generateLighterShade = (hexColor) => {
        // ... (keep existing implementation)
        let r = parseInt(hexColor.slice(1, 3), 16);
        let g = parseInt(hexColor.slice(3, 5), 16);
        let b = parseInt(hexColor.slice(5, 7), 16);
        r = Math.min(255, Math.floor(r + (255 - r) * 0.3));
        g = Math.min(255, Math.floor(g + (255 - g) * 0.3));
        b = Math.min(255, Math.floor(b + (255 - b) * 0.3));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // Update the preview iframe with current template settings
    const updatePreview = () => {
        if (!elements.previewFrame) return; // Ensure preview frame exists

        // Get current values from cached elements
        const subject = elements.subjectInput.value;
        const customMessage = elements.customMessageTextarea.value;
        const logoUrl = elements.logoUrlInput.value;
        const headerColor = elements.headerColorPicker.value;

        let buttonColor;
        if (elements.useGradientCheckbox.checked) {
            const baseColor = elements.buttonColorPicker.value;
            const lighterColor = generateLighterShade(baseColor);
            buttonColor = `linear-gradient(135deg, ${baseColor} 0%, ${lighterColor} 100%)`;
        } else {
            buttonColor = elements.buttonColorPicker.value;
        }

        let buttonColorStart = buttonColor;
        if (buttonColor.includes('linear-gradient')) {
            const colorMatches = buttonColor.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/g);
            if (colorMatches && colorMatches.length >= 1) {
                buttonColorStart = colorMatches[0];
            }
        }

        // Generate preview HTML (keep existing structure)
        const previewHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
                <style>
                    /* ... (keep existing styles) ... */
                    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; }
                    .wrapper { max-width: 550px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1); }
                    .header { text-align: center; padding: 25px 0; background: ${headerColor}; position: relative; }
                    .logo-container { width: 80px; height: 80px; margin: 0 auto; position: relative; z-index: 2; }
                    .logo-container img { width: 100%; height: 100%; border-radius: 50%; border: 3px solid ${buttonColorStart}; box-shadow: 0 4px 8px rgba(0,0,0,0.3); object-fit: cover; }
                    .gold-accent { position: absolute; bottom: 0; left: 0; right: 0; height: 5px; background: ${buttonColor}; }
                    .content { padding: 25px 20px; text-align: center; }
                    h1 { color: #333; font-size: 20px; font-weight: 600; margin-top: 0; }
                    .message { margin: 15px 0; color: #555; font-size: 14px; line-height: 1.6; text-align: left; }
                    .reset-button { display: inline-block; background: ${buttonColor}; color: ${isColorDark(buttonColorStart) ? '#fff' : '#111'} !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 10px 24px; margin: 15px 0 10px; border-radius: 30px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); }
                    .time-banner { background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 8px 12px; margin: 15px 0; text-align: left; font-size: 12px; color: #856404; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="header">
                        <div class="logo-container">
                            <img src="${logoUrl}" alt="Logo">
                        </div>
                        <div class="gold-accent"></div>
                    </div>
                    <div class="content">
                        <h1>Reset Your Password</h1>
                        <div class="message">Hello,<br><br>${customMessage}</div>
                        <a href="#" class="reset-button">Reset Password</a>
                        <div class="time-banner"><strong>⏰ Time-Sensitive:</strong> This link will expire in 1 hour for security.</div>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Update iframe content
        const iframeDoc = elements.previewFrame.contentDocument || elements.previewFrame.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(previewHTML);
        iframeDoc.close();
    };

    // Check if a color is dark (for button text contrast)
    const isColorDark = (hexColor) => {
        // ... (keep existing implementation)
        if (!hexColor || hexColor.length < 4) return true; // Default to dark if invalid
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq < 128;
    };

    // Set up event listeners using cached elements
    const setupEventListeners = () => {
        // Ensure elements are cached before adding listeners
        if (!elements.headerColorPicker) return;

        elements.headerColorPicker.addEventListener('input', updatePreview);
        elements.buttonColorPicker.addEventListener('input', updatePreview);
        elements.subjectInput.addEventListener('input', updatePreview);
        elements.customMessageTextarea.addEventListener('input', updatePreview);
        elements.logoUrlInput.addEventListener('input', updatePreview);
        elements.useGradientCheckbox.addEventListener('change', updatePreview);
        elements.saveButton.addEventListener('click', saveTemplateSettings);
        
        // Add event listener for logo image upload
        if (elements.logoUploadInput) {
            elements.logoUploadInput.addEventListener('change', handleLogoUpload);
        }

        elements.resetButton.addEventListener('click', () => {
            // Reset to defaults
            const defaultTemplate = {
                subject: 'Reset Your Portfolio Password',
                headerColor: '#111111',
                buttonColor: 'linear-gradient(135deg, #d4af37 0%, #f2d068 100%)',
                logoUrl: '/assets/images/oussama.png', // Updated default logo path
                customMessage: 'We received a password reset request for your portfolio dashboard account. To set a new password, simply click the button below:'
            };

            // Update form fields
            elements.subjectInput.value = defaultTemplate.subject;
            elements.customMessageTextarea.value = defaultTemplate.customMessage;
            elements.logoUrlInput.value = defaultTemplate.logoUrl;
            elements.headerColorPicker.value = '#111111';
            elements.buttonColorPicker.value = '#d4af37'; // Base color for gradient
            elements.useGradientCheckbox.checked = true;
            
            // Update logo preview
            if (elements.logoPreview) {
                elements.logoPreview.src = defaultTemplate.logoUrl;
            }

            // Update preview
            updatePreview();
        });
    };
    
    // Handle logo image upload
    const handleLogoUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file is an image
        if (!file.type.startsWith('image/')) {
            if (typeof utils !== 'undefined' && utils.showMessage) {
                utils.showMessage('Please select a valid image file', 'error');
            } else {
                alert('Please select a valid image file');
            }
            return;
        }
        
        // Validate file size (max 1MB)
        if (file.size > 1024 * 1024) {
            if (typeof utils !== 'undefined' && utils.showMessage) {
                utils.showMessage('Image size should be less than 1MB', 'error');
            } else {
                alert('Image size should be less than 1MB');
            }
            return;
        }
        
        // Create a FormData object to send the file to the server
        const formData = new FormData();
        formData.append('emailLogo', file);
        
        // Show loading if utils is available
        if (typeof utils !== 'undefined' && utils.showLoading) {
            utils.showLoading();
        }
        
        // First, preview the image locally
        const reader = new FileReader();
        reader.onload = (e) => {
            if (elements.logoPreview) {
                elements.logoPreview.src = e.target.result;
            }
            
            // Also update the URL input to indicate it's a local file
            if (elements.logoUrlInput) {
                elements.logoUrlInput.value = 'Uploading...';
            }
            
            // Update preview with temporary local image
            updatePreview();
        };
        reader.readAsDataURL(file);
        
        // Then upload to server
        fetch(config.getApiPath('/api/upload/email-logo'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to upload logo');
            }
            return response.json();
        })
        .then(data => {
            // Update the URL input with the path returned from server
            if (elements.logoUrlInput) {
                elements.logoUrlInput.value = data.logoUrl;
            }
            
            // Update preview with the actual server path
            updatePreview();
            
            if (typeof utils !== 'undefined' && utils.showMessage) {
                utils.showMessage('Logo uploaded successfully', 'success');
            }
        })
        .catch(error => {
            console.error('Error uploading logo:', error);
            
            // Revert to default logo if upload fails
            if (elements.logoPreview) {
                elements.logoPreview.src = currentTemplate.logoUrl;
            }
            
            if (elements.logoUrlInput) {
                elements.logoUrlInput.value = currentTemplate.logoUrl;
            }
            
            if (typeof utils !== 'undefined' && utils.showMessage) {
                utils.showMessage('Failed to upload logo: ' + error.message, 'error');
            } else {
                alert('Failed to upload logo: ' + error.message);
            }
        })
        .finally(() => {
            // Hide loading if utils is available
            if (typeof utils !== 'undefined' && utils.hideLoading) {
                utils.hideLoading();
            }
        });
    };

    // Remove the old init and DashboardReady listener
    // // Initialize when dashboard is ready
    // document.addEventListener('DashboardReady', () => {
    //     emailTemplatesModule.init(); // Old init is removed
    // });

    // Return the public function needed by profile.js
    return {
        renderTemplateEditor
    };
})();
