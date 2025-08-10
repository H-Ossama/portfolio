// Education Management System

// Global variables
let isEditingEducation = false;
let currentEducationId = null;

// Initialize education form handling
document.addEventListener('DOMContentLoaded', () => {
    initializeEducationForm();
    initializeCertificateUpload();
});

function initializeEducationForm() {
    const form = document.getElementById('education-form');
    if (form) {
        form.addEventListener('submit', handleEducationSubmit);
    }
}

function initializeCertificateUpload() {
    const certificateInput = document.getElementById('education-certificate');
    if (certificateInput) {
        certificateInput.addEventListener('change', handleCertificatePreview);
    }
}

// Handle certificate file preview
function handleCertificatePreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('education-certificate-preview');
    const nameSpan = preview.querySelector('.certificate-name');
    
    if (file) {
        nameSpan.textContent = file.name;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
}

// Remove certificate
function removeCertificate() {
    const certificateInput = document.getElementById('education-certificate');
    const existingCertificate = document.getElementById('education-existing-certificate');
    const preview = document.getElementById('education-certificate-preview');
    
    certificateInput.value = '';
    existingCertificate.value = '';
    preview.style.display = 'none';
}

// Open education modal for adding or editing
function openEducationModal(education = null) {
    const modal = document.getElementById('education-modal');
    const form = document.getElementById('education-form');
    const modalTitle = document.getElementById('education-modal-title');
    const preview = document.getElementById('education-certificate-preview');
    const nameSpan = preview.querySelector('.certificate-name');
    const existingCertificate = document.getElementById('education-existing-certificate');
    
    // Reset form
    form.reset();
    preview.style.display = 'none';
    existingCertificate.value = '';
    isEditingEducation = false;
    currentEducationId = null;
    
    if (education) {
        // Editing existing education
        modalTitle.innerHTML = '<i class="fas fa-graduation-cap"></i> Edit Education';
        isEditingEducation = true;
        currentEducationId = education.id;
        
        // Populate form fields
        document.getElementById('education-year').value = education.year || '';
        document.getElementById('education-title').value = education.title || '';
        document.getElementById('education-institution').value = education.institution || '';
        document.getElementById('education-description').value = education.description || '';
        document.getElementById('education-highlights').value = Array.isArray(education.highlights) 
            ? education.highlights.join(', ') : '';
        document.getElementById('education-skills').value = Array.isArray(education.skills) 
            ? education.skills.join(', ') : '';
        document.getElementById('education-current').checked = education.isCurrent || false;
        
        // Handle existing certificate
        if (education.certificate) {
            existingCertificate.value = education.certificate;
            nameSpan.textContent = education.certificate.split('/').pop(); // Get filename
            preview.style.display = 'block';
        }
    } else {
        // Adding new education
        modalTitle.innerHTML = '<i class="fas fa-graduation-cap"></i> Add Education';
        // Set current year as default
        document.getElementById('education-year').value = new Date().getFullYear();
    }
    
    modal.style.display = 'flex';
}

