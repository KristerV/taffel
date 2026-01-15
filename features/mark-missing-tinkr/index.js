// Mark Missing from Tinkr Feature
const MarkMissingTinkr = {
  init() {
    // Register button with shared button injection system
    ButtonInjection.registerButton({
      id: 'mark-missing-tinkr-btn',
      text: 'Märgi Tinkr puudujad',
      className: 'tahvel-brand-button mark-missing-tinkr-button',
      onClick: () => this.handleMarkMissingTinkr()
    });
  },

  handleMarkMissingTinkr() {
    // Show popup for Tinkr data input
    MarkMissingTinkrUI.showPopup(
      (data, minPercentage, minRecent) => this.processTinkrData(data, minPercentage, minRecent),
      () => {
        // Cancel callback
        console.log('Tinkr marking cancelled');
      }
    );
  },

  async processTinkrData(tinkrText, minPercentage, minRecent) {
    const btnId = 'mark-missing-tinkr-btn';

    try {
      // Disable submit button
      MarkMissingTinkrUI.setSubmitEnabled(false);
      MarkMissingTinkrUI.showStatus('Töötlen andmeid...', 'info');

      // Parse Tinkr data
      const students = TinkrParser.parse(tinkrText);

      // Validate
      const validation = TinkrParser.validate(students);
      if (!validation.valid) {
        MarkMissingTinkrUI.showStatus(
          `Viga: ${validation.errors.join(', ')}`,
          'error'
        );
        MarkMissingTinkrUI.setSubmitEnabled(true);
        return;
      }

      // Show parsing results
      const toMark = TinkrParser.filterShouldBeMarkedMissing(students, minPercentage, minRecent);
      MarkMissingTinkrUI.showStatus(
        `Leitud ${students.length} õpilast, neist ${toMark.length} tuleb märkida puudujaks. Märgin...`,
        'info'
      );

      // Disable the main button too
      ButtonInjection.setButtonEnabled(btnId, false);
      ButtonInjection.updateButtonText(btnId, 'Märgin...');

      // Match and mark students
      const results = await MarkMissingTinkrAPI.matchAndMarkStudents(
        students,
        minPercentage,
        minRecent,
        (progress) => {
          // Update status during processing
          MarkMissingTinkrUI.showStatus(
            `Märgitud ${progress.marked}/${progress.matched} sobivat õpilast...`,
            'info'
          );
        }
      );

      // Show results
      MarkMissingTinkrUI.showResults(results);

      // Update main button
      ButtonInjection.updateButtonText(btnId, `✓ ${results.marked} märgitud`);

      // Reset main button after 3 seconds
      setTimeout(() => {
        ButtonInjection.updateButtonText(btnId, 'Märgi Tinkr puudujad');
        ButtonInjection.setButtonEnabled(btnId, true);
      }, 3000);

    } catch (error) {
      console.error('Error processing Tinkr data:', error);
      MarkMissingTinkrUI.showStatus(
        `Viga: ${error.message}`,
        'error'
      );
      MarkMissingTinkrUI.setSubmitEnabled(true);

      // Reset main button
      ButtonInjection.updateButtonText(btnId, 'Märgi Tinkr puudujad');
      ButtonInjection.setButtonEnabled(btnId, true);
    }
  }
};
