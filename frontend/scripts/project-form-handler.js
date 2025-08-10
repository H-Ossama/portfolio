// Clean Project Form Handler
// This file provides a clean project form submission handler

// Project form handler
function initializeProjectFormHandler() {
    const projectForm = document.getElementById('project-form');
    
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const editId = form.dataset.editId;

            try {
                utils.showLoading();
                
                // Get form data
                const title = form.querySelector('#project-title')?.value || '';
                const description = form.querySelector('#project-description')?.value || '';
                const technologiesStr = form.querySelector('#project-technologies')?.value || '';
                const githubLink = form.querySelector('#project-github')?.value || '';
                const liveLink = form.querySelector('#project-live')?.value || '';
                
                // Basic validation
                if (!title.trim()) {
                    throw new Error('Project title is required');
                }
                if (!description.trim()) {
                    throw new Error('Project description is required');
                }
                if (!technologiesStr.trim()) {
                    throw new Error('At least one technology is required');
                }

                const technologies = technologiesStr.split(',').map(tech => tech.trim()).filter(Boolean);

                const data = {
                    title: title.trim(),
                    description: description.trim(),
                    technologies,
                    githubLink: githubLink.trim() || '#',
                    liveLink: liveLink.trim() || '#',
                    image: 'assets/images/project-placeholder.svg'
                };

                if (editId) {
                    await utils.fetchWithAuth(`/api/projects/${editId}`, {
                        method: 'PUT',
                        body: data
                    });
                    utils.showMessage('Project updated successfully', 'success');
                } else {
                    await utils.fetchWithAuth('/api/projects', {
                        method: 'POST',
                        body: data
                    });
                    utils.showMessage('Project added successfully', 'success');
                }

                // Reset form and close modal
                form.reset();
                delete form.dataset.editId;
                closeModal('project-modal');
                
                // Reload projects section
                await navigation.navigateToSection('projects');
                
            } catch (error) {
                utils.showMessage(error.message || 'Failed to save project', 'error');
                console.error('Project save error:', error);
            } finally {
                utils.hideLoading();
            }
        });
    }
}

// Initialize when called
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProjectFormHandler);
    } else {
        initializeProjectFormHandler();
    }
}