// Handle education form submission
async function handleEducationSubmit(event) {
    event.preventDefault();
    utils.showLoading();
    
    try {
        const form = event.target;
        const formData = new FormData();
        
        // Get form values
        const year = parseInt(document.getElementById('education-year').value);
        const title = document.getElementById('education-title').value.trim();
        const institution = document.getElementById('education-institution').value.trim();
        const description = document.getElementById('education-description').value.trim();
        const highlightsStr = document.getElementById('education-highlights').value.trim();
        const skillsStr = document.getElementById('education-skills').value.trim();
        const isCurrent = document.getElementById('education-current').checked;
        const certificateFile = document.getElementById('education-certificate').files[0];
        const existingCertificate = document.getElementById('education-existing-certificate').value;
        
        // Validate required fields
        if (!title || !institution) {
            throw new Error('Title and Institution are required');
        }
        
        // Process highlights and skills arrays
        const highlights = highlightsStr ? highlightsStr.split(',').map(h => h.trim()).filter(Boolean) : [];
        const skills = skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
        
        // Prepare data object
        const educationData = {
            year,
            title,
            institution,
            description,
            highlights,
            skills,
            isCurrent
        };
        
        // Handle certificate
        if (certificateFile) {
            formData.append('certificate', certificateFile);
        } else if (existingCertificate) {
            educationData.certificate = existingCertificate;
        }
        
        // Add other data to FormData
        Object.keys(educationData).forEach(key => {
            if (Array.isArray(educationData[key])) {
                formData.append(key, JSON.stringify(educationData[key]));
            } else {
                formData.append(key, educationData[key]);
            }
        });
        
        // API call
        const url = isEditingEducation ? `/api/education/${currentEducationId}` : '/api/education';
        const method = isEditingEducation ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }
        
        utils.showMessage(
            isEditingEducation ? 'Education updated successfully!' : 'Education added successfully!', 
            'success'
        );
        closeModal('education-modal');
        
        // Refresh education section
        if (navigation && navigation.navigateToSection) {
            await navigation.navigateToSection('education');
        }
        
    } catch (error) {
        console.error('Error submitting education form:', error);
        utils.showMessage(`Error: ${error.message || 'Failed to save education.'}`, 'error');
    } finally {
        utils.hideLoading();
    }
}

// Edit education function
async function editEducation(educationId) {
    try {
        utils.showLoading();
        const education = await utils.fetchWithAuth(`/api/education/${educationId}`);
        openEducationModal(education);
    } catch (error) {
        console.error('Error loading education for edit:', error);
        utils.showMessage('Failed to load education details', 'error');
    } finally {
        utils.hideLoading();
    }
}

// Delete education function
async function deleteEducation(educationId) {
    if (!confirm('Are you sure you want to delete this education entry?')) {
        return;
    }
    
    try {
        utils.showLoading();
        await utils.fetchWithAuth(`/api/education/${educationId}`, {
            method: 'DELETE'
        });
        
        utils.showMessage('Education deleted successfully', 'success');
        
        // Refresh education section
        if (navigation && navigation.navigateToSection) {
            await navigation.navigateToSection('education');
        }
        
    } catch (error) {
        console.error('Error deleting education:', error);
        utils.showMessage('Failed to delete education', 'error');
    } finally {
        utils.hideLoading();
    }
}

// Enhanced education card rendering (will be called from dashboard.js)
function renderEducationCardEnhanced(edu) {
    const currentBadge = edu.isCurrent ? '<span class="current-badge">Current</span>' : '';
    const certificateBtn = edu.certificate ? 
        `<button onclick="viewCertificate('${edu.certificate}')" class="action-btn view-cert-btn" title="View Certificate">
            <i class="fas fa-certificate"></i>
        </button>` : '';
    
    return `
        <div class="education-card" data-id="${edu.id}">
            <div class="education-year">
                ${edu.year}
                ${currentBadge}
            </div>
            <div class="education-content">
                <div class="education-header">
                    <h3>${edu.title}</h3>
                    <h4>${edu.institution}</h4>
                    ${edu.description ? `<p class="education-description">${edu.description}</p>` : ''}
                </div>
                ${edu.highlights && edu.highlights.length > 0 ? `
                    <ul class="education-highlights">
                        ${edu.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                ` : ''}
                ${edu.skills && edu.skills.length > 0 ? `
                    <div class="education-skills">
                        ${edu.skills.map(skill => `<span class="edu-skill-tag">${skill}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="education-actions">
                    ${certificateBtn}
                    <button onclick="editEducation('${edu.id}')" class="action-btn edit-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteEducation('${edu.id}')" class="action-btn delete-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// View certificate function
function viewCertificate(certificatePath) {
    window.open(certificatePath, '_blank');
}

// Make functions globally available
window.editEducation = editEducation;
window.deleteEducation = deleteEducation;
window.openEducationModal = openEducationModal;
window.removeCertificate = removeCertificate;
window.viewCertificate = viewCertificate;
window.renderEducationCardEnhanced = renderEducationCardEnhanced;
