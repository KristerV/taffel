// UI management for navbar buttons
const NavbarButtonsUI = {
  // Button configurations
  buttonConfigs: [
    {
      id: 'navbar-btn-dashboard',
      text: 'Minu töölaud',
      href: '#/',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 5V7H15V5H19ZM9 5V11H5V5H9ZM19 13V19H15V13H19ZM9 17V19H5V17H9ZM21 3H13V9H21V3ZM11 3H3V13H11V3ZM21 11H13V21H21V11ZM11 15H3V21H11V15Z"/>
      </svg>`
    },
    {
      id: 'navbar-btn-timetable',
      text: 'Minu tunniplaan',
      href: '#/timetable/personalGeneralTimetable?_menu',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
      </svg>`
    },
    {
      id: 'navbar-btn-journals',
      text: 'Päevikud',
      href: '#/journals',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>`
    }
  ],

  // Inject buttons into navbar
  injectButtons() {
    // Find the navbar left section (where logo and breadcrumb are)
    const toolbar = document.querySelector('#main-toolbar');

    if (!toolbar) return;

    // Check if we've already injected
    if (document.getElementById('navbar-btn-dashboard')) return;

    // Find the breadcrumb wrapper or the first flex div
    const breadcrumbWrapper = toolbar.querySelector('#breadcrumb-wrapper') ||
                               toolbar.querySelector('.layout-row.flex');

    if (!breadcrumbWrapper) return;

    // Create container for our buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'tahvel-navbar-buttons';
    buttonContainer.className = 'tahvel-navbar-buttons-container';

    // Create each button
    this.buttonConfigs.forEach(config => {
      const button = this.createButton(config);
      buttonContainer.appendChild(button);
    });

    // Insert after breadcrumb wrapper
    breadcrumbWrapper.parentNode.insertBefore(buttonContainer, breadcrumbWrapper.nextSibling);

    console.log('NavbarButtons: Injected navigation buttons');
  },

  // Create a single button element
  createButton(config) {
    const link = document.createElement('a');
    link.id = config.id;
    link.className = 'tahvel-navbar-button';
    link.href = config.href;

    // Create button content with icon and text
    link.innerHTML = `
      <span class="tahvel-navbar-button-icon">${config.icon}</span>
      <span class="tahvel-navbar-button-text">${config.text}</span>
    `;

    // Highlight active button based on current URL
    if (window.location.hash === config.href ||
        (config.href !== '#/' && window.location.hash.startsWith(config.href.split('?')[0]))) {
      link.classList.add('active');
    }

    return link;
  },

  // Update active state when navigation occurs
  updateActiveButton() {
    this.buttonConfigs.forEach(config => {
      const button = document.getElementById(config.id);
      if (!button) return;

      if (window.location.hash === config.href ||
          (config.href !== '#/' && window.location.hash.startsWith(config.href.split('?')[0]))) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
};
